from fastapi import Cookie, Depends, Header, HTTPException
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services.auth_service import decode_token


def get_current_user(
    authorization: str = Header(..., description="Bearer {access_token}"),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 정보가 올바르지 않습니다")

    token = authorization.removeprefix("Bearer ")
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="토큰이 만료되었습니다")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다")

    return user


def get_refresh_token(refresh_token: str = Cookie(None)) -> str:
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="로그인이 만료되었습니다")
    return refresh_token
