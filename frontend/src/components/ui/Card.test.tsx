import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>카드 내용</Card>);
    expect(screen.getByText("카드 내용")).toBeInTheDocument();
  });

  it("renders as div without onClick", () => {
    const { container } = render(<Card>내용</Card>);
    expect(container.querySelector("div.card")).toBeInTheDocument();
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders as button with onClick", () => {
    render(<Card onClick={() => {}}>내용</Card>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies default padding", () => {
    const { container } = render(<Card>내용</Card>);
    expect(container.firstChild).toHaveClass("card--default");
  });

  it("applies compact padding", () => {
    const { container } = render(<Card padding="compact">내용</Card>);
    expect(container.firstChild).toHaveClass("card--compact");
  });

  it("applies no padding class for none", () => {
    const { container } = render(<Card padding="none">내용</Card>);
    expect(container.firstChild).not.toHaveClass("card--default");
    expect(container.firstChild).not.toHaveClass("card--compact");
  });

  it("fires onClick", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>클릭</Card>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
