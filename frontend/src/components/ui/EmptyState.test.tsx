import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders message", () => {
    render(<EmptyState message="데이터가 없습니다" />);
    expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
  });

  it("renders emoji when provided", () => {
    render(<EmptyState emoji="🎉" message="없음" />);
    expect(screen.getByText("🎉")).toBeInTheDocument();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    render(
      <EmptyState message="없음" actionLabel="추가하기" onAction={() => {}} />
    );
    expect(screen.getByRole("button", { name: "추가하기" })).toBeInTheDocument();
  });

  it("does not render button when actionLabel is missing", () => {
    render(<EmptyState message="없음" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fires onAction when button clicked", async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(
      <EmptyState message="없음" actionLabel="추가" onAction={handleAction} />
    );
    await user.click(screen.getByRole("button"));
    expect(handleAction).toHaveBeenCalledOnce();
  });
});
