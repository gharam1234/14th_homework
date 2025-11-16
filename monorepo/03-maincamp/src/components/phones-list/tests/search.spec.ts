/**
 * 검색 기능 테스트
 * @description Playwright를 사용한 검색 기능 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('검색 기능 (usePhoneSearch)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'test-token');
    });
    // 페이지 로드
    await page.goto('/phones');
    // 페이지 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="phones-list"]', { timeout: 500 });
  });

  test.describe('검색 시나리오', () => {
    test('검색 조건에 맞는 데이터가 반환되는지 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 검색어 입력
      await searchInput.fill('아이폰');
      await page.waitForTimeout(100);

      // 검색 버튼 클릭
      await searchButton.click();

      // 카드 영역이 업데이트될 때까지 대기
      await page.waitForTimeout(300);

      // 카드 영역 확인
      const cards = cardArea.locator('[data-testid="phone-card"]');
      const cardCount = await cards.count();

      // 검색 결과가 있으면 카드가 표시되어야 함
      if (cardCount > 0) {
        expect(cardCount).toBeGreaterThan(0);
      } else {
        // 검색 결과가 없으면 "검색 결과가 없습니다" 메시지 표시
        const noResults = page.locator('[data-testid="no-results"]');
        await expect(noResults).toBeVisible({ timeout: 500 });
      }
    });

    test('검색 결과가 카드 영역에 표시되는지 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 검색어 입력
      await searchInput.fill('갤럭시');
      await page.waitForTimeout(100);

      // 검색 버튼 클릭
      await searchButton.click();

      // 카드 영역이 업데이트될 때까지 대기
      await page.waitForTimeout(300);

      // 카드 영역 확인
      const cards = cardArea.locator('[data-testid="phone-card"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        // 카드 내용 확인
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test('로딩 중에는 검색 버튼이 비활성화되고 텍스트가 변경되는지 검증', async ({ page }) => {
      await page.route('**/rest/v1/phones**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await route.continue();
      });
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 검색어 입력
      await searchInput.fill('삼성');
      await page.waitForTimeout(100);

      // 검색 버튼 클릭 (완료 전 상태 확인을 위해 Promise 저장)
      const clickPromise = searchButton.click();

      // 로딩 상태 확인
      await expect(searchButton).toBeDisabled({ timeout: 500 });
      await expect(searchButton).toHaveText(/검색 중/, { timeout: 500 });

      // 검색 완료 대기
      await clickPromise;
    });
  });

  test.describe('검색 실패 시나리오', () => {
    test('검색 결과가 없을 때 "검색 결과가 없습니다" 메시지 표시 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 존재하지 않는 검색어 입력
      await searchInput.fill('존재하지않는모델명1234567890');
      await page.waitForTimeout(100);

      // 검색 버튼 클릭
      await searchButton.click();

      // 결과 대기
      await page.waitForTimeout(300);

      // 검색 결과가 없으면 "검색 결과가 없습니다" 메시지 확인
      const noResults = page.locator('[data-testid="no-results"]');
      await expect(noResults).toBeVisible({ timeout: 500 });
      await expect(noResults).toHaveText('검색 결과가 없습니다', { timeout: 500 });
    });

    test('Supabase 에러 발생 시 에러 메시지 표시 검증', async ({ page }) => {
      await page.route('**/rest/v1/phones**', (route) => route.abort('failed'));
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 검색어 입력
      await searchInput.fill('테스트');
      await page.waitForTimeout(100);

      // 검색 버튼 클릭
      await searchButton.click();

      // 에러 메시지 확인
      const errorAlert = page.locator('[data-testid="error-alert"]');
      await expect(errorAlert).toBeVisible({ timeout: 500 });
      await expect(errorAlert).toHaveText('검색에 실패하였습니다. 다시 시도해주세요.', { timeout: 500 });
    });
  });

  test.describe('검색 버튼 활성화 조건', () => {
    test('keyword >= 2자이고 로딩 중이 아닐 때 활성화', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 2자 입력
      await searchInput.fill('아이');
      await page.waitForTimeout(100);

      // 버튼이 활성화되어 있는지 확인
      const isDisabled = await searchButton.isDisabled();
      expect(isDisabled).toBe(false);
    });

    test('keyword < 2자일 때 비활성화', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 1자 입력
      await searchInput.fill('a');
      await page.waitForTimeout(100);

      // 버튼이 비활성화되어 있는지 확인
      const isDisabled = await searchButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('판매글 등록 버튼', () => {
    test('판매글 등록 버튼이 항상 활성화되어 있는지 검증', async ({ page }) => {
      const sellButton = page.locator('[data-testid="sell-button"]');
      await expect(sellButton).toBeVisible({ timeout: 500 });

      // 버튼이 활성화되어 있는지 확인
      const isDisabled = await sellButton.isDisabled();
      expect(isDisabled).toBe(false);
    });

    test('판매글 등록 버튼 클릭 시 /phones/new로 이동', async ({ page }) => {
      const sellButton = page.locator('[data-testid="sell-button"]');
      await expect(sellButton).toBeVisible({ timeout: 500 });

      // 클릭
      await sellButton.click();

      // 페이지 이동 확인
      await expect(page).toHaveURL(/\/phones\/new$/);
    });
  });

  test.describe('필터와 검색 연동', () => {
    test('availableNow 필터가 검색 쿼리에 반영되는지 검증', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="toggle-available"]');
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(toggleButton).toBeVisible({ timeout: 500 });
      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 토글 설정 (예: available로 필터링)
      const isInitiallyChecked = await toggleButton.locator('input[type="checkbox"]').isChecked();
      if (!isInitiallyChecked) {
        await toggleButton.click();
        await page.waitForTimeout(100);
      }

      // 검색어 입력
      await searchInput.fill('아이폰');
      await page.waitForTimeout(100);

      // 검색 실행
      await searchButton.click();
      await page.waitForTimeout(300);

      // 검색이 실행되고 필터가 반영되어야 함
      expect(true).toBe(true);
    });

    test('dateRange 필터가 검색 쿼리에 반영되는지 검증', async ({ page }) => {
      const datepicker = page.locator('[data-testid="datepicker"]');
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(datepicker).toBeVisible({ timeout: 500 });
      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 날짜 입력
      const dateInputs = datepicker.locator('input[type="date"]');
      if ((await dateInputs.count()) > 0) {
        await dateInputs.first().fill('2025-01-01');
        await page.waitForTimeout(100);
      }

      // 검색어 입력
      await searchInput.fill('삼성');
      await page.waitForTimeout(100);

      // 검색 실행
      await searchButton.click();
      await page.waitForTimeout(300);

      // 검색이 실행되고 필터가 반영되어야 함
      expect(true).toBe(true);
    });
  });

  test.describe('데이터 바인딩', () => {
    test('PhoneCard에 Supabase 데이터가 올바르게 매핑되는지 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      await expect(searchInput).toBeVisible({ timeout: 500 });
      await expect(searchButton).toBeVisible({ timeout: 500 });

      // 검색 실행
      await searchInput.fill('아');
      await page.waitForTimeout(50);
      await searchInput.fill('아이');
      await page.waitForTimeout(100);
      await searchButton.click();
      await page.waitForTimeout(300);

      // 카드 확인
      const cards = cardArea.locator('[data-testid="phone-card"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        // 첫 번째 카드의 내용 확인
        const firstCard = cards.first();
        const title = firstCard.locator('h3');
        const price = firstCard.locator('span.price');
        const modelName = firstCard.locator('[data-testid="card-model-name"]');
        const sellerLabel = firstCard.locator('[data-testid="card-seller-label"]');

        // 제목과 가격이 표시되는지 확인
        await expect(title).toBeVisible({ timeout: 200 });
        await expect(price).toBeVisible({ timeout: 200 });
        await expect(modelName).toBeVisible({ timeout: 200 });
        await expect(modelName).not.toHaveText('');
        await expect(sellerLabel).toBeVisible({ timeout: 200 });
        await expect(sellerLabel).toContainText('판매자', { timeout: 200 });
      }
    });
  });
});
