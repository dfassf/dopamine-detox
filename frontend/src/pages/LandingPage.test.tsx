import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "./LandingPage";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    loginSuccess: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("LandingPage", () => {
  it("renders app title", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText("도파민 디톡스")).toBeInTheDocument();
  });

  it("renders start button", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText("시작하기")).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText("이미 계정이 있어요")).toBeInTheDocument();
  });
});
