import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import MyPage from "./MyPage";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: { id: "1", email: "test@example.com", nickname: "테스터" },
    loginSuccess: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("MyPage", () => {
  it("renders user nickname", () => {
    render(
      <MemoryRouter>
        <MyPage />
      </MemoryRouter>
    );
    expect(screen.getByText("테스터")).toBeInTheDocument();
  });

  it("renders user email", () => {
    render(
      <MemoryRouter>
        <MyPage />
      </MemoryRouter>
    );
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(
      <MemoryRouter>
        <MyPage />
      </MemoryRouter>
    );
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
  });

  it("renders detox management link", () => {
    render(
      <MemoryRouter>
        <MyPage />
      </MemoryRouter>
    );
    expect(screen.getByText("내 디톡스 관리")).toBeInTheDocument();
  });
});
