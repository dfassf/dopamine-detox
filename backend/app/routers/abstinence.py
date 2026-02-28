import json
from datetime import date
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Abstinence, Checkin, TimelineEvent, TimelineStage, User
from app.schemas import (
    AbstinenceCreateRequest,
    AbstinenceListItem,
    AbstinenceResponse,
    CheckinQuestionsResponse,
    CheckinRequest,
    CheckinResponse,
    CurrentStageResponse,
    EventResponse,
    StageResponse,
    TimelineResponse,
)
from app.services.checkin_service import get_next_checkin_date, process_checkin
from app.services.timeline_service import LABEL_MAP, generate_timeline

CHECKINS_DIR = Path(__file__).resolve().parent.parent / "data" / "checkins"

router = APIRouter(prefix="/api/abstinence", tags=["abstinence"])


@router.post("", response_model=AbstinenceResponse, status_code=201)
def create_abstinence(
    body: AbstinenceCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 공통 정보(birth_year, gender)를 유저에 저장 (최초 1회)
    if user.birth_year is None:
        user.birth_year = body.birth_year
    if user.gender is None:
        user.gender = body.gender

    # label 결정
    label = body.label or LABEL_MAP.get(body.type, body.type)

    # config: 종류별 추가 정보를 JSON으로 묶기
    config: dict = {}
    if body.type == "alcohol":
        config = {
            "weight": body.weight,
            "height": body.height,
            "drinking_years": body.drinking_years,
            "drinking_frequency": body.drinking_frequency,
            "drinking_amount": body.drinking_amount,
        }
    elif body.type == "smoking":
        config = {
            "smoking_years": body.smoking_years,
            "daily_cigarettes": body.daily_cigarettes,
        }
    elif body.type == "diet":
        config = {
            "weight": body.weight,
            "height": body.height,
            "diet_goal": body.diet_goal,
        }
    elif body.type == "custom":
        config = {
            "label": label,
            "habit_years": body.habit_years,
        }

    abstinence = Abstinence(
        user_id=user.id,
        type=body.type,
        label=label,
        start_date=body.start_date,
        config=json.dumps(config, ensure_ascii=False),
    )
    db.add(abstinence)
    db.commit()
    db.refresh(abstinence)

    # 타임라인 생성
    timeline_ok = generate_timeline(
        abstinence=abstinence,
        config=config,
        birth_year=body.birth_year,
        gender=body.gender,
        db=db,
    )

    current_day = (date.today() - abstinence.start_date).days + 1
    return AbstinenceResponse(
        id=abstinence.id,
        type=abstinence.type,
        label=abstinence.label,
        start_date=abstinence.start_date,
        current_day=max(current_day, 1),
        timeline_generated=timeline_ok,
    )


@router.get("", response_model=list[AbstinenceListItem])
def list_abstinences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = db.query(Abstinence).filter(Abstinence.user_id == user.id).all()
    result = []
    for a in items:
        current_day = (date.today() - a.start_date).days + 1
        result.append(
            AbstinenceListItem(
                id=a.id,
                type=a.type,
                label=a.label,
                start_date=a.start_date,
                current_day=max(current_day, 1),
            )
        )
    return result


@router.get("/{abstinence_id}/timeline", response_model=TimelineResponse)
def get_timeline(
    abstinence_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    abstinence = db.query(Abstinence).filter(
        Abstinence.id == abstinence_id,
        Abstinence.user_id == user.id,
    ).first()
    if not abstinence:
        raise HTTPException(status_code=404, detail="디톡스 기록을 찾을 수 없습니다")

    current_day = (date.today() - abstinence.start_date).days + 1
    current_day = max(current_day, 1)

    stages = (
        db.query(TimelineStage)
        .filter(TimelineStage.abstinence_id == abstinence_id)
        .order_by(TimelineStage.stage_num)
        .all()
    )

    # 현재 단계 찾기
    current_stage_obj = None
    for s in stages:
        if s.day_from <= current_day <= s.day_to:
            current_stage_obj = s
            break
    if not current_stage_obj and stages:
        # 모든 단계를 지난 경우 마지막 단계
        if current_day > stages[-1].day_to:
            current_stage_obj = stages[-1]
        else:
            current_stage_obj = stages[0]

    # 현재 단계 응답
    if current_stage_obj:
        total_days = current_stage_obj.day_to - current_stage_obj.day_from + 1
        days_in = current_day - current_stage_obj.day_from
        progress = min(max(days_in / total_days, 0.0), 1.0)
        days_to_next = max(current_stage_obj.day_to - current_day + 1, 0)

        current_stage_resp = CurrentStageResponse(
            stage=current_stage_obj.stage_num,
            name=current_stage_obj.name,
            day_from=current_stage_obj.day_from,
            day_to=current_stage_obj.day_to,
            summary=current_stage_obj.summary,
            progress_in_stage=round(progress, 2),
            days_to_next_stage=days_to_next,
        )
    else:
        current_stage_resp = CurrentStageResponse(
            stage=1, name="", day_from=1, day_to=1,
            summary="", progress_in_stage=0.0, days_to_next_stage=0,
        )

    # 전체 단계 목록
    stage_responses = []
    for s in stages:
        if current_day > s.day_to:
            status = "completed"
        elif s.day_from <= current_day <= s.day_to:
            status = "current"
        else:
            status = "upcoming"

        events = None
        if status in ("current", "completed"):
            db_events = (
                db.query(TimelineEvent)
                .filter(TimelineEvent.stage_id == s.id)
                .order_by(TimelineEvent.day)
                .all()
            )
            events = []
            for e in db_events:
                if status == "completed" or current_day >= e.day:
                    e_status = "past"
                elif e.day - current_day <= 3:
                    e_status = "current"
                else:
                    e_status = "upcoming"
                events.append(
                    EventResponse(
                        day=e.day,
                        fact=e.fact,
                        feeling=e.feeling,
                        action=e.action,
                        is_proactive=e.is_proactive,
                        status=e_status,
                    )
                )

        stage_responses.append(
            StageResponse(
                stage=s.stage_num,
                name=s.name,
                day_from=s.day_from,
                day_to=s.day_to,
                summary=s.summary,
                status=status,
                events=events,
            )
        )

    abstinence_item = AbstinenceListItem(
        id=abstinence.id,
        type=abstinence.type,
        label=abstinence.label,
        start_date=abstinence.start_date,
        current_day=current_day,
    )

    return TimelineResponse(
        abstinence=abstinence_item,
        current_stage=current_stage_resp,
        stages=stage_responses,
    )


@router.get("/{abstinence_id}/checkin/questions", response_model=CheckinQuestionsResponse)
def get_checkin_questions(
    abstinence_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    abstinence = db.query(Abstinence).filter(
        Abstinence.id == abstinence_id,
        Abstinence.user_id == user.id,
    ).first()
    if not abstinence:
        raise HTTPException(status_code=404, detail="디톡스 기록을 찾을 수 없습니다")

    filename = f"{abstinence.type}.json"
    path = CHECKINS_DIR / filename
    if not path.exists():
        path = CHECKINS_DIR / "custom.json"

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    return CheckinQuestionsResponse(**data)


@router.post("/{abstinence_id}/checkin", response_model=CheckinResponse)
def create_checkin(
    abstinence_id: UUID,
    body: CheckinRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    abstinence = db.query(Abstinence).filter(
        Abstinence.id == abstinence_id,
        Abstinence.user_id == user.id,
    ).first()
    if not abstinence:
        raise HTTPException(status_code=404, detail="디톡스 기록을 찾을 수 없습니다")

    # 주차 계산
    current_day = (date.today() - abstinence.start_date).days + 1
    week = max((current_day - 1) // 7 + 1, 1)

    checkin = Checkin(
        abstinence_id=abstinence_id,
        week=week,
        answers=json.dumps(body.answers, ensure_ascii=False),
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    # AI 재조정
    summary = process_checkin(abstinence, checkin, db)
    next_date = get_next_checkin_date(abstinence_id, db)

    return CheckinResponse(
        message="체크인 완료. 타임라인이 업데이트되었습니다.",
        adjustments_summary=summary,
        next_checkin_date=next_date,
    )


@router.delete("/{abstinence_id}")
def delete_abstinence(
    abstinence_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    abstinence = db.query(Abstinence).filter(
        Abstinence.id == abstinence_id,
        Abstinence.user_id == user.id,
    ).first()
    if not abstinence:
        raise HTTPException(status_code=404, detail="디톡스 기록을 찾을 수 없습니다")

    db.delete(abstinence)
    db.commit()
    return {"message": "디톡스 기록이 삭제되었습니다"}
