import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def call_gemini(prompt: str) -> str:
    """Gemini REST API 호출."""
    resp = httpx.post(
        GEMINI_API_URL,
        params={"key": settings.GEMINI_API_KEY},
        json={"contents": [{"parts": [{"text": prompt}]}]},
        timeout=60.0,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def parse_json_response(text: str) -> dict:
    """AI 응답에서 JSON 파싱 (마크다운 코드블록 제거)."""
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    return json.loads(text)
