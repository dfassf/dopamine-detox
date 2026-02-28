class TestSignup:
    def test_success(self, client):
        response = client.post("/api/auth/signup", json={
            "email": "new@example.com",
            "password": "password123",
            "nickname": "새유저",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "new@example.com"
        assert data["user"]["nickname"] == "새유저"

    def test_sets_refresh_cookie(self, client):
        response = client.post("/api/auth/signup", json={
            "email": "cookie@example.com",
            "password": "password123",
            "nickname": "쿠키유저",
        })
        assert response.status_code == 201
        assert "refresh_token" in response.cookies

    def test_duplicate_email(self, client, test_user):
        response = client.post("/api/auth/signup", json={
            "email": "test@example.com",
            "password": "password123",
            "nickname": "중복",
        })
        assert response.status_code == 409
        assert "이미 가입된 이메일" in response.json()["detail"]

    def test_short_password(self, client):
        response = client.post("/api/auth/signup", json={
            "email": "short@example.com",
            "password": "1234567",
            "nickname": "테스터",
        })
        assert response.status_code == 422


class TestLogin:
    def test_success(self, client, test_user):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"

    def test_wrong_password(self, client, test_user):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401
        assert "이메일 또는 비밀번호" in response.json()["detail"]

    def test_nonexistent_email(self, client):
        response = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert response.status_code == 401


class TestRefresh:
    def test_success(self, client, test_user):
        # 먼저 로그인해서 refresh_token 쿠키 설정
        client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123",
        })
        response = client.post("/api/auth/refresh")
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_no_cookie(self, client):
        response = client.post("/api/auth/refresh")
        assert response.status_code == 401


class TestLogout:
    def test_clears_cookie(self, client):
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        assert response.json()["message"] == "로그아웃 되었습니다"
