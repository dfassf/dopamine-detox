import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { PageHeader } from "./PageHeader";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PageHeader", () => {
  it("renders title", () => {
    renderWithRouter(<PageHeader title="도파민 디톡스" />);
    expect(screen.getByText("도파민 디톡스")).toBeInTheDocument();
  });

  it("renders back button when onBack is set", () => {
    const handleBack = vi.fn();
    renderWithRouter(<PageHeader title="제목" onBack={handleBack} />);
    const backBtn = screen.getByRole("button");
    expect(backBtn).toBeInTheDocument();
  });

  it("calls custom onBack handler", async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();
    renderWithRouter(<PageHeader title="제목" onBack={handleBack} />);
    await user.click(screen.getByRole("button"));
    expect(handleBack).toHaveBeenCalledOnce();
  });

  it("renders right slot", () => {
    renderWithRouter(
      <PageHeader title="제목" right={<span data-testid="right">R</span>} />
    );
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("renders auth variant", () => {
    renderWithRouter(<PageHeader title="로그인" variant="auth" />);
    expect(screen.getByText("로그인").tagName).toBe("H2");
  });
});
