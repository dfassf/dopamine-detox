from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas import AbstinenceCreateRequest, LoginRequest, SignupRequest


class TestSignupRequest:
    def test_valid(self):
        req = SignupRequest(email="a@b.com", password="12345678", nickname="홍길동")
        assert req.email == "a@b.com"
        assert req.nickname == "홍길동"

    def test_short_password(self):
        with pytest.raises(ValidationError, match="8자 이상"):
            SignupRequest(email="a@b.com", password="1234567", nickname="홍길동")

    def test_short_nickname(self):
        with pytest.raises(ValidationError, match="2~20자"):
            SignupRequest(email="a@b.com", password="12345678", nickname="홍")

    def test_long_nickname(self):
        with pytest.raises(ValidationError, match="2~20자"):
            SignupRequest(email="a@b.com", password="12345678", nickname="가" * 21)

    def test_nickname_stripped(self):
        req = SignupRequest(email="a@b.com", password="12345678", nickname="  테스터  ")
        assert req.nickname == "테스터"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            SignupRequest(email="not-email", password="12345678", nickname="홍길동")


class TestLoginRequest:
    def test_valid(self):
        req = LoginRequest(email="a@b.com", password="pass1234")
        assert req.email == "a@b.com"


class TestAbstinenceCreateRequest:
    def test_minimal(self):
        req = AbstinenceCreateRequest(
            type="alcohol",
            start_date=date.today(),
            birth_year=1990,
            gender="male",
        )
        assert req.type == "alcohol"
        assert req.label is None

    def test_with_alcohol_fields(self):
        req = AbstinenceCreateRequest(
            type="alcohol",
            start_date=date.today(),
            birth_year=1990,
            gender="male",
            weight=80.0,
            height=178.0,
            drinking_years=10,
            drinking_frequency="3-5",
            drinking_amount="소주 2병",
        )
        assert req.weight == 80.0
        assert req.drinking_years == 10
