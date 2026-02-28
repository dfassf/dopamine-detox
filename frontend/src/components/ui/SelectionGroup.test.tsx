import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectionGroup } from "./SelectionGroup";

const options = [
  { label: "좋음", value: "good" },
  { label: "보통", value: "normal" },
  { label: "나쁨", value: "bad" },
];

describe("SelectionGroup", () => {
  it("renders all options", () => {
    render(<SelectionGroup options={options} selected={null} onChange={() => {}} />);
    expect(screen.getByText("좋음")).toBeInTheDocument();
    expect(screen.getByText("보통")).toBeInTheDocument();
    expect(screen.getByText("나쁨")).toBeInTheDocument();
  });

  it("highlights selected option", () => {
    render(<SelectionGroup options={options} selected="good" onChange={() => {}} />);
    expect(screen.getByText("좋음")).toHaveClass("selection-option--active");
    expect(screen.getByText("보통")).not.toHaveClass("selection-option--active");
  });

  it("calls onChange when option clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SelectionGroup options={options} selected={null} onChange={handleChange} />);
    await user.click(screen.getByText("보통"));
    expect(handleChange).toHaveBeenCalledWith("normal");
  });
});
