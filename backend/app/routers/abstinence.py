import json
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.mappers.timeline_mapper import (
    build_current_stage_response,
    build_event_response,
    build_stage_response,
    find_current_stage,
    resolve_stage_status,
)
from app.models import Abstinence, Checkin, TimelineEvent, TimelineStage, User
from app.schemas import (
    AbstinenceCreateRequest,
    AbstinenceListItem,
    AbstinenceResponse,
    CheckinQuestionsResponse,
    CheckinRequest,
    CheckinResponse,
    TimelineResponse,
)
from app.services.abstinence_service import (
    build_abstinence_config,
    build_abstinence_list_item,
    calculate_checkin_week,
    calculate_current_day,
    resolve_label,
)
from app.services.checkin_service import get_next_checkin_date, process_checkin
from app.services.timeline_service import generate_timeline

CHECKINS_DIR = Path(__file__).resolve().parent.parent / "data" / "checkins"

router = APIRouter(prefix="/api/abstinence", tags=["abstinence"])


@router.post("", response_model=AbstinenceResponse, status_code=201)
def create_abstinence(
    body: AbstinenceCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.birth_year is None:
        user.birth_year = body.birth_year
    if user.gender is None:
        user.gender = body.gender

    label = resolve_label(body)
    config = build_abstinence_config(body, label)

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

    timeline_ok = generate_timeline(
        abstinence=abstinence,
        config=config,
        birth_year=body.birth_year,
        gender=body.gender,
        db=db,
    )

    return AbstinenceResponse(
        id=abstinence.id,
        type=abstinence.type,
        label=abstinence.label,
        start_date=abstinence.start_date,
        current_day=calculate_current_day(abstinence.start_date),
        timeline_generated=timeline_ok,
    )


@router.get("", response_model=list[AbstinenceListItem])
def list_abstinences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = db.query(Abstinence).filter(Abstinence.user_id == user.id).all()
    return [
        build_abstinence_list_item(
            abstinence=item,
            current_day=calculate_current_day(item.start_date),
        )
        for item in items
    ]


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

    current_day = calculate_current_day(abstinence.start_date)

    stages = (
        db.query(TimelineStage)
        .filter(TimelineStage.abstinence_id == abstinence_id)
        .order_by(TimelineStage.stage_num)
        .all()
    )

    current_stage = find_current_stage(stages, current_day)
    current_stage_response = build_current_stage_response(current_stage, current_day)

    stage_responses = []
    for stage in stages:
        status = resolve_stage_status(stage, current_day)

        events = None
        if status in ("current", "completed"):
            db_events = (
                db.query(TimelineEvent)
                .filter(TimelineEvent.stage_id == stage.id)
                .order_by(TimelineEvent.day)
                .all()
            )
            events = [
                build_event_response(event, status, current_day) for event in db_events
            ]

        stage_responses.append(build_stage_response(stage, status, events))

    abstinence_item = build_abstinence_list_item(
        abstinence=abstinence,
        current_day=current_day,
    )

    return TimelineResponse(
        abstinence=abstinence_item,
        current_stage=current_stage_response,
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

    with open(path, encoding="utf-8") as file:
        data = json.load(file)

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

    current_day = calculate_current_day(abstinence.start_date)
    week = calculate_checkin_week(current_day)

    checkin = Checkin(
        abstinence_id=abstinence_id,
        week=week,
        answers=json.dumps(body.answers, ensure_ascii=False),
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

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
