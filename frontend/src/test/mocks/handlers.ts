import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        access_token: "mock-access-token",
        user: { id: "uuid-1", email: "test@example.com", nickname: "테스터" },
      });
    }
    return HttpResponse.json(
      { detail: "이메일 또는 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    );
  }),

  http.post("/api/auth/signup", async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        { detail: "이미 가입된 이메일입니다" },
        { status: 409 }
      );
    }
    return HttpResponse.json(
      {
        access_token: "mock-access-token",
        user: { id: "uuid-2", email: body.email, nickname: body.nickname },
      },
      { status: 201 }
    );
  }),

  http.post("/api/auth/refresh", () => {
    return HttpResponse.json(
      { detail: "no refresh token" },
      { status: 401 }
    );
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ message: "로그아웃 되었습니다" });
  }),

  http.get("/api/dashboard", () => {
    return HttpResponse.json({
      today_messages: [],
      abstinences: [],
      has_pending_checkin: false,
    });
  }),

  http.get("/api/abstinence", () => {
    return HttpResponse.json([]);
  }),
];
