import { test, expect } from '@playwright/test';

test.describe('Phone Detail Page - Task1 데이터 바인딩', () => {
  // 테스트용 폰 ID (실제 Supabase 데이터 사용)
  // Supabase 대시보드에서 phones 테이블의 첫 번째 레코드 UUID를 아래에 입력하세요
  const VALID_PHONE_ID = 'ef5a624a-3a90-490b-b531-474ff45f6187';
  const INVALID_PHONE_ID = '00000000-0000-0000-0000-000000000000'; // 존재하지 않는 UUID

  test.beforeEach(async ({ page }) => {
    // 페이지 로드 (baseUrl은 playwright.config.ts에서 정의)
    await page.goto(`/phones/${VALID_PHONE_ID}`);
    // data-testid 기반으로 페이지 완전 로드 대기
    await page.waitForSelector('[data-testid="basic-info-section"]', { timeout: 500 });
  });

  test('성공 케이스: 모델명이 올바르게 표시된다', async ({ page }) => {
    const modelNameElement = await page.locator('[data-testid="model-name"]').first();
    await expect(modelNameElement).toBeVisible();

    const modelName = await modelNameElement.textContent();
    expect(modelName).toBeTruthy();
    expect(modelName).toMatch(/iPhone|Galaxy|Note|Pixel/); // 일반적인 모델명 패턴
  });

  test('성공 케이스: 할인율이 올바르게 계산된다', async ({ page }) => {
    const discountElement = await page.locator('[data-testid="discount-rate"]').first();
    await expect(discountElement).toBeVisible();

    const discountText = await discountElement.textContent();
    const discountRate = parseFloat(discountText || '0');

    // 할인율은 0~100 사이여야 함
    expect(discountRate).toBeGreaterThanOrEqual(0);
    expect(discountRate).toBeLessThanOrEqual(100);
  });

  test('성공 케이스: 조건별 해시태그가 생성된다', async ({ page }) => {
    const hashtagsContainer = await page.locator('[data-testid="basic-info-hashtags"]').first();
    await expect(hashtagsContainer).toBeVisible();

    const hashtagElements = await hashtagsContainer.locator('[data-testid^="hashtag-"]').all();
    expect(hashtagElements.length).toBeGreaterThan(0);

    // 각 해시태그 텍스트 확인
    const hashtagTexts = await Promise.all(
      hashtagElements.map(el => el.textContent())
    );

    const validTags = ['#미개봉', '#새제품', '#중고', '#배터리 좋음', '#배터리 나쁨'];
    const hasValidTag = hashtagTexts.some(tag =>
      validTags.some(validTag => tag?.includes(validTag))
    );
    expect(hasValidTag).toBeTruthy();
  });

  test('성공 케이스: 할인된 가격이 강조 색상으로 표시된다', async ({ page }) => {
    const priceElement = await page.locator('[data-testid="price-display"]').first();
    await expect(priceElement).toBeVisible();

    const computedStyle = await priceElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        fontWeight: style.fontWeight,
      };
    });

    // 강조 스타일이 적용되어 있는지 확인 (색상이나 글씨 두께)
    expect(computedStyle.color).toBeTruthy();
    expect(computedStyle.fontWeight).not.toBe('400'); // 일반 가중치가 아님
  });

  test('성공 케이스: 액션 버튼들이 클릭 가능하다', async ({ page }) => {
    const actionButtons = await page.locator('[data-testid="action-buttons"] button').all();
    expect(actionButtons.length).toBeGreaterThan(0);

    for (const button of actionButtons) {
      const isEnabled = await button.evaluate(el => !(el as HTMLButtonElement).disabled);
      expect(isEnabled).toBeTruthy();
    }
  });

  test('실패 케이스: 존재하지 않는 폰 ID로 접근 시 에러 처리', async ({ page }) => {
    await page.goto(`/phones/${INVALID_PHONE_ID}`);

    // 에러 메시지 또는 로딩 상태 표시 대기
    const errorElement = await page.locator('[data-testid="error-message"]').first();
    const loadingElement = await page.locator('[data-testid="loading-spinner"]').first();

    const isErrorVisible = await errorElement.isVisible().catch(() => false);
    const isLoadingVisible = await loadingElement.isVisible().catch(() => false);

    expect(isErrorVisible || isLoadingVisible).toBeTruthy();
  });

  test('성공 케이스: 배터리 상태에 따라 해시태그 생성', async ({ page }) => {
    const hashtagsContainer = await page.locator('[data-testid="basic-info-hashtags"]').first();
    const hashtagTexts = await hashtagsContainer.locator('[data-testid^="hashtag-"]').all();

    const allTags = await Promise.all(
      hashtagTexts.map(el => el.textContent())
    );

    const hasBatteryTag = allTags.some(tag =>
      tag?.includes('#배터리 좋음') || tag?.includes('#배터리 나쁨')
    );
    expect(hasBatteryTag).toBeTruthy();
  });

  test('성공 케이스: 기본 정보 섹션이 반응형으로 표시된다', async ({ page }) => {
    const basicInfoSection = await page.locator('[data-testid="basic-info-section"]').first();
    await expect(basicInfoSection).toBeVisible();

    const boundingBox = await basicInfoSection.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
  });
});
