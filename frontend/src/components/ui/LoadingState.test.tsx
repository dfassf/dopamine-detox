import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders default loading text", () => {
    render(<LoadingState />);
    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("renders custom loading text", () => {
    render(<LoadingState text="데이터 로딩 중..." />);
    expect(screen.getByText("데이터 로딩 중...")).toBeInTheDocument();
  });
});
