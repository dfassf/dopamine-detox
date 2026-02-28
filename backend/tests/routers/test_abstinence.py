import uuid
from datetime import date
from unittest.mock import patch

from app.models import User
from app.services.auth_service import create_access_token, hash_password


class TestCreateAbstinence:
    @patch("app.routers.abstinence.generate_timeline", return_value=True)
    def test_alcohol(self, mock_gen, client, auth_headers):
        response = client.post("/api/abstinence", json={
            "type": "alcohol",
            "start_date": str(date.today()),
            "birth_year": 1990,
            "gender": "male",
            "weight": 80,
            "height": 178,
            "drinking_years": 10,
            "drinking_frequency": "3-5",
            "drinking_amount": "소주 2병",
        }, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "alcohol"
        assert data["label"] == "금주"
        assert data["timeline_generated"] is True
        mock_gen.assert_called_once()

    @patch("app.routers.abstinence.generate_timeline", return_value=True)
    def test_custom(self, mock_gen, client, auth_headers):
        response = client.post("/api/abstinence", json={
            "type": "custom",
            "start_date": str(date.today()),
            "birth_year": 1995,
            "gender": "female",
            "label": "SNS 끊기",
        }, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["label"] == "SNS 끊기"

    def test_unauthorized(self, client):
        response = client.post("/api/abstinence", json={
            "type": "alcohol",
            "start_date": str(date.today()),
            "birth_year": 1990,
            "gender": "male",
        })
        assert response.status_code == 422  # authorization 헤더 누락


class TestListAbstinences:
    def test_empty(self, client, auth_headers):
        response = client.get("/api/abstinence", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_with_items(self, client, auth_headers, test_abstinence):
        response = client.get("/api/abstinence", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["type"] == "alcohol"
        assert data[0]["current_day"] >= 1


class TestGetTimeline:
    def test_success(self, client, auth_headers, test_abstinence_with_timeline):
        response = client.get(
            f"/api/abstinence/{test_abstinence_with_timeline.id}/timeline",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "current_stage" in data
        assert "stages" in data
        assert len(data["stages"]) == 2

    def test_not_found(self, client, auth_headers):
        fake_id = uuid.uuid4()
        response = client.get(f"/api/abstinence/{fake_id}/timeline", headers=auth_headers)
        assert response.status_code == 404

    def test_other_user(self, client, db, test_abstinence_with_timeline):
        other_user = User(
            id=uuid.uuid4(),
            email="other@example.com",
            password_hash=hash_password("pass1234"),
            nickname="다른유저",
        )
        db.add(other_user)
        db.commit()

        other_token = create_access_token(other_user.id)
        other_headers = {"Authorization": f"Bearer {other_token}"}

        response = client.get(
            f"/api/abstinence/{test_abstinence_with_timeline.id}/timeline",
            headers=other_headers,
        )
        assert response.status_code == 404


class TestCheckinQuestions:
    def test_alcohol(self, client, auth_headers, test_abstinence):
        response = client.get(
            f"/api/abstinence/{test_abstinence.id}/checkin/questions",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) > 0

    def test_not_found(self, client, auth_headers):
        fake_id = uuid.uuid4()
        response = client.get(f"/api/abstinence/{fake_id}/checkin/questions", headers=auth_headers)
        assert response.status_code == 404


class TestCreateCheckin:
    @patch("app.routers.abstinence.process_checkin", return_value="타임라인 조정 완료")
    def test_success(self, mock_process, client, auth_headers, test_abstinence_with_timeline):
        response = client.post(
            f"/api/abstinence/{test_abstinence_with_timeline.id}/checkin",
            json={"answers": {"craving": "no", "sleep_quality": "good"}},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "next_checkin_date" in data

    def test_not_found(self, client, auth_headers):
        fake_id = uuid.uuid4()
        response = client.post(
            f"/api/abstinence/{fake_id}/checkin",
            json={"answers": {"craving": "no"}},
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestDeleteAbstinence:
    def test_success(self, client, auth_headers, test_abstinence):
        response = client.delete(
            f"/api/abstinence/{test_abstinence.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert "삭제" in response.json()["message"]

    def test_not_found(self, client, auth_headers):
        fake_id = uuid.uuid4()
        response = client.delete(f"/api/abstinence/{fake_id}", headers=auth_headers)
        assert response.status_code == 404

    def test_other_user(self, client, db, test_abstinence):
        other_user = User(
            id=uuid.uuid4(),
            email="other2@example.com",
            password_hash=hash_password("pass1234"),
            nickname="다른유저2",
        )
        db.add(other_user)
        db.commit()

        other_token = create_access_token(other_user.id)
        other_headers = {"Authorization": f"Bearer {other_token}"}

        response = client.delete(
            f"/api/abstinence/{test_abstinence.id}",
            headers=other_headers,
        )
        assert response.status_code == 404
