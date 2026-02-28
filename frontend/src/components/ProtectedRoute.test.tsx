import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../contexts/AuthContext";
const mockUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
  it("shows loading state when isLoading", () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>보호된 페이지</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>보호된 페이지</div>} />
          </Route>
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("로그인 페이지")).toBeInTheDocument();
  });

  it("renders outlet when authenticated", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: "1", email: "a@b.com", nickname: "테스터" },
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>보호된 페이지</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("보호된 페이지")).toBeInTheDocument();
  });
});
