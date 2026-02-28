from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_refresh_token
from app.models import User
from app.schemas import AuthResponse, LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

REFRESH_COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/api/auth",
    )


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(body: SignupRequest, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        nickname=body.nickname.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    response: Response,
    refresh_token: str = Depends(get_refresh_token),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_token(refresh_token)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="로그인이 만료되었습니다")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

    user_id = payload.get("sub")
    user = db.get(User, UUID(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다")

    new_access = create_access_token(user.id)
    new_refresh = create_refresh_token(user.id)
    _set_refresh_cookie(response, new_refresh)

    return TokenResponse(access_token=new_access)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token", path="/api/auth")
    return {"message": "로그아웃 되었습니다"}
