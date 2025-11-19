import { Buffer } from 'buffer';
import { test, expect, Page } from '@playwright/test';
const DRAFT_KEY = 'phone';
const SAMPLE_IMAGE_BUFFER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009077053d0000000a49444154789c6360000002000154a20af50000000049454e44ae426082',
  'hex'
);

async function waitForForm(page: Page) {
  // 컨테이너가 나타날 때까지 대기
  await page.locator('[data-testid="phone-new-container"]').waitFor({ state: 'visible', timeout: 10000 });
  // 로딩이 완료될 때까지 대기 (로딩 인디케이터가 사라질 때까지)
  await page.locator('[data-testid="loading-indicator"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // 로딩 인디케이터가 없으면 이미 로드된 것으로 간주
  });
  // 폼이 완전히 렌더링될 때까지 추가 대기
  await page.waitForTimeout(500);
}

async function applyAddress(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('phone:apply-address', {
        detail: {
          zonecode: '06236',
          address: '서울특별시 강남구 테헤란로 123',
          roadAddress: '서울특별시 강남구 테헤란로 123',
        },
      })
    );
  });
  await expect(page.locator('[data-testid="selected-address"]')).toContainText('테헤란로 123');
}

async function fillBaseFields(page: Page) {
  await page.locator('[data-testid="input-phone-name"]').fill('테스트 중고폰');
  await page.locator('[data-testid="input-phone-summary"]').fill('테스트 요약');
  await page.locator('[data-testid="editor-content"]').fill('테스트 설명입니다. 충분히 길게 써봅니다.');
  await page.locator('[data-testid="input-phone-price"]').fill('150000');
  await applyAddress(page);
  await page.locator('[data-testid="input-detailed-address"]').fill('101동 1001호');
}

async function attachImage(page: Page, name = 'sample.png') {
  await page.setInputFiles('[data-testid="input-upload-image"]', {
    name,
    mimeType: 'image/png',
    buffer: SAMPLE_IMAGE_BUFFER,
  });
  await expect(page.locator('[data-testid^="image-preview-"]')).toHaveCount(1);
}

test.describe('usePhoneSubmit 훅의 임시 저장 및 제출 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/phones/new');
    await waitForForm(page);
    await page.evaluate(() => {
      window.__TEST_PHONE_SUBMIT_USER_ID__ = 'test-user-001';
      window.__TEST_PHONE_SUBMIT__ = { result: 'success', createdPhoneId: 'test-phone-123' };
    });
  });

  test('입력 후 자동으로 로컬스토리지에 임시 저장되고 새로고침 시 복원됨', async ({ page }) => {
    await page.locator('[data-testid="input-phone-name"]').fill('자동 저장 폰');
    await page.locator('[data-testid="input-phone-summary"]').fill('자동 저장 요약');
    await page.locator('[data-testid="editor-content"]').fill('자동 저장 설명입니다.');
    await page.locator('[data-testid="input-phone-price"]').fill('100000');

    await expect(page).toHaveURL(/\/phones\/new$/);

    await page.waitForTimeout(1200);

    const stored = await page.evaluate(() => localStorage.getItem('phone'));
    expect(stored).toBeTruthy();

    await page.reload();
    await waitForForm(page);

    await expect(page.locator('[data-testid="input-phone-name"]')).toHaveValue('자동 저장 폰');
    await expect(page.locator('[data-testid="input-phone-summary"]')).toHaveValue('자동 저장 요약');
  });

  test('유효성 검증 실패 시 에러 메시지가 나타나야 함', async ({ page }) => {
    await fillBaseFields(page);
    await page.locator('[data-testid="input-phone-price"]').fill('-5000');
    await attachImage(page);

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page.locator('[data-testid="submit-validation-errors"]')).toContainText(
      '판매 가격은 0보다 커야 합니다.'
    );
    await expect(page).toHaveURL(/\/phones\/new$/);
  });

  test('등록 성공 시 상세 페이지로 이동하고 임시 저장이 삭제됨', async ({ page }) => {
    await fillBaseFields(page);
    await attachImage(page);

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await submitButton.click();

    await expect(page).toHaveURL(/\/phones\/test-phone-123$/);
    const storedAfter = await page.evaluate(() => localStorage.getItem('phone'));
    expect(storedAfter).toBeNull();
  });

  test('등록 실패 시 데이터가 남아있고 페이지에서 벗어나지 않음', async ({ page }) => {
    await page.evaluate(() => {
      window.__TEST_PHONE_SUBMIT__ = { result: 'error', errorMessage: 'mock fail' };
    });
    await fillBaseFields(page);
    await attachImage(page);

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await submitButton.click();

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/phones\/new$/);
    const storedAfter = await page.evaluate(() => localStorage.getItem('phone'));
    expect(storedAfter).toBeTruthy();
  });
});
