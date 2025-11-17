import { test, expect, Page } from '@playwright/test';

const PHONE_DETAIL_URL = '/phones/listing-001';
const PHONES_LIST_URL = '/phones';

async function waitForPhoneDetailLoaded(page: Page) {
  await page.locator('[data-testid="phone-detail-body"]').waitFor({ state: 'visible' });
}

test.describe('폰 상세 네비게이션 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PHONE_DETAIL_URL);
    await waitForPhoneDetailLoaded(page);
  });

  test('카테고리 탭을 클릭하면 /phones 로 이동해야 함', async ({ page }) => {
    await page.getByTestId('category-tab-button').click();
    await expect(page).toHaveURL(PHONES_LIST_URL);
  });

  test('뒤로가기 버튼을 클릭하면 /phones 로 이동해야 함', async ({ page }) => {
    await page.getByTestId('back-button').click();
    await expect(page).toHaveURL(PHONES_LIST_URL);
  });
});
