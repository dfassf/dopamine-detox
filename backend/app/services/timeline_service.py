import json
from pathlib import Path

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Abstinence, TimelineEvent, TimelineStage

TIMELINES_DIR = Path(__file__).parent.parent / "data" / "timelines"

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

TEMPLATE_MAP = {
    "alcohol": "alcohol.json",
    "smoking": "smoking.json",
    "diet": "diet.json",
}

LABEL_MAP = {
    "alcohol": "금주",
    "smoking": "금연",
    "diet": "식단",
}


def load_template(abstinence_type: str) -> dict:
    filename = TEMPLATE_MAP.get(abstinence_type, "custom.json")
    path = TIMELINES_DIR / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _filter_events(events: list[dict], config: dict, gender: str | None) -> list[dict]:
    """condition 기반 이벤트 필터링 (룰 기반, AI 아님)."""
    filtered = []
    for event in events:
        cond = event.get("condition")
        if cond is None:
            filtered.append(event)
            continue

        match = True
        if "gender" in cond and gender != cond["gender"]:
            match = False
        if "has_exercise" in cond:
            has_ex = config.get("has_exercise", False)
            if has_ex != cond["has_exercise"]:
                match = False
        if "drinking_years_gte" in cond:
            years = config.get("drinking_years", 0)
            if years < cond["drinking_years_gte"]:
                match = False
        if "smoking_years_gte" in cond:
            years = config.get("smoking_years", 0)
            if years < cond["smoking_years_gte"]:
                match = False

        if match:
            filtered.append(event)

    return filtered


def _build_ai_prompt(template: dict, config: dict, abstinence_type: str, birth_year: int, gender: str) -> str:
    """Gemini API 호출용 프롬프트 생성."""
    import datetime

    age = datetime.date.today().year - birth_year

    user_info_parts = [f"나이: {age}세", f"성별: {'남성' if gender == 'male' else '여성'}"]

    if abstinence_type == "alcohol":
        if config.get("weight"):
            user_info_parts.append(f"체중: {config['weight']}kg")
        if config.get("height"):
            user_info_parts.append(f"키: {config['height']}cm")
        if config.get("drinking_years"):
            user_info_parts.append(f"음주 기간: {config['drinking_years']}년")
        if config.get("drinking_frequency"):
            user_info_parts.append(f"음주 빈도: {config['drinking_frequency']}")
        if config.get("drinking_amount"):
            user_info_parts.append(f"음주량: {config['drinking_amount']}")
    elif abstinence_type == "smoking":
        if config.get("smoking_years"):
            user_info_parts.append(f"흡연 기간: {config['smoking_years']}년")
        if config.get("daily_cigarettes"):
            user_info_parts.append(f"일일 흡연량: {config['daily_cigarettes']}개비")
    elif abstinence_type == "diet":
        if config.get("weight"):
            user_info_parts.append(f"체중: {config['weight']}kg")
        if config.get("height"):
            user_info_parts.append(f"키: {config['height']}cm")
        if config.get("diet_goal"):
            user_info_parts.append(f"목표: {config['diet_goal']}")
    elif abstinence_type == "custom":
        if config.get("label"):
            user_info_parts.append(f"디톡스 대상: {config['label']}")
        if config.get("habit_years"):
            user_info_parts.append(f"습관 기간: {config['habit_years']}년")

    user_info = "\n".join(user_info_parts)
    template_json = json.dumps(template, ensure_ascii=False, indent=2)

    return f"""아래는 도파민 디톡스 타임라인 기본 템플릿입니다. 사용자의 개인 정보를 바탕으로 이 템플릿의 날짜(day)와 메시지(fact, feeling, action)를 개인화해주세요.

## 사용자 정보
{user_info}

## 규칙
1. 각 이벤트의 day 값을 사용자의 나이, 기간, 습관 강도에 따라 조정하세요. 나이가 많거나 기간이 길면 회복이 느려져서 day가 늘어납니다.
2. fact, feeling, action 메시지를 사용자 맥락에 맞게 미세 조정하세요. 예: 운동 중인 사람에게는 운동 관련 언급 추가.
3. 단계(stage)의 day_from, day_to도 이벤트 조정에 맞춰 수정하세요.
4. 원래 없는 이벤트를 추가하거나 삭제하지 마세요. 기존 이벤트의 날짜와 메시지만 조정합니다.
5. condition 필드는 이미 필터링되었으므로 응답에 포함하지 마세요.
6. is_proactive 값은 유지하세요.
7. JSON 형식으로만 응답하세요. 설명이나 마크다운 없이 순수 JSON만 출력하세요.

## 기본 템플릿
{template_json}"""


def _call_gemini(prompt: str) -> str:
    """Gemini REST API 호출."""
    resp = httpx.post(
        GEMINI_API_URL,
        params={"key": settings.GEMINI_API_KEY},
        json={"contents": [{"parts": [{"text": prompt}]}]},
        timeout=60.0,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def _parse_json_response(text: str) -> dict:
    """AI 응답에서 JSON 파싱 (마크다운 코드블록 제거)."""
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    return json.loads(text)


def generate_timeline(
    abstinence: Abstinence,
    config: dict,
    birth_year: int,
    gender: str,
    db: Session,
) -> bool:
    """타임라인 생성: condition 필터링 → AI 개인화 → DB 저장."""
    template = load_template(abstinence.type)

    # 1. condition 기반 필터링
    filtered_template = {"stages": []}
    for stage in template["stages"]:
        filtered_events = _filter_events(stage["events"], config, gender)
        if filtered_events:
            filtered_stage = {**stage, "events": filtered_events}
            filtered_template["stages"].append(filtered_stage)

    # 2. AI 개인화 (API 키가 있을 때만)
    personalized = filtered_template
    if settings.GEMINI_API_KEY:
        try:
            prompt = _build_ai_prompt(filtered_template, config, abstinence.type, birth_year, gender)
            response_text = _call_gemini(prompt)
            personalized = _parse_json_response(response_text)
        except Exception:
            personalized = filtered_template

    # 3. DB 저장
    _save_to_db(personalized, abstinence, db)
    return True


def _save_to_db(timeline_data: dict, abstinence: Abstinence, db: Session) -> None:
    """파싱된 타임라인을 DB에 저장."""
    for stage_data in timeline_data["stages"]:
        stage = TimelineStage(
            abstinence_id=abstinence.id,
            stage_num=stage_data["stage"],
            name=stage_data["name"],
            day_from=stage_data["day_from"],
            day_to=stage_data["day_to"],
            summary=stage_data["summary"],
        )
        db.add(stage)
        db.flush()

        for event_data in stage_data["events"]:
            event = TimelineEvent(
                stage_id=stage.id,
                day=event_data["day"],
                fact=event_data["fact"],
                feeling=event_data.get("feeling"),
                action=event_data.get("action"),
                is_proactive=event_data.get("is_proactive", False),
            )
            db.add(event)

    db.commit()
