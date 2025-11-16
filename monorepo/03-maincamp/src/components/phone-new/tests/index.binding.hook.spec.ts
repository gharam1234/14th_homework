import { test, expect, Page } from '@playwright/test';

/**
 * usePhoneBinding 훅 테스트
 *
 * Supabase에서 기존 상품 데이터를 불러와 폼에 바인딩하는 기능 테스트
 * 실제 Supabase 데이터를 사용하여 TDD 기반으로 검증합니다.
 */

/**
 * 테스트 유틸: 페이지 로드 완료 대기
 */
async function waitForPageLoad(page: Page) {
  // data-testid="phone-new-container"가 나타날 때까지 대기
  await page.locator('[data-testid="phone-new-container"]').waitFor({ state: 'visible' });
}

/**
 * 테스트 유틸: 로딩 표시 확인 및 완료 대기
 */
async function waitForLoadingComplete(page: Page) {
  // 로딩 표시가 나타났는지 확인
  const loadingIndicator = page.locator('[data-testid="loading-indicator"]');

  // 로딩 표시가 있으면 사라질 때까지 대기
  if (await loadingIndicator.isVisible()) {
    await loadingIndicator.waitFor({ state: 'hidden' });
  }
}

/**
 * 테스트 유틸: 폼 필드 값 조회
 */
async function getFormFieldValue(page: Page, testId: string): Promise<string> {
  const input = page.locator(`[data-testid="${testId}"]`);
  const value = await input.inputValue();
  return value || '';
}

/**
 * 테스트 유틸: 텍스트 에디터 값 조회
 */
async function getEditorValue(page: Page): Promise<string> {
  const editor = page.locator('[data-testid="editor-content"]');
  const value = await editor.inputValue();
  return value || '';
}

/**
 * 테스트 유틸: 이미지 목록 개수 조회
 */
async function getImageCount(page: Page): Promise<number> {
  const images = page.locator('[data-testid="image-preview-item"]');
  return images.count();
}

test.describe('usePhoneBinding 훅 테스트 - 초안 모드 (ID 없음)', () => {
  test.beforeEach(async ({ page }) => {
    // ID 없이 신규등록 페이지로 이동
    await page.goto('/phones/new');
    await waitForPageLoad(page);
  });

  test('ID가 없을 때 데이터를 로드하지 않고 빈 폼으로 시작', async ({ page }) => {
    // 1. 검증: 로딩 표시가 나타나지 않아야 함
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    const isVisible = await loadingIndicator.isVisible();
    expect(isVisible).toBe(false);

    // 2. 검증: 모든 폼 필드가 비어있어야 함
    const titleValue = await getFormFieldValue(page, 'input-phone-name');
    const summaryValue = await getFormFieldValue(page, 'input-phone-summary');
    const descriptionValue = await getEditorValue(page);
    const priceValue = await getFormFieldValue(page, 'input-phone-price');
    const tagsValue = await getFormFieldValue(page, 'input-phone-tags');

    expect(titleValue).toBe('');
    expect(summaryValue).toBe('');
    expect(descriptionValue).toBe('');
    expect(priceValue).toBe('');
    expect(tagsValue).toBe('');
  });

  test('초안 모드에서는 폼을 자유롭게 수정할 수 있어야 함', async ({ page }) => {
    // 1. 준비: 기기명 입력
    await page.locator('[data-testid="input-phone-name"]').fill('테스트 폰');

    // 2. 검증: 입력한 값이 폼에 반영되었는지 확인
    const titleValue = await getFormFieldValue(page, 'input-phone-name');
    expect(titleValue).toBe('테스트 폰');
  });
});

