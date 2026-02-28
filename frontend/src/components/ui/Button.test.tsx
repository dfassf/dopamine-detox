import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>로그인</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("로그인");
  });

  it("applies primary variant by default", () => {
    render(<Button>확인</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it("applies outline variant", () => {
    render(<Button variant="outline">취소</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-outline");
  });

  it("shows loading text when loading", () => {
    render(<Button loading loadingText="처리 중...">확인</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("처리 중...");
  });

  it("falls back to children when loading without loadingText", () => {
    render(<Button loading>확인</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("확인");
  });

  it("is disabled when loading", () => {
    render(<Button loading>확인</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop set", () => {
    render(<Button disabled>확인</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick handler", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
