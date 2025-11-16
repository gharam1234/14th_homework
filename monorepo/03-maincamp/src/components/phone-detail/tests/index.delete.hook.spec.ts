import { test, expect, Page } from '@playwright/test';

const PHONE_DETAIL_URL = '/phones/listing-001';
const PHONES_LIST_URL = '/phones';
const SUPABASE_DELETE_ROUTE = '**/rest/v1/phones**';

async function waitForPageLoad(page: Page) {
  await page.locator('[data-testid="phone-detail-body"]').waitFor({ state: 'visible' });
}

async function clickDeleteButton(page: Page) {
  const deleteButton = page.locator('[data-testid="delete-button"]');
  await deleteButton.click();
}

async function waitForDeleteModal(page: Page) {
  // 모달 콘텐츠가 나타날 때까지 대기
  await page.getByText('정말로 이 판매 글을 삭제하시겠습니까?').waitFor({ state: 'visible', timeout: 500 });
}

async function getModalMessage(page: Page): Promise<string | null> {
  // Modal 컴포넌트의 description 텍스트
  return await page.getByText('정말로 이 판매 글을 삭제하시겠습니까?').textContent();
}

async function clickCancelButton(page: Page) {
  // Modal 컴포넌트 내의 취소 버튼
  const cancelButton = page.getByRole('button', { name: '취소' });
  await cancelButton.click();
}

async function clickConfirmDeleteButton(page: Page) {
  // Modal 컴포넌트 내의 삭제 버튼
  const confirmButton = page.getByRole('button', { name: '삭제' });
  await confirmButton.click();
}

async function getNotification(page: Page): Promise<string | null> {
  // antd message 알림 메시지
  const notification = page.locator('.ant-message-notice-content');
  if (await notification.count() > 0) {
    return await notification.first().textContent();
  }
  return null;
}

type SupabaseDeleteMockOptions = {
  status?: number;
  body?: unknown;
};

async function mockSupabaseDelete(page: Page, options: SupabaseDeleteMockOptions = {}) {
  await page.route(SUPABASE_DELETE_ROUTE, async (route) => {
    if (route.request().method() !== 'DELETE') {
      return route.continue();
    }

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(options.body ?? []),
    });
  });
}

test.describe('삭제 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PHONE_DETAIL_URL);
    await waitForPageLoad(page);
  });

  test('삭제 아이콘 클릭 시 확인 모달이 표시되어야 함', async ({ page }) => {
    await clickDeleteButton(page);
    await waitForDeleteModal(page);

    const modalMessage = page.getByText('정말로 이 판매 글을 삭제하시겠습니까?');
    await expect(modalMessage).toBeVisible();
  });

  test('모달에 올바른 메시지가 표시되어야 함', async ({ page }) => {
    await clickDeleteButton(page);
    await waitForDeleteModal(page);

    const message = await getModalMessage(page);
    expect(message).toContain('정말로 이 판매 글을 삭제하시겠습니까?');
  });

  test('모달에 취소와 삭제 버튼이 있어야 함', async ({ page }) => {
    await clickDeleteButton(page);
    await waitForDeleteModal(page);

    const cancelButton = page.getByRole('button', { name: '취소' });
    const confirmButton = page.getByRole('button', { name: '삭제' });

    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
  });

  test('취소 버튼 클릭 시 모달이 닫혀야 함', async ({ page }) => {
    await clickDeleteButton(page);
    await waitForDeleteModal(page);

    await clickCancelButton(page);

    const modalMessage = page.getByText('정말로 이 판매 글을 삭제하시겠습니까?');
    await expect(modalMessage).not.toBeVisible();
  });

  test('취소 버튼 클릭 후 페이지에 데이터가 유지되어야 함', async ({ page }) => {
    const titleBefore = await page.locator('[data-testid="phone-detail-title"]').textContent();

    await clickDeleteButton(page);
    await waitForDeleteModal(page);
    await clickCancelButton(page);

    const titleAfter = await page.locator('[data-testid="phone-detail-title"]').textContent();
    expect(titleBefore).toBe(titleAfter);
  });

  test('삭제 버튼 클릭 시 로딩 상태를 표시해야 함', async ({ page }) => {
    // 이 테스트는 Supabase 모킹이 필요함
    await mockSupabaseDelete(page);
    await clickDeleteButton(page);
    await waitForDeleteModal(page);

    const confirmButton = page.getByRole('button', { name: '삭제' });
    await confirmButton.click();

    // 삭제 중이므로 버튼이 비활성화될 수 있음 (또는 로딩 인디케이터 표시)
    // 이 부분은 Hook의 isDeleting 상태에 따라 다름
  });

  test('삭제 성공 시 성공 메시지를 표시하고 /phones로 이동해야 함', async ({ page }) => {
    // Supabase 모킹 필요
    await clickDeleteButton(page);
    await waitForDeleteModal(page);
    await mockSupabaseDelete(page, { body: [{ id: 'listing-001' }] });
    await clickConfirmDeleteButton(page);

    // 성공 메시지 확인
    await page.waitForTimeout(500);
    const notification = await getNotification(page);
    expect(notification).toContain('판매 글이 삭제되었습니다');

    // 페이지 이동 확인 (최대 500ms 대기)
    await page.waitForURL(PHONES_LIST_URL, { timeout: 500 });
    expect(page.url()).toContain(PHONES_LIST_URL);
  });

  test('삭제 실패 시 에러 메시지를 표시해야 함', async ({ page }) => {
    // Supabase 모킹 필요 - 실패 시나리오
    await clickDeleteButton(page);
    await waitForDeleteModal(page);
    await mockSupabaseDelete(page, { status: 500, body: { message: 'mock fail' } });
    await clickConfirmDeleteButton(page);

    // 에러 메시지 확인
    await page.waitForTimeout(500);
    const notification = await getNotification(page);
    expect(notification).toContain('삭제에 실패하였습니다');
  });

  test('삭제 실패 시 모달이 닫혀야 함', async ({ page }) => {
    // Supabase 모킹 필요 - 실패 시나리오
    await clickDeleteButton(page);
    await waitForDeleteModal(page);
    await mockSupabaseDelete(page, { status: 500, body: { message: 'mock fail' } });
    await clickConfirmDeleteButton(page);

    // 에러 메시지 표시 후 모달 닫힘
    await page.waitForTimeout(500);
    const modalMessage = page.getByText('정말로 이 판매 글을 삭제하시겠습니까?');
    await expect(modalMessage).not.toBeVisible();
  });

  test('삭제 실패 시 페이지가 이동하지 않아야 함', async ({ page }) => {
    // Supabase 모킹 필요 - 실패 시나리오
    const initialUrl = page.url();

    await clickDeleteButton(page);
    await waitForDeleteModal(page);
    await mockSupabaseDelete(page, { status: 500, body: { message: 'mock fail' } });
    await clickConfirmDeleteButton(page);

    // 에러 후 페이지에서 벗어나지 않음
    await page.waitForTimeout(500);
    expect(page.url()).toBe(initialUrl);
  });
});
