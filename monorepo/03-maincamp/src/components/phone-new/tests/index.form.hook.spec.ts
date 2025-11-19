import { Buffer } from 'buffer';
import { test, expect, Page } from '@playwright/test';

const NEW_PAGE_URL = '/phones/new';
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

async function clearLocalStorage(page: Page) {
  try {
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        // localStorage 접근이 차단된 경우 무시
        console.warn('localStorage clear failed:', e);
      }
    });
  } catch (e) {
    // evaluate 자체가 실패한 경우 무시
    console.warn('localStorage clear evaluate failed:', e);
  }
}

async function resetAndOpenNewPage(page: Page) {
  await page.goto(NEW_PAGE_URL);
  await waitForForm(page);
  await clearLocalStorage(page);
  await page.reload();
  await waitForForm(page);
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

async function fillRequiredFields(page: Page) {
  await page.locator('[data-testid="input-phone-name"]').fill('테스트 중고폰');
  await page.locator('[data-testid="input-phone-summary"]').fill('테스트 요약');
  await page.locator('[data-testid="editor-content"]').fill('테스트 설명입니다.');
  await page.locator('[data-testid="input-phone-price"]').fill('150000');
  await applyAddress(page);
  await page.locator('[data-testid="input-detailed-address"]').fill('101동 1001호');
}

async function uploadImage(page: Page, name = 'sample.png') {
  await page.setInputFiles('[data-testid="input-upload-image"]', {
    name,
    mimeType: 'image/png',
    buffer: SAMPLE_IMAGE_BUFFER,
  });
}

async function setPhoneData(page: Page, phoneId: string) {
  const storedValue = {
    phoneId,
    title: '기존 중고폰',
    summary: '기존 요약',
    description: '기존 설명',
    price: 90000,
    tags: '태그1, 태그2',
    address: '서울특별시 강남구 기존로 11',
    address_detail: '기존 상세주소',
    zipcode: '06000',
    latitude: 37.4979,
    longitude: 127.0276,
    mediaUrls: ['data:image/png;base64,aGVsbG8='],
    mediaMeta: [
      {
        id: `${phoneId}-0`,
        url: 'data:image/png;base64,aGVsbG8=',
        fileName: 'image-1.png',
        isPrimary: true,
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  await page.evaluate(
    ({ key, value }) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('setPhoneData failed:', error);
      }
    },
    {
      key: phoneId.startsWith('phone-') ? phoneId : `phone-${phoneId}`,
      value: storedValue,
    }
  );
}

test.describe('PhoneNew Form 컴포넌트 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await resetAndOpenNewPage(page);
  });

  test('신규등록 모드 - 기본 상태 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="input-phone-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="btn-submit"]')).toHaveText('등록하기');
    await expect(page.locator('[data-testid="btn-submit"]')).toBeDisabled();
    await expect(page.locator('[data-testid="map-placeholder-text"]')).toBeVisible();
  });

  test('신규등록 모드 - 필수값 입력 후 저장', async ({ page }) => {
    await fillRequiredFields(page);
    await uploadImage(page);

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await expect(submitButton).toBeEnabled();

    await submitButton.click();
    await page.waitForTimeout(500);

    const storedEntries = await page.evaluate(() => {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith('phone-'))
        .map((key) => JSON.parse(localStorage.getItem(key) as string));
    });

    expect(storedEntries.length).toBeGreaterThan(0);
    expect(storedEntries[0].title).toBe('테스트 중고폰');
    expect(storedEntries[0].mediaUrls.length).toBe(1);
  });

  test('신규등록 모드 - 가격 검증 실패 시 에러 메시지', async ({ page }) => {
    const priceInput = page.locator('[data-testid="input-phone-price"]');
    await priceInput.fill('-1000');
    await priceInput.blur();
    await expect(page.getByText('판매 가격은 0 이상이어야 합니다.')).toBeVisible();
  });

  test('수정 모드 - 기존 데이터 로드 및 저장', async ({ page }) => {
    const phoneId = 'phone-001';
    await setPhoneData(page, phoneId);

    await page.goto(`/phones/${phoneId}/edit`);
    await waitForForm(page);

    await expect(page.locator('[data-testid="input-phone-name"]')).toHaveValue('기존 중고폰');
    await expect(page.locator('[data-testid="btn-submit"]')).toHaveText('수정하기');

    await page.locator('[data-testid="input-phone-summary"]').fill('수정된 요약');
    await page.locator('[data-testid="editor-content"]').fill('수정된 설명');
    await page.locator('[data-testid="input-phone-price"]').fill('95000');

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await expect(submitButton).toBeEnabled();

    await submitButton.click();
    await page.waitForTimeout(500);

    const updated = await page.evaluate(({ key }) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, {
      key: phoneId.startsWith('phone-') ? phoneId : `phone-${phoneId}`,
    });

    expect(updated.summary).toBe('수정된 요약');
    expect(updated.price).toBe(95000);
  });

  test('수정 모드 - 취소 버튼으로 원본 값 복구', async ({ page }) => {
    const phoneId = 'phone-002';
    await setPhoneData(page, phoneId);
    await page.goto(`/phones/${phoneId}/edit`);
    await waitForForm(page);

    const titleInput = page.locator('[data-testid="input-phone-name"]');
    await titleInput.fill('임시 변경');
    await page.locator('[data-testid="btn-cancel"]').click();
    await expect(titleInput).toHaveValue('기존 중고폰');
  });

  test('우편번호 검색 모달 토글', async ({ page }) => {
    const openButton = page.locator('[data-testid="btn-postcode-search"]');
    await openButton.click();
    await expect(page.locator('[data-testid="postcode-modal"]')).toBeVisible();
    await page.locator('[data-testid="btn-close-postcode"]').click();
    await expect(page.locator('[data-testid="postcode-modal"]')).toHaveCount(0);
  });

  test('사진 첨부 - 최대 2장 제한 및 삭제', async ({ page }) => {
    await fillRequiredFields(page);
    await uploadImage(page, 'first.png');
    await uploadImage(page, 'second.png');

    await expect(page.locator('[data-testid^="image-preview-"]')).toHaveCount(2);
    await page.locator('[data-testid="btn-delete-image-0"]').click();
    await expect(page.locator('[data-testid^="image-preview-"]')).toHaveCount(1);
  });
});