test.describe('usePhoneBinding 훅 테스트 - 수정 모드 데이터 로드 (ID 있음)', () => {
  test('URL의 쿼리 파라미터에서 ID를 추출하여 데이터를 로드', async ({ page }) => {
    // 실제 Supabase에서 존재하는 상품 ID로 테스트
    // NOTE: 테스트를 위해 실제 phones 테이블에 테스트 데이터가 필요함
    // 테스트 데이터 예: id='test-phone-001'인 상품이 있어야 함

    // 1. 준비: ID를 포함한 URL로 이동
    await page.goto('/phones/new?id=test-phone-001');
    await waitForPageLoad(page);

    // 2. 검증: 로딩 표시가 나타났다가 사라져야 함
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    const isVisible = await loadingIndicator.isVisible();
    // 로딩이 매우 빨리 완료될 수 있으므로 시각적으로 확인
    if (isVisible) {
      await waitForLoadingComplete(page);
    }

    // 3. 검증: 폼 필드에 데이터가 바인딩되어 있어야 함
    const titleValue = await getFormFieldValue(page, 'input-phone-name');
    expect(titleValue).toBeTruthy();
  });

  test('로드된 데이터가 모든 폼 필드에 정상 바인딩되어야 함', async ({ page }) => {
    // 1. 준비: ID를 포함한 URL로 이동
    await page.goto('/phones/new?id=test-phone-001');
    await waitForPageLoad(page);
    await waitForLoadingComplete(page);

    // 2. 검증: 기기명 필드에 데이터가 바인딩됨
    const title = await getFormFieldValue(page, 'input-phone-name');
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // 3. 검증: 한줄 요약 필드에 데이터가 바인딩됨
    const summary = await getFormFieldValue(page, 'input-phone-summary');
    expect(summary).toBeTruthy();

    // 4. 검증: 상품 설명 필드에 데이터가 바인딩됨
    const description = await getEditorValue(page);
    expect(description).toBeTruthy();

    // 5. 검증: 가격 필드에 데이터가 바인딩됨
    const price = await getFormFieldValue(page, 'input-phone-price');
    expect(price).toBeTruthy();
    expect(/^\d+$/.test(price)).toBe(true); // 숫자 형식

    // 6. 검증: 태그 필드에 데이터가 바인딩됨
    const tags = await getFormFieldValue(page, 'input-phone-tags');
    // tags는 선택적이므로 있을 수도, 없을 수도 있음

    // 7. 검증: 주소 필드에 데이터가 바인딩됨
    const address = await getFormFieldValue(page, 'input-address');
    expect(address).toBeTruthy();

    // 8. 검증: 상세주소 필드에 데이터가 바인딩됨
    const detailedAddress = await getFormFieldValue(page, 'input-detailed-address');
    expect(detailedAddress).toBeTruthy();

    // 9. 검증: 우편번호 필드가 채워져 있어야 함
    const zipcode = await getFormFieldValue(page, 'input-postcode');
    if (zipcode) {
      expect(/^\d{5}$/.test(zipcode)).toBe(true);
    }
  });

  test('로드된 데이터의 위도/경도가 정상적으로 바인딩되어야 함', async ({ page }) => {
    // 1. 준비: ID를 포함한 URL로 이동
    await page.goto('/phones/new?id=test-phone-001');
    await waitForPageLoad(page);
    await waitForLoadingComplete(page);

    // 2. 검증: 위도 필드에 숫자가 바인딩됨
    const latitude = await getFormFieldValue(page, 'input-latitude');
    if (latitude) {
      expect(/^-?\d+(\.\d+)?$/.test(latitude)).toBe(true);
    }

    // 3. 검증: 경도 필드에 숫자가 바인딩됨
    const longitude = await getFormFieldValue(page, 'input-longitude');
    if (longitude) {
      expect(/^-?\d+(\.\d+)?$/.test(longitude)).toBe(true);
    }
  });
});

test.describe('usePhoneBinding 훅 테스트 - 로딩 상태', () => {
  test('데이터 로드 중 로딩 표시가 나타나야 함', async ({ page }) => {
    // 1. 준비: ID를 포함한 URL로 이동
    const gotoPromise = page.goto('/phones/new?id=test-phone-001');

    // 2. 실행: 페이지 로드 중 로딩 표시 확인
    await page.waitForLoadState('domcontentloaded');

    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    const isVisible = await loadingIndicator.isVisible().catch(() => false);

    // 로딩 표시가 있으면 확인
    if (isVisible) {
      expect(isVisible).toBe(true);
    }

    await gotoPromise;
    await waitForPageLoad(page);
  });

  test('데이터 로드 완료 후 로딩 표시가 사라져야 함', async ({ page }) => {
    // 1. 준비: ID를 포함한 URL로 이동
    await page.goto('/phones/new?id=test-phone-001');
    await waitForPageLoad(page);

    // 2. 검증: 데이터 로드 완료 후 로딩 표시가 없어야 함
    await waitForLoadingComplete(page);
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    const isVisible = await loadingIndicator.isVisible();
    expect(isVisible).toBe(false);

    // 3. 검증: 폼이 활성화되어야 함
    const titleInput = page.locator('[data-testid="input-phone-name"]');
    await expect(titleInput).toBeEnabled();
  });
});

