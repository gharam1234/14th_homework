import { test, expect, Page } from '@playwright/test';

/**
 * PhoneDetail 링크 복사 기능 테스트
 * @description TDD 기반으로 구현한 링크 복사 기능의 통합 테스트
 * - Playwright를 사용한 E2E 테스트
 * - timeout 500ms 이하로 설정
 * - data-testid를 사용하여 페이지 로드 대기
 * - networkidle 대기 방법 금지
 */

const PHONE_DETAIL_URL = '/phone-detail';
const SHARE_BUTTON_SELECTOR = '[data-testid="share-button"]';
const PHONE_DETAIL_BODY = '[data-testid="phone-detail-body"]';

/**
 * 페이지가 로드될 때까지 대기
 * @description data-testid를 사용하여 페이지 로드 확인
 */
async function waitForPageLoad(page: Page) {
  await page.locator(PHONE_DETAIL_BODY).waitFor({ state: 'visible' });
}

/**
 * 토스트 알림 메시지 가져오기
 * @description antd message 알림 메시지
 */
async function getNotification(page: Page): Promise<string | null> {
  const notification = page.locator('.ant-message-notice-content');
  if (await notification.count() > 0) {
    return await notification.first().textContent();
  }
  return null;
}

/**
 * 공유 버튼 클릭
 */
async function clickShareButton(page: Page) {
  const shareButton = page.locator(SHARE_BUTTON_SELECTOR);
  await shareButton.click();
}

/**
 * 클립보드 권한 부여 및 API 모킹
 */
async function grantClipboardPermission(page: Page) {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
}

/**
 * 클립보드 내용 읽기
 */
async function getClipboardContent(page: Page): Promise<string> {
  return await page.evaluate(() => navigator.clipboard.readText());
}

test.describe('링크 복사 기능 (prompt.403.copylink)', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 토큰 설정 (인증된 라우트 접근을 위해)
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'test-token');
    });
    
    // 각 테스트 전에 페이지 이동 및 로드 대기
    await page.goto(PHONE_DETAIL_URL);
    await waitForPageLoad(page);
  });

  test('공유 아이콘이 존재하는지 확인', async ({ page }) => {
    const shareButton = page.locator(SHARE_BUTTON_SELECTOR);
    await expect(shareButton).toBeVisible({ timeout: 300 });
  });

  test('링크 복사 성공 시 클립보드에 현재 URL이 복사됨', async ({ page }) => {
    // 클립보드 권한 부여
    await grantClipboardPermission(page);

    // 공유 버튼 클릭
    await clickShareButton(page);

    // 클립보드 내용 확인
    await page.waitForTimeout(300); // 복사 완료 대기
    const clipboardContent = await getClipboardContent(page);
    const currentUrl = page.url();

    // 현재 페이지 URL이 클립보드에 복사되었는지 확인
    expect(clipboardContent).toBe(currentUrl);
  });

  test('링크 복사 성공 시 "링크가 복사되었습니다." 메시지 표시', async ({ page }) => {
    // 클립보드 권한 부여
    await grantClipboardPermission(page);

    // 공유 버튼 클릭
    await clickShareButton(page);

    // 성공 메시지 확인
    await page.waitForTimeout(300);
    const notification = await getNotification(page);
    expect(notification).toContain('링크가 복사되었습니다.');
  });

  test('클립보드 API 미지원 시 "링크 복사에 실패했습니다." 메시지 표시', async ({ page }) => {
    // navigator.clipboard API를 사용 불가능하게 설정
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'test-token');
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: false,
        configurable: true,
      });
    });

    // 페이지 이동 및 로드
    await page.goto(PHONE_DETAIL_URL);
    await waitForPageLoad(page);

    // 공유 버튼 클릭
    await clickShareButton(page);

    // 에러 메시지 확인
    await page.waitForTimeout(300);
    const notification = await getNotification(page);
    expect(notification).toContain('링크 복사에 실패했습니다.');
  });

  test('클립보드 writeText 실패 시 "링크 복사에 실패했습니다." 메시지 표시', async ({ page }) => {
    // navigator.clipboard.writeText가 에러를 던지도록 설정
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'test-token');
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.reject(new Error('Clipboard write failed')),
        },
        writable: false,
        configurable: true,
      });
    });

    // 페이지 이동 및 로드
    await page.goto(PHONE_DETAIL_URL);
    await waitForPageLoad(page);

    // 공유 버튼 클릭
    await clickShareButton(page);

    // 에러 메시지 확인
    await page.waitForTimeout(300);
    const notification = await getNotification(page);
    expect(notification).toContain('링크 복사에 실패했습니다.');
  });
});
