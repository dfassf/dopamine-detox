import json
import logging
from datetime import date, timedelta
from uuid import UUID

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Abstinence, Checkin, TimelineEvent, TimelineStage
from app.services.gemini_utils import call_gemini, parse_json_response

logger = logging.getLogger(__name__)


def process_checkin(
    abstinence: Abstinence,
    checkin: Checkin,
    db: Session,
) -> str:
    """체크인 처리: AI로 남은 타임라인 재조정, 요약 반환."""
    current_day = (date.today() - abstinence.start_date).days + 1

    # 남은 이벤트 조회
    remaining_events = (
        db.query(TimelineEvent)
        .join(TimelineStage)
        .filter(TimelineStage.abstinence_id == abstinence.id)
        .filter(TimelineEvent.day > current_day)
        .order_by(TimelineEvent.day)
        .all()
    )

    if not remaining_events:
        return "모든 타임라인 이벤트가 완료되었습니다."

    # AI 키가 없으면 기본 메시지 반환
    if not settings.GEMINI_API_KEY:
        return "체크인이 기록되었습니다."

    # AI로 재조정
    try:
        summary = _adjust_timeline_with_ai(abstinence, checkin, remaining_events, current_day, db)
        return summary
    except (httpx.HTTPStatusError, json.JSONDecodeError, KeyError) as e:
        logger.warning("체크인 타임라인 재조정 실패: %s", e)
        return "체크인이 기록되었습니다. (타임라인 조정 중 오류가 발생했습니다)"


def _adjust_timeline_with_ai(
    abstinence: Abstinence,
    checkin: Checkin,
    remaining_events: list[TimelineEvent],
    current_day: int,
    db: Session,
) -> str:
    """Gemini API로 남은 이벤트들의 날짜/메시지를 재조정."""
    config = json.loads(abstinence.config) if abstinence.config else {}

    events_data = []
    for e in remaining_events:
        events_data.append({
            "id": e.id,
            "day": e.day,
            "fact": e.fact,
            "feeling": e.feeling,
            "action": e.action,
        })

    answers = json.loads(checkin.answers) if checkin.answers else {}
    checkin_info = "\n".join(f"- {k}: {v}" for k, v in answers.items())

    prompt = f"""사용자가 주간 체크인을 했습니다. 체크인 결과를 바탕으로 남은 타임라인 이벤트의 day 값과 메시지를 재조정해주세요.

## 디톡스 정보
- 종류: {abstinence.type}
- 시작일: {abstinence.start_date}
- 현재 D+{current_day}
- 설정: {json.dumps(config, ensure_ascii=False)}

## 이번 주 체크인 결과
{checkin_info}

## 재조정 규칙
1. 체크인 답변에서 긍정적 신호(운동 함, 수면 좋음, 도파민 충동 없음 등)가 있으면 회복 속도를 앞당기세요 (day 감소).
2. 부정적 신호(수면 나쁨, 도파민 충동 있음, 스트레스 높음 등)가 있으면 회복이 둔화됩니다 (day 증가).
3. 도파민 충동이 있었으면 격려 메시지를 추가/강화하세요.
4. 변경 폭은 ±1~5일 정도로 소폭 조정하세요.
5. 반드시 JSON만 출력하세요. 설명 없이.

## 남은 이벤트
{json.dumps(events_data, ensure_ascii=False, indent=2)}

## 출력 형식
각 이벤트의 id, 조정된 day, 조정된 fact, feeling, action을 JSON 배열로 출력하세요.
마지막에 "summary" 필드로 한 줄 요약을 추가하세요.

예:
{{"events": [...], "summary": "운동 효과 반영: 본격 변화기 진입이 3일 앞당겨졌습니다."}}"""

    response_text = call_gemini(prompt)
    result = parse_json_response(response_text)

    # DB 업데이트
    for adj in result.get("events", []):
        event = db.get(TimelineEvent, adj["id"])
        if event:
            event.day = adj["day"]
            event.fact = adj["fact"]
            if adj.get("feeling") is not None:
                event.feeling = adj["feeling"]
            if adj.get("action") is not None:
                event.action = adj["action"]

    db.commit()
    return result.get("summary", "타임라인이 업데이트되었습니다.")


def get_next_checkin_date(abstinence_id: UUID, db: Session) -> date:
    """다음 체크인 날짜 계산 (마지막 체크인 + 7일)."""
    last = (
        db.query(Checkin)
        .filter(Checkin.abstinence_id == abstinence_id)
        .order_by(Checkin.date.desc())
        .first()
    )
    if last:
        return last.date + timedelta(days=7)
    return date.today() + timedelta(days=7)
