import { test, expect } from "@playwright/test";

test.describe("인증 플로우", () => {
  test("랜딩 페이지 표시", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=도파민 디톡스")).toBeVisible();
    await expect(page.locator("text=시작하기")).toBeVisible();
    await expect(page.locator("text=이미 계정이 있어요")).toBeVisible();
  });

  test("회원가입 -> 대시보드 이동", async ({ page }) => {
    await page.goto("/");
    await page.click("text=시작하기");
    await expect(page).toHaveURL(/\/signup/);

    const uniqueEmail = `e2e-${Date.now()}@test.com`;
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[placeholder="8자 이상"]', "testpass123");
    await page.fill('input[placeholder="비밀번호를 다시 입력해주세요"]', "testpass123");
    await page.fill('input[placeholder="2~20자"]', "E2E테스터");

    await page.click("text=가입하기");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("로그인 실패 시 에러 메시지", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "wrong@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click("button:has-text('로그인')");

    await expect(page.locator("text=이메일 또는 비밀번호가 올바르지 않습니다")).toBeVisible({
      timeout: 5000,
    });
  });

  test("미인증 사용자 /dashboard 접근 시 /login 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
