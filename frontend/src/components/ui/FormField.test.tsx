import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("renders label", () => {
    render(
      <FormField label="이메일">
        <input />
      </FormField>
    );
    expect(screen.getByText("이메일")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <FormField label="이메일">
        <input data-testid="input" />
      </FormField>
    );
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <FormField label="이메일" error="필수 입력입니다">
        <input />
      </FormField>
    );
    expect(screen.getByText("필수 입력입니다")).toBeInTheDocument();
  });

  it("shows helper text", () => {
    render(
      <FormField label="이메일" helper="이메일 형식으로 입력하세요">
        <input />
      </FormField>
    );
    expect(screen.getByText("이메일 형식으로 입력하세요")).toBeInTheDocument();
  });

  it("error takes priority over helper", () => {
    render(
      <FormField label="이메일" error="에러" helper="도움말">
        <input />
      </FormField>
    );
    expect(screen.getByText("에러")).toBeInTheDocument();
    expect(screen.queryByText("도움말")).not.toBeInTheDocument();
  });
});
