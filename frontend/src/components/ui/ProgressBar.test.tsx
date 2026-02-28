import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders with correct percentage width", () => {
    const { container } = render(<ProgressBar percent={50} />);
    const fill = container.querySelector(".progress-bar__fill") as HTMLElement;
    expect(fill.style.width).toBe("50%");
  });

  it("clamps at 0% minimum", () => {
    const { container } = render(<ProgressBar percent={-10} />);
    const fill = container.querySelector(".progress-bar__fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("clamps at 100% maximum", () => {
    const { container } = render(<ProgressBar percent={150} />);
    const fill = container.querySelector(".progress-bar__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("uses default height", () => {
    const { container } = render(<ProgressBar percent={50} />);
    const bar = container.querySelector(".progress-bar") as HTMLElement;
    expect(bar.style.height).toBe("6px");
  });

  it("uses custom height", () => {
    const { container } = render(<ProgressBar percent={50} height={10} />);
    const bar = container.querySelector(".progress-bar") as HTMLElement;
    expect(bar.style.height).toBe("10px");
  });
});
