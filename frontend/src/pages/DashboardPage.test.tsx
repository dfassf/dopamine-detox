import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";
import DashboardPage from "./DashboardPage";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: { id: "uuid-1", email: "test@example.com", nickname: "테스터" },
    loginSuccess: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("DashboardPage - MSW 통합 테스트", () => {
  it("대시보드 데이터를 정상 렌더링", async () => {
    server.use(
      http.get("/api/dashboard", () => {
        return HttpResponse.json({
          today_messages: [
            {
              abstinence_id: "abs-1",
              abstinence_type: "alcohol",
              current_day: 7,
              fact: "간 기능이 회복되기 시작합니다",
              feeling: null,
              action: null,
              is_proactive: false,
            },
          ],
          abstinences: [
            {
              id: "abs-1",
              type: "alcohol",
              label: "금주",
              current_day: 7,
              current_stage: {
                stage: 1,
                name: "초기 회복",
                total_stages: 5,
                days_to_next_stage: 7,
              },
            },
          ],
          has_pending_checkin: false,
        });
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/간 기능이 회복되기 시작합니다/)).toBeInTheDocument();
    });
  });

  it("절제 항목이 없으면 빈 상태 표시", async () => {
    server.use(
      http.get("/api/dashboard", () => {
        return HttpResponse.json({
          today_messages: [],
          abstinences: [],
          has_pending_checkin: false,
        });
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText(/간 기능이 회복되기 시작합니다/)).not.toBeInTheDocument();
    });
  });

  it("API 에러 시 빈 상태로 폴백", async () => {
    server.use(
      http.get("/api/dashboard", () => {
        return HttpResponse.json(
          { detail: "서버 오류" },
          { status: 500 },
        );
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("아직 시작한 디톡스가 없어요")).toBeInTheDocument();
    });
  });
});
