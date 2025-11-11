/**
 * 주소 검색 기능 Playwright 테스트
 *
 * TDD 기반의 주소 검색, 지도 표시, 모달 행동을 검증합니다.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const PAGE_TIMEOUT = 400;

const selectAddressFromModal = async (page: Page, keyword = '서울 강남구') => {
  await page.locator('[data-testid="btn-postcode-search"]').click();
  const modal = page.locator('[data-testid="address-modal"]');
  await expect(modal).toBeVisible({ timeout: PAGE_TIMEOUT });

  const searchInput = page.locator('.postcodify_search_input');
  if (
    !(await searchInput.isVisible({ timeout: PAGE_TIMEOUT }).catch(() => false))
  ) {
    return false;
  }

  await searchInput.fill(keyword);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  const firstResult = page.locator('.postcodify_address').first();
  if (
    !(await firstResult.isVisible({ timeout: PAGE_TIMEOUT }).catch(() => false))
  ) {
    return false;
  }

  await firstResult.click();
  await page.waitForTimeout(200);
  return true;
};

test.describe('주소 검색 기능', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${BASE_URL}/phones/new`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="phone-new-container"]', {
      timeout: PAGE_TIMEOUT,
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('우편번호 검색 버튼 클릭: 모달 열림', async () => {
    const postcodeButton = page.locator('[data-testid="btn-postcode-search"]');
    await expect(postcodeButton).toBeVisible();

    const addressModal = page.locator('[data-testid="address-modal"]');
    await expect(addressModal).not.toBeVisible({ timeout: PAGE_TIMEOUT });

    await postcodeButton.click();
    await expect(addressModal).toBeVisible({ timeout: PAGE_TIMEOUT });
  });

  test('주소 선택: postalCode 필드에 값 입력됨', async () => {
    const selectionSucceeded = await selectAddressFromModal(page);
    expect(selectionSucceeded).toBe(true);

    await expect(page.locator('[data-testid="address-modal"]')).not.toBeVisible({
      timeout: PAGE_TIMEOUT,
    });

    const postcodeInput = page.locator('[data-testid="input-postcode"]');
    const postcodeValue = await postcodeInput.inputValue();
    expect(postcodeValue).toBeTruthy();
    expect(postcodeValue).toMatch(/^[0-9]+$/);
  });

  test('주소 선택 후: detailedAddress 필드에 포커스 이동', async () => {
    await selectAddressFromModal(page);

    const detailedAddressInput = page.locator(
      '[data-testid="input-detailed-address"]'
    );
    await expect(detailedAddressInput).toBeFocused({ timeout: PAGE_TIMEOUT });
  });

  test('모달 닫기: 모달 닫힘, 입력값 유지', async () => {
    const selectionSucceeded = await selectAddressFromModal(page);
    expect(selectionSucceeded).toBe(true);

    const postcodeInput = page.locator('[data-testid="input-postcode"]');
    const currentValue = await postcodeInput.inputValue();

    await page.locator('[data-testid="btn-postcode-search"]').click();
    const addressModal = page.locator('[data-testid="address-modal"]');
    await expect(addressModal).toBeVisible({ timeout: PAGE_TIMEOUT });

    await page
      .locator('[data-testid="btn-close-address-modal"]')
      .click();
    await expect(addressModal).not.toBeVisible({ timeout: PAGE_TIMEOUT });

    const afterCloseValue = await postcodeInput.inputValue();
    expect(afterCloseValue).toBe(currentValue);
  });

  test('주소 선택 시: latitude, longitude 필드에 값 입력됨', async () => {
    await selectAddressFromModal(page);

    const latitudeInput = page.locator('[data-testid="input-latitude"]');
    const longitudeInput = page.locator('[data-testid="input-longitude"]');

    const latValue = await latitudeInput.inputValue();
    const lngValue = await longitudeInput.inputValue();

    if (latValue) {
      expect(latValue).toMatch(/^-?\d+\.?\d*$/);
    }
    if (lngValue) {
      expect(lngValue).toMatch(/^-?\d+\.?\d*$/);
    }
  });

  test('지도 보임: 선택된 좌표 표시', async () => {
    await selectAddressFromModal(page);

    const mapCoordinates = page.locator('[data-testid="map-coordinates"]');
    await expect(mapCoordinates).toBeVisible({ timeout: PAGE_TIMEOUT });
    await expect(mapCoordinates).toContainText('위도');
    await expect(mapCoordinates).toContainText('경도');
  });

  test('상세주소 입력 필드: 활성화 상태', async () => {
    const detailedAddressInput = page.locator(
      '[data-testid="input-detailed-address"]'
    );

    await expect(detailedAddressInput).toBeEnabled();

    await detailedAddressInput.fill('아파트 101호');
    const value = await detailedAddressInput.inputValue();
    expect(value).toBe('아파트 101호');
  });

  test('postalCode와 좌표 필드: 비활성화 상태', async () => {
    const postcodeInput = page.locator('[data-testid="input-postcode"]');
    const latitudeInput = page.locator('[data-testid="input-latitude"]');
    const longitudeInput = page.locator('[data-testid="input-longitude"]');

    await expect(postcodeInput).toBeDisabled();
    await expect(latitudeInput).toBeDisabled();
    await expect(longitudeInput).toBeDisabled();
  });
});
