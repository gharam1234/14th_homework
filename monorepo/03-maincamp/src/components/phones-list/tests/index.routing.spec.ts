import { test, expect, Page } from '@playwright/test';

/**
 * 중고폰 리스트 라우팅 테스트
 *
 * 라우팅 hook 기능 테스트 (등록/상세 페이지 이동)
 */

/**
 * 테스트 유틸: 페이지 로드 완료 대기
 */
async function waitForPageLoad(page: Page) {
  // data-testid="phones-list"가 나타날 때까지 대기
  await page.locator('[data-testid="phones-list"]').waitFor({ state: 'visible' });
}

test.describe('PhonesList 라우팅 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 중고폰 리스트 페이지로 이동
    await page.goto('http://localhost:3000/phones');
    await waitForPageLoad(page);
  });

  test('PhoneCard 클릭 시 중고폰 상세 페이지(/phones/[id])로 이동', async ({ page }) => {
    // 1. 준비: 첫 번째 PhoneCard 찾기
    const firstCard = page.locator('[data-testid="phone-card"]').first();

    // Card가 렌더링되었는지 확인
    await expect(firstCard).toBeVisible();

    // 2. 실행: PhoneCard 클릭
    await firstCard.click();

    // 3. 검증: URL이 /phones/[id]로 변경되었는지 확인
    // PhoneCard의 phoneId는 1부터 시작 (index + 1)
    const expectedUrl = 'http://localhost:3000/phones/1';
    await expect(page).toHaveURL(expectedUrl);
  });

  test('중고폰 판매 등록 버튼 클릭 시 등록 페이지(/phones/new)로 이동', async ({ page }) => {
    // 1. 준비: 판매 등록 버튼 찾기
    const sellButton = page.locator('[data-testid="sell-button"]');

    // 버튼이 렌더링되었는지 확인
    await expect(sellButton).toBeVisible();

    // 2. 실행: 판매 등록 버튼 클릭
    await sellButton.click();

    // 3. 검증: URL이 /phones/new으로 변경되었는지 확인
    const expectedUrl = 'http://localhost:3000/phones/new';
    await expect(page).toHaveURL(expectedUrl);
  });
});
