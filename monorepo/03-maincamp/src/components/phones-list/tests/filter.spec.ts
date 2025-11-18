/**
 * 필터 상태 관리 테스트
 * @description Playwright를 사용한 필터 기능 테스트
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const FILTER_STORAGE_KEY = 'phone-filters';

interface PersistedFilterState {
  availableNow: boolean;
  dateRange: { startDate: string | null; endDate: string | null };
  keyword: string;
}

const readFilterState = async (page: Page): Promise<PersistedFilterState | null> => {
  const raw = await page.evaluate(
    (storageKey) => window.localStorage.getItem(storageKey),
    FILTER_STORAGE_KEY,
  );

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed?.state ?? null;
  } catch {
    return null;
  }
};

const expectFilterState = async <T>(
  page: Page,
  selector: (state: PersistedFilterState) => T,
  expected: T,
) => {
  await expect
    .poll(async (): Promise<T | null> => {
      const state = await readFilterState(page);
      return state ? selector(state) : null;
    }, { timeout: 400 })
    .toEqual(expected);
};

test.describe('필터 상태 관리 (usePhoneFilters)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/phones');
    try {
      await page.locator('[data-testid="phones-list"]').waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      await page.waitForTimeout(2000);
    }
    try {
      await page.evaluate((key) => {
        try {
          window.localStorage.removeItem(key);
        } catch (e) {
          console.warn('localStorage removeItem failed:', e);
        }
      }, FILTER_STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage evaluate failed:', e);
    }
    await page.reload();
    try {
      await page.locator('[data-testid="phones-list"]').waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      await page.waitForTimeout(2000);
    }
  });

  test.describe('토글 상태 변경', () => {
    test('토글 클릭 시 availableNow 상태가 true ↔ false 전환되는지 검증', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="toggle-available"]');
      await expect(toggleButton).toBeVisible({ timeout: 400 });

      const checkbox = toggleButton.locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked({ timeout: 400 });

      await toggleButton.click();
      await expect(checkbox).not.toBeChecked({ timeout: 400 });

      await toggleButton.click();
      await expect(checkbox).toBeChecked({ timeout: 400 });
    });

    test('Zustand 스토어에 상태가 올바르게 저장되는지 검증', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="toggle-available"]');
      await expect(toggleButton).toBeVisible({ timeout: 400 });

      await toggleButton.click();
      await expectFilterState(page, (state) => state.availableNow, false);
    });
  });

  test.describe('날짜 범위 선택', () => {
    test('시작 날짜 선택 시 dateRange.startDate 업데이트 검증', async ({ page }) => {
      const dateInputs = page.locator('[data-testid="datepicker"] input[type="date"]');
      await expect(dateInputs).toHaveCount(2, { timeout: 400 });

      await dateInputs.first().fill('2025-01-01');
      await expect(dateInputs.first()).toHaveValue('2025-01-01', { timeout: 400 });
      await expectFilterState(page, (state) => state.dateRange.startDate, '2025-01-01');
    });

    test('종료 날짜 선택 시 dateRange.endDate 업데이트 검증', async ({ page }) => {
      const dateInputs = page.locator('[data-testid="datepicker"] input[type="date"]');
      await expect(dateInputs).toHaveCount(2, { timeout: 400 });

      await dateInputs.nth(1).fill('2025-12-31');
      await expect(dateInputs.nth(1)).toHaveValue('2025-12-31', { timeout: 400 });
      await expectFilterState(page, (state) => state.dateRange.endDate, '2025-12-31');
    });

    test('날짜 초기화 시 null로 리셋되는지 검증', async ({ page }) => {
      const dateInputs = page.locator('[data-testid="datepicker"] input[type="date"]');
      const resetButton = page.locator('[data-testid="reset-button"]');

      await expect(dateInputs).toHaveCount(2, { timeout: 400 });
      await expect(resetButton).toBeVisible({ timeout: 400 });

      await dateInputs.first().fill('2025-01-01');
      await dateInputs.nth(1).fill('2025-12-31');
      await resetButton.click();

      await expect(dateInputs.first()).toHaveValue('', { timeout: 400 });
      await expect(dateInputs.nth(1)).toHaveValue('', { timeout: 400 });
      await expectFilterState(page, (state) => state.dateRange.startDate, null);
      await expectFilterState(page, (state) => state.dateRange.endDate, null);
    });
  });

  test.describe('키워드 입력', () => {
    test('키워드 입력 시 keyword 상태 업데이트 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toBeVisible({ timeout: 400 });

      await searchInput.fill('아이폰');
      await expect(searchInput).toHaveValue('아이폰', { timeout: 400 });
      await expectFilterState(page, (state) => state.keyword, '아이폰');
    });

    test('2자 미만 입력 시 검색 버튼 비활성화 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 400 });
      await expect(searchButton).toBeVisible({ timeout: 400 });

      await searchInput.fill('아');
      await expect(searchButton).toBeDisabled({ timeout: 400 });
    });

    test('2자 이상 입력 시 검색 버튼 활성화 검증', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const searchButton = page.locator('[data-testid="search-button"]');

      await expect(searchInput).toBeVisible({ timeout: 400 });
      await expect(searchButton).toBeVisible({ timeout: 400 });

      await searchInput.fill('아이');
      await expect(searchButton).toBeEnabled({ timeout: 400 });
    });
  });

  test.describe('필터 조합 시나리오', () => {
    test('availableNow + dateRange 조합 가능', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="toggle-available"]');
      const dateInputs = page.locator('[data-testid="datepicker"] input[type="date"]');

      await expect(toggleButton).toBeVisible({ timeout: 400 });
      await expect(dateInputs).toHaveCount(2, { timeout: 400 });

      await toggleButton.click();
      await dateInputs.first().fill('2025-01-01');

      await expectFilterState(page, (state) => state.availableNow, false);
      await expectFilterState(page, (state) => state.dateRange.startDate, '2025-01-01');
    });

    test('모든 필터 동시 적용 가능', async ({ page }) => {
      const toggleButton = page.locator('[data-testid="toggle-available"]');
      const dateInputs = page.locator('[data-testid="datepicker"] input[type="date"]');
      const searchInput = page.locator('[data-testid="search-input"]');

      await expect(toggleButton).toBeVisible({ timeout: 400 });
      await expect(dateInputs).toHaveCount(2, { timeout: 400 });
      await expect(searchInput).toBeVisible({ timeout: 400 });

      await toggleButton.click();
      await dateInputs.first().fill('2025-01-01');
      await dateInputs.nth(1).fill('2025-12-31');
      await searchInput.fill('아이폰');

      await expectFilterState(page, (state) => state.availableNow, false);
      await expectFilterState(page, (state) => state.dateRange.startDate, '2025-01-01');
      await expectFilterState(page, (state) => state.dateRange.endDate, '2025-12-31');
      await expectFilterState(page, (state) => state.keyword, '아이폰');
    });
  });

  test.describe('필터 초기화 동작', () => {
    test('resetFilters 호출 시 모든 필터가 초기값으로 리셋', async ({ page }) => {
      const resetButton = page.locator('[data-testid="reset-button"]');
      const searchInput = page.locator('[data-testid="search-input"]');
      const toggleButton = page.locator('[data-testid="toggle-available"]');
      const dateInputs = page.locator('[data-testid="datepicker"] input[type="date"]');

      await expect(resetButton).toBeVisible({ timeout: 400 });
      await expect(searchInput).toBeVisible({ timeout: 400 });
      await expect(toggleButton).toBeVisible({ timeout: 400 });
      await expect(dateInputs).toHaveCount(2, { timeout: 400 });

      await toggleButton.click();
      await searchInput.fill('테스트');
      await dateInputs.first().fill('2025-02-01');
      await dateInputs.nth(1).fill('2025-02-10');

      await resetButton.click();

      await expectFilterState(page, (state) => state.availableNow, true);
      await expectFilterState(page, (state) => state.keyword, '');
      await expectFilterState(page, (state) => state.dateRange.startDate, null);
      await expectFilterState(page, (state) => state.dateRange.endDate, null);
    });
  });
});
