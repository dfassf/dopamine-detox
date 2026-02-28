import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import GuestRoute from "./GuestRoute";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../contexts/AuthContext";
const mockUseAuth = vi.mocked(useAuth);

describe("GuestRoute", () => {
  it("shows loading state when isLoading", () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>로그인 페이지</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("redirects to /dashboard when authenticated", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: "1", email: "a@b.com", nickname: "테스터" },
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>로그인 페이지</div>} />
          </Route>
          <Route path="/dashboard" element={<div>대시보드</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("대시보드")).toBeInTheDocument();
  });

  it("renders outlet when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>로그인 페이지</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("로그인 페이지")).toBeInTheDocument();
  });
});
