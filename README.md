# 도파민 디톡스

도파민 디톡스(금주, 금연, 식단 관리 등) 과정을 AI 기반 타임라인으로 추적하고, 주간 체크인을 통해 개인화된 회복 일정을 제공하는 모바일 웹 앱.

## 기술 스택

### Backend
- **FastAPI** + **Uvicorn**
- **SQLAlchemy** (SQLite)
- **PyJWT** + **bcrypt** (인증)
- **Gemini 2.0 Flash** (AI 타임라인 개인화)
- **pytest** (테스트)

### Frontend
- **React 19** + **TypeScript**
- **Vite 7**
- **React Router 7**
- **Axios**
- **Vitest** + **Testing Library** (단위 테스트)
- **Playwright** (E2E 테스트)

## 프로젝트 구조

```
restrainer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 앱
│   │   ├── config.py            # 환경 설정
│   │   ├── database.py          # SQLAlchemy 설정
│   │   ├── models.py            # DB 모델
│   │   ├── schemas.py           # Pydantic 스키마
│   │   ├── dependencies.py      # 인증 의존성
│   │   ├── routers/
│   │   │   ├── auth.py          # 인증 API
│   │   │   ├── abstinence.py    # 디톡스 CRUD + 타임라인 + 체크인
│   │   │   └── dashboard.py     # 대시보드 API
│   │   ├── services/
│   │   │   ├── auth_service.py      # JWT, 비밀번호 해싱
│   │   │   ├── timeline_service.py  # AI 타임라인 생성
│   │   │   └── checkin_service.py   # 체크인 처리 + 타임라인 재조정
│   │   └── data/
│   │       ├── timelines/       # 타입별 타임라인 템플릿 JSON
│   │       └── checkins/        # 타입별 체크인 질문 JSON
│   └── tests/                   # pytest 테스트
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API 클라이언트
│   │   ├── components/          # UI 컴포넌트
│   │   ├── contexts/            # AuthContext
│   │   └── pages/               # 페이지 컴포넌트
│   └── e2e/                     # Playwright E2E 테스트
└── README.md
```

## 로컬 개발 환경

### 사전 요구사항
- Python 3.12+
- Node.js 20+
- [uv](https://docs.astral.sh/uv/) (Python 패키지 관리)

### Backend

```bash
cd backend

# 의존성 설치
uv sync

# 개발 서버 실행
uv run uvicorn app.main:app --reload --port 8003
```

### Frontend

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

Frontend는 `http://localhost:5173`, Backend API는 `http://localhost:8003`에서 실행됩니다.
Vite의 프록시 설정으로 `/api` 요청이 백엔드로 전달됩니다.

## 환경변수

`backend/.env` 파일에 설정:

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `SECRET_KEY` | JWT 서명 키 | `dev-secret-key-change-in-prod` |
| `DATABASE_URL` | SQLite DB 경로 | `sqlite:///./dopamine-detox.db` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 액세스 토큰 만료 시간(분) | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | 리프레시 토큰 만료 시간(일) | `7` |
| `GEMINI_API_KEY` | Google Gemini API 키 | (빈 문자열이면 AI 비활성화) |

## API 엔드포인트

### 인증
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |

### 디톡스
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/abstinence` | 목록 조회 |
| POST | `/api/abstinence` | 생성 |
| GET | `/api/abstinence/{id}/timeline` | 타임라인 조회 |
| DELETE | `/api/abstinence/{id}` | 삭제 |

### 체크인
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/abstinence/{id}/checkin/questions` | 질문 조회 |
| POST | `/api/abstinence/{id}/checkin` | 체크인 제출 |

### 대시보드
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/dashboard` | 대시보드 데이터 |
| GET | `/api/health` | 헬스 체크 |

## 테스트

### Backend (pytest)

```bash
cd backend

# 테스트 의존성 설치
uv pip install -e ".[dev]"

# 전체 테스트 실행
uv run pytest

# 커버리지 포함
uv run pytest --cov=app
```

### Frontend 단위 테스트 (Vitest)

```bash
cd frontend

# 테스트 실행
npm test

# watch 모드
npm run test:watch

# 커버리지
npm run test:coverage
```

### Frontend E2E 테스트 (Playwright)

```bash
cd frontend

# Playwright 브라우저 설치 (최초 1회)
npx playwright install chromium

# E2E 테스트 실행 (백엔드 + 프론트엔드 자동 시작)
npm run test:e2e

# UI 모드
npm run test:e2e:ui
```
