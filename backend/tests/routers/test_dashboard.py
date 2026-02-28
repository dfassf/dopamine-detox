class TestDashboard:
    def test_empty(self, client, auth_headers):
        response = client.get("/api/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["today_messages"] == []
        assert data["abstinences"] == []
        assert data["has_pending_checkin"] is False

    def test_with_abstinence(self, client, auth_headers, test_abstinence_with_timeline):
        response = client.get("/api/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["abstinences"]) == 1
        assert data["abstinences"][0]["type"] == "alcohol"
        assert "current_stage" in data["abstinences"][0]

    def test_today_messages(self, client, auth_headers, test_abstinence_with_timeline):
        response = client.get("/api/dashboard", headers=auth_headers)
        data = response.json()
        # start_date가 10일 전이므로 current_day=11, D+10 이벤트가 ±3 범위에 포함
        assert len(data["today_messages"]) >= 1

    def test_pending_checkin(self, client, auth_headers, test_abstinence_with_timeline):
        # current_day=11 (10일전 시작), 7일 이상이고 체크인 없으므로 pending
        response = client.get("/api/dashboard", headers=auth_headers)
        data = response.json()
        assert data["has_pending_checkin"] is True

    def test_unauthorized(self, client):
        response = client.get("/api/dashboard")
        assert response.status_code == 422
