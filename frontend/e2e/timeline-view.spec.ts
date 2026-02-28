import { test, expect, type Page } from "@playwright/test";

async function signupAndCreateAbstinence(page: Page) {
  const uniqueEmail = `e2e-tl-${Date.now()}@test.com`;
  await page.goto("/signup");
  await page.fill('input[type="email"]', uniqueEmail);
  await page.fill('input[placeholder="8자 이상"]', "testpass123");
  await page.fill('input[placeholder="비밀번호를 다시 입력해주세요"]', "testpass123");
  await page.fill('input[placeholder="2~20자"]', "타임라인테스터");
  await page.click("text=가입하기");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

  // 디톡스 생성
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

test.describe("타임라인 조회", () => {
  test("타임라인 상세 페이지 표시", async ({ page }) => {
    await signupAndCreateAbstinence(page);

    // 타임라인 상세 페이지에 단계 정보가 표시되어야 함
    await expect(page.locator(".stage-accordion").first()).toBeVisible({ timeout: 5000 });
  });

  test("타임라인 목록 페이지", async ({ page }) => {
    await signupAndCreateAbstinence(page);

    // 하단 탭바로 타임라인 목록 이동
    await page.click("text=타임라인");
    // 1개만 있으면 자동으로 상세 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/timeline\//);
  });
});
