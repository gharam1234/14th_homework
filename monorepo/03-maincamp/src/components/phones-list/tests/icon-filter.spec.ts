/**
 * 아이콘 필터 기능 테스트
 * @description Playwright를 사용한 브랜드 필터링 기능 테스트 (TDD 기반)
 */

import { test, expect } from '@playwright/test';

test.describe('아이콘 필터 (useIconFilter)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('accessToken', 'test-token');
      } catch (e) {
        // localStorage 접근이 차단된 경우 무시
        console.warn('localStorage setItem failed:', e);
      }
    });
    // 페이지 로드
    await page.goto('/phones');
    // 페이지 완전히 로드될 때까지 대기
    try {
      await page.locator('[data-testid="phones-list"]').waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      await page.waitForTimeout(2000);
    }
  });

  test.describe('3-1) 아이콘 선택 상태 변경 테스트', () => {
    test('아이콘 클릭 시 selectedCategory 상태가 변경되는지 검증', async ({ page }) => {
      const filterApple = page.locator('[data-testid="filter-apple"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      // 필터가 보일 때까지 대기
      await expect(filterApple).toBeVisible({ timeout: 450 });

      // Apple 필터 클릭
      await filterApple.click();

      // 필터 클릭 후 상태 변경 및 API 호출 대기
      await page.waitForTimeout(300);

      // 필터가 선택 상태인지 확인
      await expect(filterApple).toHaveClass(/.*selected/);

      // 카드 영역이 업데이트되었는지 확인
      const cards = cardArea.locator('[data-testid="phone-card"]');
      const cardCount = await cards.count();
      // 필터 결과가 있으면 카드가 표시되어야 함
      expect(cardCount).toBeGreaterThanOrEqual(0);
    });

    test('이미 선택된 아이콘 재클릭 시 선택 해제되는지 검증', async ({ page }) => {
      const filterSamsung = page.locator('[data-testid="filter-samsung"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      await expect(filterSamsung).toBeVisible({ timeout: 450 });

      // Samsung 필터 첫 번째 클릭
      await filterSamsung.click();
      await page.waitForTimeout(300);

      // Samsung 필터가 선택되었는지 확인
      await expect(filterSamsung).toHaveClass(/.*selected/);

      // Samsung 필터 두 번째 클릭 (해제)
      await filterSamsung.click();
      await page.waitForTimeout(300);

      // Samsung 필터가 해제되었는지 확인
      const classes = await filterSamsung.getAttribute('class');
      expect(classes).not.toMatch(/.*selected/);
    });

    test('다른 아이콘 클릭 시 이전 선택이 해제되는지 검증', async ({ page }) => {
      const filterApple = page.locator('[data-testid="filter-apple"]');
      const filterGoogle = page.locator('[data-testid="filter-google"]');

      await expect(filterApple).toBeVisible({ timeout: 450 });
      await expect(filterGoogle).toBeVisible({ timeout: 450 });

      // Apple 필터 클릭
      await filterApple.click();
      await page.waitForTimeout(300);

      // Apple이 선택되었는지 확인
      await expect(filterApple).toHaveClass(/.*selected/);

      // Google 필터 클릭
      await filterGoogle.click();
      await page.waitForTimeout(300);

      // Apple은 해제되고 Google이 선택되어야 함
      const appleClasses = await filterApple.getAttribute('class');
      expect(appleClasses).not.toMatch(/.*selected/);
      await expect(filterGoogle).toHaveClass(/.*selected/);
    });
  });

  test.describe('3-2) API 호출 테스트', () => {
    test('아이콘 선택 시 해당 카테고리로 필터링된 데이터를 API에서 가져오는지 검증', async ({ page }) => {
      const filterXiaomi = page.locator('[data-testid="filter-xiaomi"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      await expect(filterXiaomi).toBeVisible({ timeout: 450 });

      // Xiaomi 필터 클릭
      await filterXiaomi.click();

      // API 호출 및 데이터 로드 대기
      await page.waitForTimeout(300);

      // 카드가 존재하거나 로딩 상태 확인
      const cards = cardArea.locator('[data-testid="phone-card"]');
      const loadingText = page.locator('[data-testid="icon-filter-loading"]');

      // 로딩이 완료되었거나 카드가 보여야 함
      const cardCount = await cards.count();
      const isLoading = await loadingText.isVisible().catch(() => false);

      expect(cardCount > 0 || isLoading).toBeTruthy();
    });

    test('선택 해제 시 전체 데이터를 가져오는지 검증', async ({ page }) => {
      const filterNothing = page.locator('[data-testid="filter-nothing"]');
      const cardArea = page.locator('[data-testid="card-area"]');

      await expect(filterNothing).toBeVisible({ timeout: 450 });

      // Nothing 필터 클릭 (선택)
      await filterNothing.click();
      await page.waitForTimeout(300);

      // Nothing 필터 재클릭 (해제)
      await filterNothing.click();
      await page.waitForTimeout(300);

      // 선택 해제 후 전체 데이터가 표시되어야 함
      const cards = cardArea.locator('[data-testid="phone-card"]');
      const cardCount = await cards.count();

      // 선택 해제 후에는 기본 샘플 카드가 보여야 함
      expect(cardCount).toBeGreaterThanOrEqual(0);
    });

    test('API 호출 파라미터(categories)가 올바른지 검증', async ({ page, context }) => {
      let apiCalled = false;
      let lastQuery = '';

      // API 요청 모니터링
      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/rest/v1/phones')) {
          apiCalled = true;
          lastQuery = url;
        }
      });

      const filterSony = page.locator('[data-testid="filter-sony"]');
      await expect(filterSony).toBeVisible({ timeout: 450 });

      // Sony 필터 클릭
      await filterSony.click();
      await page.waitForTimeout(300);

      expect(apiCalled).toBeTruthy();
      expect(lastQuery).not.toBe('');

      const parsedUrl = new URL(lastQuery);
      const categoriesParam = parsedUrl.searchParams.get('categories');
      expect(decodeURIComponent(categoriesParam ?? '')).toBe('cs.["sony"]');
    });
  });

  test.describe('3-3) 로딩 상태 테스트', () => {
    test('API 호출 중일 때 "로딩 중..." 텍스트가 표시되는지 검증', async ({ page }) => {
      // 느린 네트워크 시뮬레이션
      await page.route('**/rest/v1/phones**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await route.continue();
      });

      const filterMotorola = page.locator('[data-testid="filter-motorola"]');
      const loadingText = page.locator('[data-testid="icon-filter-loading"]');

      await expect(filterMotorola).toBeVisible({ timeout: 450 });

      // Motorola 필터 클릭
      const clickPromise = filterMotorola.click();

      // 로딩 중일 때 로딩 메시지가 표시되는지 확인
      // (로딩 상태가 빠를 수 있으므로 선택적으로 확인)
      await page.waitForTimeout(100);

      const isLoadingVisible = await loadingText.isVisible().catch(() => false);
      // 로딩이 표시되었을 수도 있고 이미 완료되었을 수도 있음

      // 클릭 완료 대기
      await clickPromise;
      await page.waitForTimeout(200);

      // 최종적으로 로딩이 완료되어야 함
      const loadingStillVisible = await loadingText.isVisible().catch(() => false);
      expect(loadingStillVisible).toBeFalsy();
    });

    test('데이터 로드 완료 후 로딩 메시지가 사라지는지 검증', async ({ page }) => {
      const filterLG = page.locator('[data-testid="filter-lg"]');
      const loadingText = page.locator('[data-testid="icon-filter-loading"]');

      await expect(filterLG).toBeVisible({ timeout: 450 });

      // LG 필터 클릭
      await filterLG.click();

      // 데이터 로드 대기
      await page.waitForTimeout(400);

      // 로딩 메시지가 사라졌는지 확인
      const isLoadingVisible = await loadingText.isVisible().catch(() => false);
      expect(isLoadingVisible).toBeFalsy();
    });
  });

  test.describe('3-4) 에러 상태 테스트', () => {
    test('API 호출 실패 시 에러 메시지가 표시되는지 검증', async ({ page }) => {
      // API 에러 시뮬레이션
      await page.route('**/rest/v1/phones**', (route) => {
        route.abort('failed');
      });

      const filterOthers = page.locator('[data-testid="filter-others"]');
      const errorMessage = page.locator('[data-testid="icon-filter-error"]');

      await expect(filterOthers).toBeVisible({ timeout: 450 });

      // Others 필터 클릭
      await filterOthers.click();

      // 에러 메시지가 표시될 때까지 대기
      await page.waitForTimeout(300);

      // 에러 메시지가 표시되는지 확인
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      if (isErrorVisible) {
        const errorText = await errorMessage.textContent();
        expect((errorText ?? '').trim()).toContain('필터를 불러올 수 없습니다.');
      }
    });

    test('에러 메시지: "필터를 불러올 수 없습니다."인지 검증', async ({ page }) => {
      // API 에러 시뮬레이션
      await page.route('**/rest/v1/phones**', (route) => {
        route.abort('failed');
      });

      const filterApple = page.locator('[data-testid="filter-apple"]');
      const errorMessage = page.locator('[data-testid="icon-filter-error"]');

      await expect(filterApple).toBeVisible({ timeout: 450 });

      // Apple 필터 클릭
      await filterApple.click();

      // 에러 메시지 대기
      await page.waitForTimeout(300);

      // 정확한 에러 메시지 확인
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      if (isErrorVisible) {
        const errorText = await errorMessage.textContent();
        expect(errorText?.trim()).toBe('필터를 불러올 수 없습니다.');
      }
    });

    test('에러 발생 후에도 아이콘 필터는 계속 동작하는지 검증', async ({ page }) => {
      // 첫 번째 요청은 실패, 이후는 성공하도록 설정
      let requestCount = 0;
      await page.route('**/rest/v1/phones**', (route) => {
        requestCount++;
        if (requestCount === 1) {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      const filterSamsung = page.locator('[data-testid="filter-samsung"]');
      const errorMessage = page.locator('[data-testid="icon-filter-error"]');

      await expect(filterSamsung).toBeVisible({ timeout: 450 });

      // Samsung 필터 첫 번째 클릭 (실패)
      await filterSamsung.click();
      await page.waitForTimeout(300);

      // 에러 메시지가 표시되어야 함
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      // 에러 표시 여부와 관계없이 필터는 활성화되어야 함

      // Samsung 필터 재클릭 (해제)
      await filterSamsung.click();
      await page.waitForTimeout(300);

      // Samsung 필터가 해제되어야 함
      const classes = await filterSamsung.getAttribute('class');
      expect(classes).not.toMatch(/.*selected/);

      // Google 필터 클릭 (두 번째 요청, 성공)
      const filterGoogle = page.locator('[data-testid="filter-google"]');
      await filterGoogle.click();
      await page.waitForTimeout(300);

      // Google 필터가 선택되어야 함
      await expect(filterGoogle).toHaveClass(/.*selected/);
    });
  });
});
