from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Abstinence, Checkin, TimelineEvent, TimelineStage, User
from app.schemas import DashboardAbstinence, DashboardResponse, TodayMessage

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    abstinences = db.query(Abstinence).filter(Abstinence.user_id == user.id).all()

    today_messages: list[TodayMessage] = []
    abstinence_items: list[DashboardAbstinence] = []
    has_pending_checkin = False

    for a in abstinences:
        current_day = (date.today() - a.start_date).days + 1
        current_day = max(current_day, 1)

        # 현재 단계 찾기
        stages = (
            db.query(TimelineStage)
            .filter(TimelineStage.abstinence_id == a.id)
            .order_by(TimelineStage.stage_num)
            .all()
        )

        current_stage_info = {"stage": 0, "name": "", "total_stages": len(stages), "days_to_next_stage": 0}
        for s in stages:
            if s.day_from <= current_day <= s.day_to:
                current_stage_info = {
                    "stage": s.stage_num,
                    "name": s.name,
                    "total_stages": len(stages),
                    "days_to_next_stage": max(s.day_to - current_day + 1, 0),
                }
                break
        if current_stage_info["stage"] == 0 and stages:
            if current_day > stages[-1].day_to:
                current_stage_info = {
                    "stage": stages[-1].stage_num,
                    "name": stages[-1].name,
                    "total_stages": len(stages),
                    "days_to_next_stage": 0,
                }

        abstinence_items.append(
            DashboardAbstinence(
                id=a.id,
                type=a.type,
                label=a.label,
                current_day=current_day,
                current_stage=current_stage_info,
            )
        )

        # 오늘의 메시지: current_day ±3일 범위 내 이벤트
        events = (
            db.query(TimelineEvent)
            .join(TimelineStage)
            .filter(TimelineStage.abstinence_id == a.id)
            .filter(TimelineEvent.day >= current_day - 3)
            .filter(TimelineEvent.day <= current_day + 3)
            .order_by(TimelineEvent.is_proactive.desc(), TimelineEvent.day)
            .all()
        )

        if events:
            e = events[0]  # 가장 우선순위 높은 이벤트
            today_messages.append(
                TodayMessage(
                    abstinence_id=a.id,
                    abstinence_type=a.type,
                    current_day=current_day,
                    fact=e.fact,
                    feeling=e.feeling,
                    action=e.action,
                    is_proactive=e.is_proactive,
                )
            )
        else:
            # 범위 내 이벤트 없으면 가장 가까운 upcoming 이벤트
            upcoming = (
                db.query(TimelineEvent)
                .join(TimelineStage)
                .filter(TimelineStage.abstinence_id == a.id)
                .filter(TimelineEvent.day > current_day)
                .order_by(TimelineEvent.day)
                .first()
            )
            if upcoming:
                today_messages.append(
                    TodayMessage(
                        abstinence_id=a.id,
                        abstinence_type=a.type,
                        current_day=current_day,
                        fact=upcoming.fact,
                        feeling=upcoming.feeling,
                        action=upcoming.action,
                        is_proactive=upcoming.is_proactive,
                    )
                )

        # 체크인 필요 여부: 마지막 체크인으로부터 7일 이상 경과
        last_checkin = (
            db.query(Checkin)
            .filter(Checkin.abstinence_id == a.id)
            .order_by(Checkin.date.desc())
            .first()
        )
        if current_day >= 7:
            if last_checkin is None:
                has_pending_checkin = True
            elif (date.today() - last_checkin.date) >= timedelta(days=7):
                has_pending_checkin = True

    return DashboardResponse(
        today_messages=today_messages,
        abstinences=abstinence_items,
        has_pending_checkin=has_pending_checkin,
    )
