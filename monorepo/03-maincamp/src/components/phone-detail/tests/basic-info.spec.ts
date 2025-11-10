import { test, expect } from '@playwright/test';

// README 참고: 실제 Supabase phones 테이블에서 확인한 UUID로 교체해야 테스트가 실행됩니다.
const VALID_PHONE_ID = 'YOUR_ACTUAL_PHONE_UUID_HERE'; // 예: '550e8400-e29b-41d4-a716-446655440000'

const ensureValidPhoneId = () => {
  if (!VALID_PHONE_ID || VALID_PHONE_ID === 'YOUR_ACTUAL_PHONE_UUID_HERE') {
    throw new Error('VALID_PHONE_ID 상수를 실제 phones UUID로 교체하세요. README 참고.');
  }
};

test.describe('Phone Detail - Basic Info', () => {
  test.beforeAll(() => {
    ensureValidPhoneId();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/phones/${VALID_PHONE_ID}`);
    await page.waitForSelector('[data-testid="basic-info-section"]', { timeout: 500 });

    await page.evaluate(() => {
      const section = document.querySelector('[data-testid="location-section"]');
      if (section) {
        (section as HTMLElement).scrollIntoView = function (options?: ScrollIntoViewOptions) {
          (window as unknown as { __locationScrollCalled?: boolean }).__locationScrollCalled = options?.behavior === 'smooth';
        };
      }
      (window as unknown as { __locationScrollCalled?: boolean }).__locationScrollCalled = false;
    });
  });

  test('모델명이 렌더링된다', async ({ page }) => {
    const modelName = page.locator('[data-testid="model-name"]');
    await expect(modelName).toBeVisible();
    await expect(modelName).not.toHaveText('');
  });

  test('할인율이 실제 계산과 일치한다', async ({ page }) => {
    const discountLocator = page.locator('[data-testid="discount-rate"]');
    const originalLocator = page.locator('[data-testid="original-price"]');

    await expect(discountLocator).toBeVisible();
    await expect(originalLocator).toBeVisible();

    const priceText = await page.locator('[data-testid="price-display"]').textContent();
    const originalText = await originalLocator.textContent();
    const displayedDiscountText = await discountLocator.textContent();

    const parseNumber = (value?: string | null) => Number((value || '').replace(/[^0-9]/g, ''));

    const price = parseNumber(priceText);
    const originalPrice = parseNumber(originalText);
    const displayedDiscount = parseNumber(displayedDiscountText);

    expect(price).toBeGreaterThan(0);
    expect(originalPrice).toBeGreaterThan(price);

    const expectedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    expect(displayedDiscount).toBe(expectedDiscount);
  });

  test('조건 기반 해시태그가 노출된다', async ({ page }) => {
    const hashtagsContainer = page.locator('[data-testid="basic-info-hashtags"]');
    await expect(hashtagsContainer).toBeVisible();

    const hashtagTexts = await hashtagsContainer.locator('[data-testid^="hashtag-"]').allTextContents();
    expect(hashtagTexts.length).toBeGreaterThan(0);

    const validTags = ['#미개봉', '#새제품', '#중고', '#배터리 좋음', '#배터리 나쁨'];
    const hasValidTag = hashtagTexts.some(tag => validTags.some(valid => tag.includes(valid)));
    expect(hasValidTag).toBeTruthy();
  });

  test('북마크 버튼 토글 시 상태가 변경된다', async ({ page }) => {
    const bookmarkButton = page.locator('[data-testid="bookmark-button"]');
    const bookmarkBadge = page.locator('[data-testid="bookmark-badge"]');
    const bookmarkCount = page.locator('[data-testid="bookmark-count"]');

    await expect(bookmarkButton).toBeVisible();

    const parseCount = (value?: string | null) => Number((value || '').replace(/[^0-9]/g, ''));

    const initialState = await bookmarkBadge.getAttribute('data-state');
    const initialCount = parseCount(await bookmarkCount.textContent());

    await bookmarkButton.click();

    await expect.poll(async () => {
      const currentState = await bookmarkBadge.getAttribute('data-state');
      return currentState;
    }).not.toBe(initialState);

    const updatedCount = await expect.poll(async () => parseCount(await bookmarkCount.textContent()));
    expect(Math.abs(updatedCount - initialCount)).toBe(1);
  });

  test('위치 버튼 클릭 시 location 섹션으로 스크롤된다', async ({ page }) => {
    const locationButton = page.locator('[data-testid="location-button"]');
    await expect(locationButton).toBeVisible();

    await locationButton.click();

    await expect.poll(async () => {
      return await page.evaluate(() => (window as unknown as { __locationScrollCalled?: boolean }).__locationScrollCalled === true);
    }).toBeTruthy();
  });
});
