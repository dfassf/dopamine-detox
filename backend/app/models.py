from datetime import date, datetime

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    nickname: Mapped[str] = mapped_column(String, nullable=False)
    birth_year: Mapped[int | None] = mapped_column(Integer)
    gender: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    abstinences: Mapped[list["Abstinence"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Abstinence(Base):
    __tablename__ = "abstinences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    config: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="abstinences")
    stages: Mapped[list["TimelineStage"]] = relationship(back_populates="abstinence", cascade="all, delete-orphan")
    checkins: Mapped[list["Checkin"]] = relationship(back_populates="abstinence", cascade="all, delete-orphan")


class TimelineStage(Base):
    __tablename__ = "timeline_stages"

    id: Mapped[int] = mapped_column(primary_key=True)
    abstinence_id: Mapped[int] = mapped_column(ForeignKey("abstinences.id", ondelete="CASCADE"), nullable=False)
    stage_num: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    day_from: Mapped[int] = mapped_column(Integer, nullable=False)
    day_to: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)

    abstinence: Mapped["Abstinence"] = relationship(back_populates="stages")
    events: Mapped[list["TimelineEvent"]] = relationship(back_populates="stage", cascade="all, delete-orphan")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("timeline_stages.id", ondelete="CASCADE"), nullable=False)
    day: Mapped[int] = mapped_column(Integer, nullable=False)
    fact: Mapped[str] = mapped_column(Text, nullable=False)
    feeling: Mapped[str | None] = mapped_column(Text)
    action: Mapped[str | None] = mapped_column(Text)
    is_proactive: Mapped[bool] = mapped_column(Boolean, default=False)

    stage: Mapped["TimelineStage"] = relationship(back_populates="events")


class Checkin(Base):
    __tablename__ = "checkins"

    id: Mapped[int] = mapped_column(primary_key=True)
    abstinence_id: Mapped[int] = mapped_column(ForeignKey("abstinences.id", ondelete="CASCADE"), nullable=False)
    week: Mapped[int] = mapped_column(Integer, nullable=False)
    exercise: Mapped[bool] = mapped_column(Boolean, nullable=False)
    sleep_quality: Mapped[str] = mapped_column(String, nullable=False)
    regular_meals: Mapped[bool] = mapped_column(Boolean, nullable=False)
    had_craving: Mapped[bool] = mapped_column(Boolean, nullable=False)
    date: Mapped[date] = mapped_column(Date, default=date.today)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    abstinence: Mapped["Abstinence"] = relationship(back_populates="checkins")
