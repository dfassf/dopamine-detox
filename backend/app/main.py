from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import Abstinence, Checkin, TimelineEvent, TimelineStage, User  # noqa: F401
from app.routers import abstinence, auth, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="dopamine-detox", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(abstinence.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
