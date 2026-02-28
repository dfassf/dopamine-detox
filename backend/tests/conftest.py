import uuid
from collections.abc import Generator
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Abstinence, Checkin, TimelineEvent, TimelineStage, User
from app.services.auth_service import create_access_token, hash_password

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db: Session) -> TestClient:
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        password_hash=hash_password("password123"),
        nickname="테스터",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_abstinence(db: Session, test_user: User) -> Abstinence:
    abstinence = Abstinence(
        id=uuid.uuid4(),
        user_id=test_user.id,
        type="alcohol",
        label="금주",
        start_date=date.today() - timedelta(days=10),
        config='{"weight": 80, "drinking_years": 5}',
    )
    db.add(abstinence)
    db.commit()
    db.refresh(abstinence)
    return abstinence


@pytest.fixture
def test_abstinence_with_timeline(db: Session, test_abstinence: Abstinence) -> Abstinence:
    stage = TimelineStage(
        abstinence_id=test_abstinence.id,
        stage_num=1,
        name="해독기",
        day_from=1,
        day_to=14,
        summary="알코올 배출 단계",
    )
    db.add(stage)
    db.flush()

    for day_offset in [3, 7, 10, 14]:
        event = TimelineEvent(
            stage_id=stage.id,
            day=day_offset,
            fact=f"D+{day_offset} 팩트",
            feeling=f"D+{day_offset} 감정",
            action=f"D+{day_offset} 액션",
            is_proactive=day_offset == 7,
        )
        db.add(event)

    stage2 = TimelineStage(
        abstinence_id=test_abstinence.id,
        stage_num=2,
        name="안정기",
        day_from=15,
        day_to=30,
        summary="안정화 단계",
    )
    db.add(stage2)
    db.flush()

    event2 = TimelineEvent(
        stage_id=stage2.id,
        day=20,
        fact="D+20 팩트",
        feeling="D+20 감정",
        action="D+20 액션",
        is_proactive=False,
    )
    db.add(event2)
    db.commit()

    return test_abstinence
