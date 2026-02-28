import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  try {
    localStorage.clear();
  } catch {
    // jsdom 환경에서 localStorage 미지원 시 무시
  }
});
afterAll(() => server.close());
