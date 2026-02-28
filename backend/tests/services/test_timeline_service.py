import json
import uuid
from datetime import date
from unittest.mock import patch

import pytest
from sqlalchemy.orm import Session

from app.models import Abstinence, TimelineEvent, TimelineStage, User
from app.services.auth_service import hash_password
from app.services.timeline_service import (
    _build_ai_prompt,
    _filter_events,
    _parse_json_response,
    _save_to_db,
    generate_timeline,
    load_template,
)


class TestLoadTemplate:
    def test_alcohol(self):
        t = load_template("alcohol")
        assert "stages" in t

    def test_smoking(self):
        t = load_template("smoking")
        assert "stages" in t

    def test_diet(self):
        t = load_template("diet")
        assert "stages" in t

    def test_custom(self):
        t = load_template("custom")
        assert "stages" in t

    def test_unknown_falls_back_to_custom(self):
        t = load_template("unknown_type")
        custom = load_template("custom")
        assert t == custom


class TestFilterEvents:
    def test_no_condition_passes(self):
        events = [{"day": 1, "fact": "test"}]
        result = _filter_events(events, {}, None)
        assert len(result) == 1

    def test_gender_match(self):
        events = [{"day": 1, "fact": "test", "condition": {"gender": "male"}}]
        result = _filter_events(events, {}, "male")
        assert len(result) == 1

    def test_gender_mismatch(self):
        events = [{"day": 1, "fact": "test", "condition": {"gender": "male"}}]
        result = _filter_events(events, {}, "female")
        assert len(result) == 0

    def test_drinking_years_gte_pass(self):
        events = [{"day": 1, "fact": "test", "condition": {"drinking_years_gte": 5}}]
        result = _filter_events(events, {"drinking_years": 10}, None)
        assert len(result) == 1

    def test_drinking_years_gte_fail(self):
        events = [{"day": 1, "fact": "test", "condition": {"drinking_years_gte": 5}}]
        result = _filter_events(events, {"drinking_years": 3}, None)
        assert len(result) == 0

    def test_smoking_years_gte_pass(self):
        events = [{"day": 1, "fact": "test", "condition": {"smoking_years_gte": 10}}]
        result = _filter_events(events, {"smoking_years": 15}, None)
        assert len(result) == 1

    def test_smoking_years_gte_fail(self):
        events = [{"day": 1, "fact": "test", "condition": {"smoking_years_gte": 10}}]
        result = _filter_events(events, {"smoking_years": 5}, None)
        assert len(result) == 0

    def test_has_exercise_match(self):
        events = [{"day": 1, "fact": "test", "condition": {"has_exercise": True}}]
        result = _filter_events(events, {"has_exercise": True}, None)
        assert len(result) == 1

    def test_has_exercise_mismatch(self):
        events = [{"day": 1, "fact": "test", "condition": {"has_exercise": True}}]
        result = _filter_events(events, {"has_exercise": False}, None)
        assert len(result) == 0

    def test_multiple_conditions(self):
        events = [{"day": 1, "fact": "test", "condition": {"gender": "male", "drinking_years_gte": 5}}]
        result = _filter_events(events, {"drinking_years": 10}, "male")
        assert len(result) == 1

    def test_multiple_conditions_partial_fail(self):
        events = [{"day": 1, "fact": "test", "condition": {"gender": "male", "drinking_years_gte": 5}}]
        result = _filter_events(events, {"drinking_years": 10}, "female")
        assert len(result) == 0


class TestParseJsonResponse:
    def test_plain_json(self):
        text = '{"stages": []}'
        result = _parse_json_response(text)
        assert result == {"stages": []}

    def test_markdown_block(self):
        text = '```json\n{"stages": []}\n```'
        result = _parse_json_response(text)
        assert result == {"stages": []}


class TestBuildAiPrompt:
    def test_contains_user_info(self):
        template = {"stages": []}
        prompt = _build_ai_prompt(template, {}, "alcohol", 1990, "male")
        assert "남성" in prompt
        assert "도파민 디톡스" in prompt

    def test_alcohol_info(self):
        config = {"weight": 80, "drinking_years": 10}
        prompt = _build_ai_prompt({"stages": []}, config, "alcohol", 1990, "male")
        assert "체중: 80kg" in prompt
        assert "음주 기간: 10년" in prompt

    def test_smoking_info(self):
        config = {"smoking_years": 15, "daily_cigarettes": 20}
        prompt = _build_ai_prompt({"stages": []}, config, "smoking", 1990, "female")
        assert "흡연 기간: 15년" in prompt
        assert "일일 흡연량: 20개비" in prompt


