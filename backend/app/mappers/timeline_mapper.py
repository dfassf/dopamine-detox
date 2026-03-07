from typing import Literal, Sequence

from app.models import TimelineEvent, TimelineStage
from app.schemas import CurrentStageResponse, EventResponse, StageResponse

StageStatus = Literal["completed", "current", "upcoming"]


def resolve_stage_status(stage: TimelineStage, current_day: int) -> StageStatus:
    if current_day > stage.day_to:
        return "completed"
    if stage.day_from <= current_day <= stage.day_to:
        return "current"
    return "upcoming"


def find_current_stage(
    stages: Sequence[TimelineStage],
    current_day: int,
) -> TimelineStage | None:
    for stage in stages:
        if stage.day_from <= current_day <= stage.day_to:
            return stage

    if not stages:
        return None

    if current_day > stages[-1].day_to:
        return stages[-1]

    return stages[0]


def build_current_stage_response(
    stage: TimelineStage | None,
    current_day: int,
) -> CurrentStageResponse:
    if not stage:
        return CurrentStageResponse(
            stage=1,
            name="",
            day_from=1,
            day_to=1,
            summary="",
            progress_in_stage=0.0,
            days_to_next_stage=0,
        )

    total_days = stage.day_to - stage.day_from + 1
    days_in = current_day - stage.day_from
    progress = min(max(days_in / total_days, 0.0), 1.0)
    days_to_next = max(stage.day_to - current_day + 1, 0)

    return CurrentStageResponse(
        stage=stage.stage_num,
        name=stage.name,
        day_from=stage.day_from,
        day_to=stage.day_to,
        summary=stage.summary,
        progress_in_stage=round(progress, 2),
        days_to_next_stage=days_to_next,
    )


def build_event_response(
    event: TimelineEvent,
    stage_status: StageStatus,
    current_day: int,
) -> EventResponse:
    if stage_status == "completed" or current_day >= event.day:
        event_status: Literal["past", "current", "upcoming"] = "past"
    elif event.day - current_day <= 3:
        event_status = "current"
    else:
        event_status = "upcoming"

    return EventResponse(
        day=event.day,
        fact=event.fact,
        feeling=event.feeling,
        action=event.action,
        is_proactive=event.is_proactive,
        status=event_status,
    )


def build_stage_response(
    stage: TimelineStage,
    status: StageStatus,
    events: list[EventResponse] | None,
) -> StageResponse:
    return StageResponse(
        stage=stage.stage_num,
        name=stage.name,
        day_from=stage.day_from,
        day_to=stage.day_to,
        summary=stage.summary,
        status=status,
        events=events,
    )