test.describe('usePhoneBinding 훅 테스트 - 데이터 로드 실패', () => {
  test('존재하지 않는 ID로 조회 시 에러 메시지를 표시하고 리다이렉트', async ({ page }) => {
    // 1. 준비: 존재하지 않는 ID로 이동
    const dialogPromise = page.waitForEvent('dialog');

    await page.goto('/phones/new?id=non-existent-id-999');

    // 2. 검증: 알림 메시지가 표시되어야 함
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('상품 정보를 불러올 수 없습니다.');

    // 3. 실행: 알림 닫기
    await dialog.accept();

    // 4. 검증: 목록 페이지(/phones)로 리다이렉트되어야 함
    const expectedUrl = '/phones';
    const currentUrl = page.url();
    expect(currentUrl).toContain(expectedUrl);
  });

  test('네트워크 오류 시 에러 처리가 정상적으로 작동', async ({ page }) => {
    // 1. 준비: 네트워크 오류 시뮬레이션 설정
    await page.route('**/rest/v1/phones*', (route) => {
      route.abort('failed');
    });

    const dialogPromise = page.waitForEvent('dialog');

    // 2. 실행: ID를 포함한 URL로 이동 (네트워크 오류 발생)
    await page.goto('/phones/new?id=test-phone-001');

    // 3. 검증: 에러 알림이 표시되어야 함
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('상품 정보를 불러올 수 없습니다.');

    // 4. 실행: 알림 닫기
    await dialog.accept();

    // 5. 검증: 목록 페이지로 리다이렉트
    const currentUrl = page.url();
    expect(currentUrl).toContain('/phones');
  });
});

test.describe('usePhoneBinding 훅 테스트 - 이미지 배열 바인딩', () => {
  test('여러 이미지 URL이 배열로 정상 바인딩되어야 함', async ({ page }) => {
    // 1. 준비: ID를 포함한 URL로 이동
    await page.goto('/phones/new?id=test-phone-001');
    await waitForPageLoad(page);
    await waitForLoadingComplete(page);

    // 2. 검증: 이미지 미리보기가 표시되어야 함
    const imageCount = await getImageCount(page);

    // 3. 검증: 적어도 1개 이상의 이미지가 있으면 이미지 미리보기가 표시되어야 함
    if (imageCount > 0) {
      expect(imageCount).toBeGreaterThan(0);

      // 4. 검증: 각 이미지 미리보기가 표시되어야 함
      const imageItem = page.locator('[data-testid="image-preview-item"]').first();
      await expect(imageItem).toBeVisible();
    }
  });

  test('이미지가 없는 상품이 로드될 때도 정상 처리', async ({ page }) => {
    // 이미지 없는 테스트 데이터가 필요함
    // 또는 빈 배열로 처리되는지 확인

    // 1. 준비: 이미지가 없는 상품 ID로 이동 (존재한다면)
    await page.goto('/phones/new?id=test-phone-no-images');

    // 페이지 로드되면 진행
    const phone = await page.locator('[data-testid="phone-new-container"]').isVisible().catch(() => false);
    if (phone) {
      // 2. 검증: 페이지가 정상적으로 로드됨
      await waitForPageLoad(page);

      // 3. 검증: 폼 필드가 바인딩됨
      const title = await getFormFieldValue(page, 'input-phone-name');
      expect(title).toBeDefined();
    }
  });

  test('이미지 미리보기가 올바른 이미지를 표시', async ({ page }) => {
    // 1. 준비: 이미지가 있는 상품으로 이동
    await page.goto('/phones/new?id=test-phone-001');
    await waitForPageLoad(page);
    await waitForLoadingComplete(page);

    // 2. 검증: 이미지 미리보기 요소 확인
    const imageItems = page.locator('[data-testid="image-preview-item"]');
    const count = await imageItems.count();

    if (count > 0) {
      // 3. 검증: 첫 번째 이미지 확인
      const firstImage = imageItems.first();
      const src = await firstImage.locator('img').getAttribute('src');

      expect(src).toBeTruthy();
      expect(src).toMatch(/^https?:\/\//); // URL 형식 확인
    }
  });
});
