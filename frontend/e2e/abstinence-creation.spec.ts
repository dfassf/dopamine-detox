import { test, expect, type Page } from "@playwright/test";

async function signupAndLogin(page: Page) {
  const uniqueEmail = `e2e-abs-${Date.now()}@test.com`;
  await page.goto("/signup");
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[placeholder="8자 이상"]', "testpass123");
  await page.fill('input[placeholder="비밀번호를 다시 입력해주세요"]', "testpass123");
  await page.fill('input[placeholder="2~20자"]', "E2E테스터");
  await page.click("text=가입하기");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("디톡스 생성 플로우", () => {
  test("금주 디톡스 생성", async ({ page }) => {
    await signupAndLogin(page);

    await page.goto("/abstinence/new");
    await expect(page.locator("text=디톡스 시작하기")).toBeVisible();

    // Step 1: 공통 정보
    await page.fill('input[placeholder="예: 1989"]', "1990");
    await page.selectOption("select", "male");
    await page.click("text=다음");

    // Step 2: 금주 상세 정보
    await page.fill('input[placeholder="예: 87"]', "80");
    await page.fill('input[placeholder="예: 175"]', "178");
    await page.fill('input[placeholder="예: 10"]', "8");
    await page.selectOption('select:below(:text("음주 빈도"))', { index: 1 });
    await page.fill('input[placeholder="예: 소주 2병"]', "소주 1병");

    await page.click("text=타임라인 생성하기");

    // 타임라인 페이지로 이동 확인
    await expect(page).toHaveURL(/\/timeline\//, { timeout: 30000 });
  });
});
