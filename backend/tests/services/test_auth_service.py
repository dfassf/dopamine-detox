import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.config import settings
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_returns_string(self):
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)
        assert hashed != "mypassword"

    def test_different_hashes_for_same_password(self):
        h1 = hash_password("mypassword")
        h2 = hash_password("mypassword")
        assert h1 != h2  # salt가 다르므로

    def test_verify_correct(self):
        hashed = hash_password("mypassword")
        assert verify_password("mypassword", hashed) is True

    def test_verify_wrong(self):
        hashed = hash_password("mypassword")
        assert verify_password("wrongpass", hashed) is False


class TestTokens:
    def test_access_token_is_string(self):
        uid = uuid.uuid4()
        token = create_access_token(uid)
        assert isinstance(token, str)

    def test_access_token_contains_sub(self):
        uid = uuid.uuid4()
        token = create_access_token(uid)
        payload = decode_token(token)
        assert payload["sub"] == str(uid)

    def test_access_token_has_exp(self):
        uid = uuid.uuid4()
        token = create_access_token(uid)
        payload = decode_token(token)
        assert "exp" in payload

    def test_refresh_token_differs_from_access(self):
        uid = uuid.uuid4()
        access = create_access_token(uid)
        refresh = create_refresh_token(uid)
        assert access != refresh

    def test_refresh_token_contains_sub(self):
        uid = uuid.uuid4()
        token = create_refresh_token(uid)
        payload = decode_token(token)
        assert payload["sub"] == str(uid)

    def test_decode_valid(self):
        uid = uuid.uuid4()
        token = create_access_token(uid)
        payload = decode_token(token)
        assert payload["sub"] == str(uid)

    def test_decode_expired(self):
        uid = uuid.uuid4()
        payload = {
            "sub": str(uid),
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        with pytest.raises(jwt.ExpiredSignatureError):
            decode_token(token)

    def test_decode_invalid(self):
        with pytest.raises(jwt.InvalidTokenError):
            decode_token("invalid.token.here")
