/**
 * usePhoneState 훅 테스트
 *
 * 상품 정보 상태 관리 및 모드 관리 시스템 테스트
 */

import { test, expect } from '@playwright/test';

const TEST_PAGE_URL = '/phone-new/test-state-hook';

test.describe('usePhoneState 훅 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    await page.waitForSelector('[data-testid="phone-state-test-container"]', { timeout: 400 });
  });

  test('1. 초안 모드 초기화 테스트 - 모든 필드가 빈 값으로 초기화되는지 검증', async ({
    page,
  }) => {
    // 초기 모드 확인
    const mode = await page.locator('[data-testid="current-mode"]').textContent();
    expect(mode).toBe('draft');

    // 초기값 확인
    const title = await page.locator('[data-testid="state-title"]').textContent();
    const summary = await page.locator('[data-testid="state-summary"]').textContent();
    const description = await page.locator('[data-testid="state-description"]').textContent();
    const price = await page.locator('[data-testid="state-price"]').textContent();
    const tags = await page.locator('[data-testid="state-tags"]').textContent();
    const address = await page.locator('[data-testid="state-address"]').textContent();
    const addressDetail = await page.locator('[data-testid="state-address-detail"]').textContent();
    const zipcode = await page.locator('[data-testid="state-zipcode"]').textContent();
    const latitude = await page.locator('[data-testid="state-latitude"]').textContent();
    const longitude = await page.locator('[data-testid="state-longitude"]').textContent();
    const categories = await page.locator('[data-testid="state-categories"]').textContent();
    const saleState = await page.locator('[data-testid="state-sale-state"]').textContent();
    const mediaUrls = await page.locator('[data-testid="state-media-urls"]').textContent();

    expect(title).toBe('');
    expect(summary).toBe('');
    expect(description).toBe('');
    expect(price).toBe('0');
    expect(tags).toBe('[]');
    expect(address).toBe('');
    expect(addressDetail).toBe('');
    expect(zipcode).toBe('');
    expect(latitude).toBe('0');
    expect(longitude).toBe('0');
    expect(categories).toBe('[]');
    expect(saleState).toBe('available');
    expect(mediaUrls).toBe('[]');
  });

  test('2. 필드 업데이트 테스트 - updateField로 각 필드 값 변경 시 정상 업데이트되는지 검증', async ({
    page,
  }) => {
    // title 업데이트
    await page.locator('[data-testid="update-title"]').click();
    let title = await page.locator('[data-testid="state-title"]').textContent();
    expect(title).toBe('테스트 상품명');

    // summary 업데이트
    await page.locator('[data-testid="update-summary"]').click();
    let summary = await page.locator('[data-testid="state-summary"]').textContent();
    expect(summary).toBe('테스트 요약');

    // price 업데이트
    await page.locator('[data-testid="update-price"]').click();
    let price = await page.locator('[data-testid="state-price"]').textContent();
    expect(price).toBe('50000');

    // tags 업데이트
    await page.locator('[data-testid="update-tags"]').click();
    let tags = await page.locator('[data-testid="state-tags"]').textContent();
    expect(tags).toBe('["태그1","태그2"]');

    // sale_state 업데이트
    await page.locator('[data-testid="update-sale-state"]').click();
    let saleState = await page.locator('[data-testid="state-sale-state"]').textContent();
    expect(saleState).toBe('reserved');
  });

  test('3. 리셋 테스트 - resetState 호출 시 현재 모드의 초기값으로 돌아가는지 검증', async ({
    page,
  }) => {
    // 필드 업데이트
    await page.locator('[data-testid="update-title"]').click();
    await page.locator('[data-testid="update-price"]').click();

    // 값 변경 확인
    let title = await page.locator('[data-testid="state-title"]').textContent();
    let price = await page.locator('[data-testid="state-price"]').textContent();
    expect(title).toBe('테스트 상품명');
    expect(price).toBe('50000');

    // 리셋
    await page.locator('[data-testid="reset-state"]').click();

    // 초기값으로 복원 확인
    title = await page.locator('[data-testid="state-title"]').textContent();
    price = await page.locator('[data-testid="state-price"]').textContent();
    expect(title).toBe('');
    expect(price).toBe('0');
  });

  test('4. 모드 전환 테스트 - draft → edit → completed 모드 전환 시 상태 변화 검증', async ({
    page,
  }) => {
    // 초기 모드 확인 (draft)
    let mode = await page.locator('[data-testid="current-mode"]').textContent();
    expect(mode).toBe('draft');

    // edit 모드로 전환
    await page.locator('[data-testid="switch-to-edit"]').click();
    mode = await page.locator('[data-testid="current-mode"]').textContent();
    expect(mode).toBe('edit');

    // edit 모드 데이터 확인
    const title = await page.locator('[data-testid="state-title"]').textContent();
    const price = await page.locator('[data-testid="state-price"]').textContent();
    expect(title).toBe('수정용 상품');
    expect(price).toBe('100000');

    // completed 모드로 전환
    await page.locator('[data-testid="switch-to-completed"]').click();
    mode = await page.locator('[data-testid="current-mode"]').textContent();
    expect(mode).toBe('completed');

    // completed 모드에서 필드 업데이트 시도가 무시되는지 확인
    const completedTitleBefore = await page.locator('[data-testid="state-title"]').textContent();
    await page.locator('[data-testid="update-title"]').click();
    const completedTitleAfter = await page.locator('[data-testid="state-title"]').textContent();
    expect(completedTitleAfter).toBe(completedTitleBefore);

    // draft 모드로 다시 전환
    await page.locator('[data-testid="switch-to-draft"]').click();
    mode = await page.locator('[data-testid="current-mode"]').textContent();
    expect(mode).toBe('draft');

    // draft 모드의 초기값 확인
    const resetTitle = await page.locator('[data-testid="state-title"]').textContent();
    expect(resetTitle).toBe('');
  });

  test('5. 수정 모드 데이터 로드 테스트 - edit 모드로 전환하면서 기존 데이터가 정상 로드되는지 검증', async ({
    page,
  }) => {
    // edit 모드로 전환 (데이터 포함)
    await page.locator('[data-testid="switch-to-edit"]').click();

    // 모드 확인
    const mode = await page.locator('[data-testid="current-mode"]').textContent();
    expect(mode).toBe('edit');

    // 로드된 데이터 확인
    const title = await page.locator('[data-testid="state-title"]').textContent();
    const summary = await page.locator('[data-testid="state-summary"]').textContent();
    const description = await page.locator('[data-testid="state-description"]').textContent();
    const price = await page.locator('[data-testid="state-price"]').textContent();
    const address = await page.locator('[data-testid="state-address"]').textContent();

    expect(title).toBe('수정용 상품');
    expect(summary).toBe('수정용 요약');
    expect(description).toBe('수정용 설명');
    expect(price).toBe('100000');
    expect(address).toBe('서울시 강남구');

    // setInitialData로 데이터 업데이트
    await page.locator('[data-testid="set-initial-data"]').click();

    // 업데이트된 데이터 확인
    const newTitle = await page.locator('[data-testid="state-title"]').textContent();
    const newPrice = await page.locator('[data-testid="state-price"]').textContent();
    expect(newTitle).toBe('외부 데이터 상품');
    expect(newPrice).toBe('200000');
  });

  test('6. edit 모드에서 리셋 테스트 - edit 모드의 초기값으로 리셋되는지 검증', async ({
    page,
  }) => {
    // edit 모드로 전환
    await page.locator('[data-testid="switch-to-edit"]').click();

    // 초기 데이터 확인
    let title = await page.locator('[data-testid="state-title"]').textContent();
    expect(title).toBe('수정용 상품');

    // 필드 업데이트
    await page.locator('[data-testid="update-title"]').click();
    title = await page.locator('[data-testid="state-title"]').textContent();
    expect(title).toBe('테스트 상품명');

    // 리셋
    await page.locator('[data-testid="reset-state"]').click();

    // edit 모드의 초기값으로 복원 확인
    title = await page.locator('[data-testid="state-title"]').textContent();
    expect(title).toBe('수정용 상품');
  });
});
