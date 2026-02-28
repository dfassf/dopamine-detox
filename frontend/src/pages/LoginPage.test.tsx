import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";
import LoginPage from "./LoginPage";

const mockLoginSuccess = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    loginSuccess: mockLoginSuccess,
    logout: vi.fn(),
  }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  it("renders login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText("example@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호를 입력해주세요")).toBeInTheDocument();
  });

  it("renders login button", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("shows error on login failure", async () => {
    server.use(
      http.post("/api/auth/login", () => {
        return HttpResponse.json(
          { detail: "이메일 또는 비밀번호가 올바르지 않습니다" },
          { status: 401 }
        );
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("example@email.com"), "wrong@test.com");
    await user.type(screen.getByPlaceholderText("비밀번호를 입력해주세요"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(screen.getByText("이메일 또는 비밀번호가 올바르지 않습니다")).toBeInTheDocument();
    });
  });

  it("has link to signup", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText("회원가입")).toBeInTheDocument();
  });
});
