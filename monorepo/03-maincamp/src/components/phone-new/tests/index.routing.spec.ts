import { Buffer } from 'buffer';
import { test, expect, Page } from '@playwright/test';

/**
 * 중고폰 신규등록/수정 페이지 라우팅 테스트
 *
 * 취소 버튼, 제출 후 라우팅 기능 테스트 (신규등록/수정 모드 분리)
 */

/**
 * 테스트 유틸: 페이지 로드 완료 대기
 */
async function waitForPageLoad(page: Page) {
  // data-testid="phone-new-container"가 나타날 때까지 대기
  await page.locator('[data-testid="phone-new-container"]').waitFor({ state: 'visible', timeout: 10000 });
  // 로딩이 완료될 때까지 대기 (로딩 인디케이터가 사라질 때까지)
  await page.locator('[data-testid="loading-indicator"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // 로딩 인디케이터가 없으면 이미 로드된 것으로 간주
  });
  // 폼이 완전히 렌더링될 때까지 추가 대기
  await page.waitForTimeout(500);
}

/**
 * 테스트 유틸: 로컬스토리지 초기화
 */
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

/**
 * 테스트 유틸: 로컬스토리지에 중고폰 데이터 설정
 */
async function setPhoneData(page: Page, phoneId: string, data: Record<string, unknown>) {
  const setValue = () =>
    page.evaluate(
      ({ key, value }) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.warn('setPhoneData failed:', error);
          throw error;
        }
      },
      { key: `phone-${phoneId}`, value: data }
    );

  try {
    await setValue();
  } catch (error) {
    await page.goto('http://localhost:3000/phones/new');
    await waitForPageLoad(page);
    await setValue();
  }
}

/**
 * 테스트 유틸: 중고폰 폼 필드 자동 입력
 */
async function fillPhoneForm(page: Page) {
  // 기기명 입력
  await page.locator('[data-testid="input-phone-name"]').fill('아이폰 14 Pro 256GB');

  // 한줄 요약 입력
  await page.locator('[data-testid="input-phone-summary"]').fill('A급 상태, 자급제 모델');

  // 상품 설명 입력
  await page.locator('[data-testid="editor-content"]').fill('생활기스 거의 없는 아이폰 14 Pro 중고 제품입니다.');

  // 판매 가격 입력
  await page.locator('[data-testid="input-phone-price"]').fill('1180000');

  // 태그 입력
  await page.locator('[data-testid="input-phone-tags"]').fill('#Apple #A급 #안전거래');

  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('phone:apply-address', {
        detail: {
          zonecode: '06236',
          address: '서울특별시 강남구 역삼동 123',
          roadAddress: '서울특별시 강남구 테헤란로 123',
        },
      })
    );
  });
  await expect(page.locator('[data-testid="selected-address"]')).toContainText('테헤란로 123');
  await page.locator('[data-testid="input-detailed-address"]').fill('서울시 마포구 합정동 123-4');
}

/**
 * 테스트 유틸: 이미지 첨부 (파일 선택 대화 시뮬레이션)
 */
const SAMPLE_IMAGE_BUFFER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009077053d0000000a49444154789c6360000002000154a20af50000000049454e44ae426082',
  'hex'
);

async function attachImage(page: Page) {
  await page.setInputFiles('[data-testid="input-upload-image"]', {
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: SAMPLE_IMAGE_BUFFER,
  });

  await expect(page.locator('[data-testid^="image-preview-"]')).toHaveCount(1);
}

test.describe('PhoneNew 라우팅 테스트 - 신규등록 모드 (isEdit=false)', () => {
  test.beforeEach(async ({ page }) => {
    // 로컬스토리지 초기화
    await clearLocalStorage(page);
    // 신규등록 페이지로 이동
    await page.goto('http://localhost:3000/phones/new');
    await waitForPageLoad(page);
  });

  test('취소 버튼 클릭 시 목록 페이지(/phones)로 이동', async ({ page }) => {
    // 1. 준비: 취소 버튼 찾기
    const cancelButton = page.locator('[data-testid="btn-cancel"]');

    // 버튼이 렌더링되었는지 확인
    await expect(cancelButton).toBeVisible();

    // 2. 실행: 취소 버튼 클릭
    await cancelButton.click();

    // 3. 검증: URL이 /phones로 변경되었는지 확인
    const expectedUrl = 'http://localhost:3000/phones';
    await expect(page).toHaveURL(expectedUrl);
  });

  test('등록 완료 후 목록 페이지(/phones)로 이동', async ({ page }) => {
    await fillPhoneForm(page);
    await attachImage(page);

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await submitButton.click();

    const expectedUrl = 'http://localhost:3000/phones';
    await expect(page).toHaveURL(expectedUrl);
  });
});

test.describe('PhoneNew 라우팅 테스트 - 수정 모드 (isEdit=true)', () => {
  const testListingId = '001';

  test.beforeEach(async ({ page }) => {
    // 로컬스토리지 초기화
    await clearLocalStorage(page);

    // 테스트 중고폰 데이터 설정
    const testData = {
      title: '아이폰 13 미니 128GB',
      summary: '작고 가벼운 자급제 중고폰',
      description: '생활 스크래치만 있는 아이폰 13 미니입니다.',
      price: '520000',
      tags: '#Apple #미니 #안전거래',
      address: '서울특별시 서초구 서초대로 74길',
      postalCode: '06611',
      detailedAddress: '서울시 서초구 서초대로 74길 9',
      latitude: '37.4925',
      longitude: '127.0297',
      images: ['image1.jpg'],
    };
    await setPhoneData(page, testListingId, testData);
    // 수정 페이지로 이동
    await page.goto(`http://localhost:3000/phones/${testListingId}/edit`);
    await waitForPageLoad(page);
  });

  test('취소 버튼 클릭 시 상세 페이지(/phones/[id])로 이동', async ({ page }) => {
    // 1. 준비: 취소 버튼 찾기
    const cancelButton = page.locator('[data-testid="btn-cancel"]');

    // 버튼이 렌더링되었는지 확인
    await expect(cancelButton).toBeVisible();

    // 2. 실행: 취소 버튼 클릭
    await cancelButton.click();

    // 3. 검증: URL이 /phones/[id]로 변경되었는지 확인
    const expectedUrl = `http://localhost:3000/phones/${testListingId}`;
    await expect(page).toHaveURL(expectedUrl);
  });

  test('수정 완료 후 상세 페이지(/phones/[id])로 이동', async ({ page }) => {
    // 1. 준비: 폼 필드 수정하기
    // 기기명 수정
    await page.locator('[data-testid="input-phone-name"]').fill('아이폰 13 미니 128GB - 배터리 교체');

    // 한줄 요약 수정
    await page.locator('[data-testid="input-phone-summary"]').fill('수정된 설명입니다');

    // 2. 실행: alert 처리 및 제출 버튼 클릭
    page.on('dialog', (dialog) => {
      // "수정이 완료되었습니다." alert 자동 처리
      dialog.accept();
    });

    const submitButton = page.locator('[data-testid="btn-submit"]');
    await submitButton.click();

    // 3. 검증: URL이 /phones/[id]로 변경되었는지 확인
    const expectedUrl = `http://localhost:3000/phones/${testListingId}`;
    await expect(page).toHaveURL(expectedUrl);
  });
});