class TestSaveToDb:
    def test_creates_stages_and_events(self, db: Session):
        user = User(
            id=uuid.uuid4(),
            email="save@test.com",
            password_hash=hash_password("pass1234"),
            nickname="저장테스트",
        )
        db.add(user)
        db.flush()

        abstinence = Abstinence(
            id=uuid.uuid4(),
            user_id=user.id,
            type="alcohol",
            label="금주",
            start_date=date.today(),
            config="{}",
        )
        db.add(abstinence)
        db.flush()

        timeline_data = {
            "stages": [
                {
                    "stage": 1,
                    "name": "해독기",
                    "day_from": 1,
                    "day_to": 7,
                    "summary": "해독",
                    "events": [
                        {"day": 1, "fact": "첫날", "feeling": "힘듦", "action": "물 마시기", "is_proactive": True},
                        {"day": 3, "fact": "셋째날", "is_proactive": False},
                    ],
                }
            ]
        }

        _save_to_db(timeline_data, abstinence, db)

        stages = db.query(TimelineStage).filter(TimelineStage.abstinence_id == abstinence.id).all()
        assert len(stages) == 1
        assert stages[0].name == "해독기"

        events = db.query(TimelineEvent).filter(TimelineEvent.stage_id == stages[0].id).all()
        assert len(events) == 2
        assert events[0].fact == "첫날"
        assert events[0].is_proactive is True


class TestGenerateTimeline:
    @patch("app.services.timeline_service.settings")
    def test_without_api_key(self, mock_settings, db: Session):
        mock_settings.GEMINI_API_KEY = ""

        user = User(
            id=uuid.uuid4(),
            email="gen@test.com",
            password_hash=hash_password("pass1234"),
            nickname="생성테스트",
        )
        db.add(user)
        db.flush()

        abstinence = Abstinence(
            id=uuid.uuid4(),
            user_id=user.id,
            type="alcohol",
            label="금주",
            start_date=date.today(),
            config="{}",
        )
        db.add(abstinence)
        db.flush()

        result = generate_timeline(
            abstinence=abstinence,
            config={},
            birth_year=1990,
            gender="male",
            db=db,
        )
        assert result is True

        stages = db.query(TimelineStage).filter(TimelineStage.abstinence_id == abstinence.id).all()
        assert len(stages) > 0

    @patch("app.services.timeline_service._call_gemini")
    @patch("app.services.timeline_service.settings")
    def test_with_api_key_mocked(self, mock_settings, mock_gemini, db: Session):
        mock_settings.GEMINI_API_KEY = "fake-key"

        template = load_template("alcohol")
        mock_gemini.return_value = json.dumps(template)

        user = User(
            id=uuid.uuid4(),
            email="gen2@test.com",
            password_hash=hash_password("pass1234"),
            nickname="AI테스트",
        )
        db.add(user)
        db.flush()

        abstinence = Abstinence(
            id=uuid.uuid4(),
            user_id=user.id,
            type="alcohol",
            label="금주",
            start_date=date.today(),
            config="{}",
        )
        db.add(abstinence)
        db.flush()

        result = generate_timeline(
            abstinence=abstinence,
            config={},
            birth_year=1990,
            gender="male",
            db=db,
        )
        assert result is True
        mock_gemini.assert_called_once()

    @patch("app.services.timeline_service._call_gemini")
    @patch("app.services.timeline_service.settings")
    def test_api_error_fallback(self, mock_settings, mock_gemini, db: Session):
        mock_settings.GEMINI_API_KEY = "fake-key"
        mock_gemini.side_effect = Exception("API error")

        user = User(
            id=uuid.uuid4(),
            email="gen3@test.com",
            password_hash=hash_password("pass1234"),
            nickname="에러테스트",
        )
        db.add(user)
        db.flush()

        abstinence = Abstinence(
            id=uuid.uuid4(),
            user_id=user.id,
            type="alcohol",
            label="금주",
            start_date=date.today(),
            config="{}",
        )
        db.add(abstinence)
        db.flush()

        result = generate_timeline(
            abstinence=abstinence,
            config={},
            birth_year=1990,
            gender="male",
            db=db,
        )
        assert result is True  # 에러 시에도 필터링된 템플릿으로 저장
