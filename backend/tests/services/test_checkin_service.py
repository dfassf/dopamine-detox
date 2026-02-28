import json
import uuid
from datetime import date, timedelta
from unittest.mock import patch

from sqlalchemy.orm import Session

from app.models import (
    Abstinence,
    Checkin,
    TimelineEvent,
    TimelineStage,
    User,
)
from app.services.auth_service import hash_password
from app.services.checkin_service import get_next_checkin_date, process_checkin


def _create_user_and_abstinence(db: Session, start_days_ago: int = 10):
    user = User(
        id=uuid.uuid4(),
        email=f"checkin-{uuid.uuid4().hex[:6]}@test.com",
        password_hash=hash_password("pass1234"),
        nickname="체크인테스트",
    )
    db.add(user)
    db.flush()

    abstinence = Abstinence(
        id=uuid.uuid4(),
        user_id=user.id,
        type="alcohol",
        label="금주",
        start_date=date.today() - timedelta(days=start_days_ago),
        config='{"weight": 80}',
    )
    db.add(abstinence)
    db.flush()

    return user, abstinence


def _add_timeline(db: Session, abstinence: Abstinence):
    stage = TimelineStage(
        abstinence_id=abstinence.id,
        stage_num=1,
        name="해독기",
        day_from=1,
        day_to=30,
        summary="해독",
    )
    db.add(stage)
    db.flush()

    for day in [5, 15, 20, 25]:
        event = TimelineEvent(
            stage_id=stage.id,
            day=day,
            fact=f"D+{day}",
            feeling=f"feel-{day}",
            action=f"act-{day}",
            is_proactive=False,
        )
        db.add(event)

    db.commit()
    return stage


class TestProcessCheckin:
    def test_no_remaining_events(self, db: Session):
        user, abstinence = _create_user_and_abstinence(db, start_days_ago=100)

        stage = TimelineStage(
            abstinence_id=abstinence.id,
            stage_num=1,
            name="완료",
            day_from=1,
            day_to=7,
            summary="완료",
        )
        db.add(stage)
        db.flush()

        event = TimelineEvent(
            stage_id=stage.id, day=3, fact="test", is_proactive=False,
        )
        db.add(event)
        db.commit()

        checkin = Checkin(
            abstinence_id=abstinence.id,
            week=1,
            answers='{"craving": "no"}',
        )
        db.add(checkin)
        db.commit()

        result = process_checkin(abstinence, checkin, db)
        assert "완료" in result

    @patch("app.services.checkin_service.settings")
    def test_no_api_key(self, mock_settings, db: Session):
        mock_settings.GEMINI_API_KEY = ""

        user, abstinence = _create_user_and_abstinence(db)
        _add_timeline(db, abstinence)

        checkin = Checkin(
            abstinence_id=abstinence.id,
            week=1,
            answers='{"craving": "no"}',
        )
        db.add(checkin)
        db.commit()

        result = process_checkin(abstinence, checkin, db)
        assert "기록" in result

    @patch("app.services.checkin_service._call_gemini")
    @patch("app.services.checkin_service.settings")
    def test_with_api_key_mocked(self, mock_settings, mock_gemini, db: Session):
        mock_settings.GEMINI_API_KEY = "fake-key"
        mock_gemini.return_value = json.dumps({
            "events": [],
            "summary": "타임라인이 조정되었습니다.",
        })

        user, abstinence = _create_user_and_abstinence(db)
        _add_timeline(db, abstinence)

        checkin = Checkin(
            abstinence_id=abstinence.id,
            week=1,
            answers='{"craving": "no"}',
        )
        db.add(checkin)
        db.commit()

        result = process_checkin(abstinence, checkin, db)
        assert "조정" in result

    @patch("app.services.checkin_service._call_gemini")
    @patch("app.services.checkin_service.settings")
    def test_api_error(self, mock_settings, mock_gemini, db: Session):
        mock_settings.GEMINI_API_KEY = "fake-key"
        mock_gemini.side_effect = Exception("API error")

        user, abstinence = _create_user_and_abstinence(db)
        _add_timeline(db, abstinence)

        checkin = Checkin(
            abstinence_id=abstinence.id,
            week=1,
            answers='{"craving": "yes"}',
        )
        db.add(checkin)
        db.commit()

        result = process_checkin(abstinence, checkin, db)
        assert "오류" in result


class TestGetNextCheckinDate:
    def test_no_previous_checkin(self, db: Session):
        user, abstinence = _create_user_and_abstinence(db)
        db.commit()

        result = get_next_checkin_date(abstinence.id, db)
        assert result == date.today() + timedelta(days=7)

    def test_with_previous_checkin(self, db: Session):
        user, abstinence = _create_user_and_abstinence(db)

        checkin = Checkin(
            abstinence_id=abstinence.id,
            week=1,
            answers="{}",
            date=date.today() - timedelta(days=3),
        )
        db.add(checkin)
        db.commit()

        result = get_next_checkin_date(abstinence.id, db)
        assert result == date.today() - timedelta(days=3) + timedelta(days=7)
