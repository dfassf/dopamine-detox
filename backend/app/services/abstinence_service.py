from datetime import date
from typing import Any

from app.schemas import AbstinenceCreateRequest, AbstinenceListItem
from app.services.timeline_service import LABEL_MAP


def calculate_current_day(start_date: date) -> int:
    return max((date.today() - start_date).days + 1, 1)


def calculate_checkin_week(current_day: int) -> int:
    return max((current_day - 1) // 7 + 1, 1)


def resolve_label(body: AbstinenceCreateRequest) -> str:
    return body.label or LABEL_MAP.get(body.type, body.type)


def build_abstinence_config(
    body: AbstinenceCreateRequest,
    label: str,
) -> dict[str, Any]:
    if body.type == "alcohol":
        return {
            "weight": body.weight,
            "height": body.height,
            "drinking_years": body.drinking_years,
            "drinking_frequency": body.drinking_frequency,
            "drinking_amount": body.drinking_amount,
        }

    if body.type == "smoking":
        return {
            "smoking_years": body.smoking_years,
            "daily_cigarettes": body.daily_cigarettes,
        }

    if body.type == "diet":
        return {
            "weight": body.weight,
            "height": body.height,
            "diet_goal": body.diet_goal,
        }

    if body.type == "custom":
        return {
            "label": label,
            "habit_years": body.habit_years,
        }

    return {}


def build_abstinence_list_item(
    abstinence: Any,
    current_day: int,
) -> AbstinenceListItem:
    return AbstinenceListItem(
        id=abstinence.id,
        type=abstinence.type,
        label=abstinence.label,
        start_date=abstinence.start_date,
        current_day=current_day,
    )
