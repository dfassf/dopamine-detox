import { test, expect, type Page } from "@playwright/test";

async function signupAndCreateAbstinence(page: Page) {
  const uniqueEmail = `e2e-ci-${Date.now()}@test.com`;
  await page.goto("/signup");
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[placeholder="8자 이상"]', "testpass123");
  await page.fill('input[placeholder="비밀번호를 다시 입력해주세요"]', "testpass123");
  await page.fill('input[placeholder="2~20자"]', "체크인테스터");
  await page.click("text=가입하기");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  await page.goto("/abstinence/new");
  await page.fill('input[placeholder="예: 1989"]', "1990");
  await page.selectOption("select", "male");
  await page.click("text=다음");

  await page.fill('input[placeholder="예: 87"]', "80");
  await page.fill('input[placeholder="예: 175"]', "178");
  await page.fill('input[placeholder="예: 10"]', "5");
  await page.selectOption('select:below(:text("음주 빈도"))', { index: 1 });
  await page.fill('input[placeholder="예: 소주 2병"]', "소주 1병");
  await page.click("text=타임라인 생성하기");
  await expect(page).toHaveURL(/\/timeline\//, { timeout: 30000 });
}

test.describe("체크인 플로우", () => {
  test("체크인 페이지 접근 및 질문 표시", async ({ page }) => {
    await signupAndCreateAbstinence(page);

    // URL에서 abstinence ID 추출
    const url = page.url();
    const match = url.match(/\/timeline\/([^/]+)/);
    if (!match) throw new Error("abstinence ID를 찾을 수 없음");
    const abstinenceId = match[1];

    // 체크인 페이지로 이동
    await page.goto(`/abstinence/${abstinenceId}/checkin`);
    await expect(page.locator("text=주간 체크인")).toBeVisible({ timeout: 5000 });

    // 질문이 표시되는지 확인
    const questions = page.locator(".checkin-question");
    await expect(questions.first()).toBeVisible({ timeout: 5000 });
  });
});
