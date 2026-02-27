from datetime import date

from pydantic import BaseModel, EmailStr, field_validator


# ===== Auth =====

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다")
        return v

    @field_validator("nickname")
    @classmethod
    def nickname_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 20:
            raise ValueError("닉네임은 2~20자여야 합니다")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    nickname: str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse


class TokenResponse(BaseModel):
    access_token: str


# ===== Abstinence =====

class AbstinenceCreateRequest(BaseModel):
    type: str  # alcohol, smoking, diet, custom
    start_date: date
    birth_year: int
    gender: str  # male, female
    label: str | None = None
    weight: float | None = None
    height: float | None = None
    drinking_years: int | None = None
    drinking_frequency: str | None = None
    drinking_amount: str | None = None
    smoking_years: int | None = None
    daily_cigarettes: int | None = None
    diet_goal: str | None = None
    habit_years: int | None = None


class AbstinenceResponse(BaseModel):
    id: int
    type: str
    label: str
    start_date: date
    current_day: int
    timeline_generated: bool

    model_config = {"from_attributes": True}


class AbstinenceListItem(BaseModel):
    id: int
    type: str
    label: str
    start_date: date
    current_day: int

    model_config = {"from_attributes": True}


# ===== Timeline =====

class EventResponse(BaseModel):
    day: int
    fact: str
    feeling: str | None
    action: str | None
    is_proactive: bool
    status: str  # past, current, upcoming

    model_config = {"from_attributes": True}


class StageResponse(BaseModel):
    stage: int
    name: str
    day_from: int
    day_to: int
    summary: str
    status: str  # completed, current, upcoming
    events: list[EventResponse] | None = None

    model_config = {"from_attributes": True}


class CurrentStageResponse(BaseModel):
    stage: int
    name: str
    day_from: int
    day_to: int
    summary: str
    progress_in_stage: float
    days_to_next_stage: int


class TimelineResponse(BaseModel):
    abstinence: AbstinenceListItem
    current_stage: CurrentStageResponse
    stages: list[StageResponse]


# ===== Dashboard =====

class TodayMessage(BaseModel):
    abstinence_id: int
    abstinence_type: str
    current_day: int
    fact: str
    feeling: str | None
    action: str | None
    is_proactive: bool


class DashboardAbstinence(BaseModel):
    id: int
    type: str
    label: str
    current_day: int
    current_stage: dict


class DashboardResponse(BaseModel):
    today_messages: list[TodayMessage]
    abstinences: list[DashboardAbstinence]
    has_pending_checkin: bool = False


# ===== Checkin =====

class CheckinRequest(BaseModel):
    exercise: bool
    sleep_quality: str  # good, normal, bad
    regular_meals: bool
    had_craving: bool


class CheckinResponse(BaseModel):
    message: str
    adjustments_summary: str
    next_checkin_date: date
