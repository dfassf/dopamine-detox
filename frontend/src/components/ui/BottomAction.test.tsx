import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BottomAction } from "./BottomAction";

describe("BottomAction", () => {
  it("renders children", () => {
    render(
      <BottomAction>
        <button>확인</button>
      </BottomAction>
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });
});
