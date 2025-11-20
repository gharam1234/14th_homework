import { test, expect, Page, Route } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://fkkztiavgrmmazvdwtdw.supabase.co';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://main-practice.codebootcamp.co.kr/graphql';

// 테스트용 상수
const PHONE_ID = 'e3f0b3a3-7c2e-4d67-9fd9-bc10d74f6b14';
const TEST_USER = {
  id: '8d159ce6-5a84-46f4-95d7-dd0d7a37b6a9',
  email: 'tester@example.com',
};

const resolveSupabaseStorageKey = () => {
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  return projectRef ? `sb-${projectRef[1]}-auth-token` : 'sb-test-auth-token';
};

const SUPABASE_SESSION_KEY = resolveSupabaseStorageKey();

/**
 * 페이지 초기화 헬퍼 - 인증 토큰 설정
 */
async function prepareAccessToken(page: Page, options?: { includeSupabaseSession?: boolean }) {
  await page.addInitScript(
    ({ key, user, includeSession }) => {
      try {
        window.localStorage.setItem('accessToken', 'test-access-token');
        // Supabase User 타입 형식으로 변환
        const userObj = {
          id: user.id,
          email: user.email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        };
        window.localStorage.setItem('user', JSON.stringify(userObj));
        if (includeSession) {
          const sessionValue = JSON.stringify({
            currentSession: {
              access_token: 'test-token',
              token_type: 'bearer',
              user: userObj,
            },
          });
          window.localStorage.setItem(key, sessionValue);
          window.sessionStorage.setItem(key, sessionValue);
        }
      } catch (e) {
        console.warn('localStorage setItem failed:', e);
      }
    },
    {
      key: SUPABASE_SESSION_KEY,
      user: TEST_USER,
      includeSession: options?.includeSupabaseSession ?? true,
    }
  );
}

/**
 * Supabase 세션 Mock
 */
async function mockSupabaseSession(page: Page) {
  await page.route('**/auth/v1/session', async (route) => {
    // Supabase User 타입 형식으로 변환
    const userObj = {
      id: TEST_USER.id,
      email: TEST_USER.email,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    };
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          session: {
            access_token: 'test-token',
            token_type: 'bearer',
            user: userObj,
          },
        },
        error: null,
      }),
    });
  });
}

/**
 * GraphQL 사용자 Mock
 */
async function mockGraphqlUser(page: Page) {
  await page.route('**/graphql', async (route) => {
    const requestUrl = route.request().url();
    if (!requestUrl.startsWith(GRAPHQL_ENDPOINT)) {
      await route.continue();
      return;
    }

    const body = route.request().postData();
    if (!body) {
      await route.continue();
      return;
    }

    try {
      const payload = JSON.parse(body);
      const queryText: string = payload?.query ?? '';
      if (!queryText.includes('fetchUserLoggedIn')) {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            fetchUserLoggedIn: {
              _id: TEST_USER.id,
              email: TEST_USER.email,
              name: '테스트 사용자',
            },
          },
        }),
      });
    } catch (error) {
      await route.continue();
    }
  });
}

/**
 * Phone 상세 Mock
 */
async function mockPhoneDetail(page: Page) {
  await page.route('**/rest/v1/phones**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          id: PHONE_ID,
          title: 'Playwright 테스트용 중고폰',
          price: 1200000,
          seller_id: 'seller-001',
        },
      ]),
    });
  });
}

/**
 * Supabase phone_inquiries Mock
 */
async function mockInquiriesWithReplies(page: Page, inquiries: any[]) {
  await page.route('**/rest/v1/phone_inquiries**', async (route) => {
    const url = route.request().url();
    
    // POST 요청은 제출용이므로 continue
    if (route.request().method() === 'POST') {
      await route.continue();
      return;
    }

    // GET 요청: 조회
    if (route.request().method() === 'GET') {
      // parent_id가 null인 최상위 문의만 필터링
      const isParentQuery = url.includes('parent_id=is.null') || url.includes('parent_id.is.null');
      // parent_id가 있는 답변만 필터링
      const isReplyQuery = url.includes('parent_id=in') || url.includes('parent_id.in');
      
      let filteredInquiries = inquiries;
      
      if (isParentQuery) {
        // 최상위 문의만 반환 (parent_id가 null)
        filteredInquiries = inquiries.filter((inq: any) => inq.parent_id === null);
      } else if (isReplyQuery) {
        // 답변만 반환 (parent_id가 있음)
        filteredInquiries = inquiries.filter((inq: any) => inq.parent_id !== null);
      }
      
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredInquiries),
      });
      return;
    }

    await route.continue();
  });
}

/**
 * 메시지 대기 헬퍼
 */
async function waitForMessage(page: Page, text: string) {
  const messageLocator = page.locator(`.ant-message-notice-content:has-text("${text}")`);
  await expect(messageLocator).toBeVisible();
}

/**
 * 업데이트 페이로드 파싱
 */
function parseUpdatePayload(route: Route) {
  const raw = route.request().postData();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    return null;
  }
}

test.describe('답변 삭제 기능 (prompt.402.submit-delete)', () => {
  test.beforeEach(async ({ page }) => {
    // 디버깅을 위한 콘솔 로그
    page.on('console', (message) => {
      console.log('[browser]', message.type(), message.text());
    });
    
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);
    await mockPhoneDetail(page);
  });

  test('성공: 삭제 버튼 클릭 시 확인 모달이 표시된다', async ({ page }) => {
    const REPLY_ID = 'reply-001';
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        is_answer: false,
      },
      {
        id: REPLY_ID,
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '기존 답변 내용입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        updated_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator(`[data-testid^="reply-item-"]`).first();
    await expect(replyItem).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${REPLY_ID}"]`);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // 확인 모달이 표시되는지 확인
    const modal = page.locator('[data-testid="delete-confirm-modal"]');
    await expect(modal).toBeVisible();

    // 모달 제목 확인 (Modal 컴포넌트의 title에서 확인)
    const modalTitle = modal.locator('h2:has-text("답변을 삭제하시겠습니까?")');
    await expect(modalTitle).toBeVisible();

    // 삭제 버튼 확인 (텍스트로 찾기)
    const confirmButton = modal.locator('button:has-text("삭제")');
    await expect(confirmButton).toBeVisible();

    // 취소 버튼 확인 (텍스트로 찾기)
    const cancelButton = modal.locator('button:has-text("취소")');
    await expect(cancelButton).toBeVisible();
  });

  test('성공: 모달에서 삭제 버튼 클릭 시 Supabase에 status가 deleted로 업데이트되고 성공 메시지가 표시된다', async ({ page }) => {
    const REPLY_ID = 'reply-001';
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        is_answer: false,
      },
      {
        id: REPLY_ID,
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '기존 답변 내용입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        updated_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    let updatePayload: Record<string, unknown> | null = null;

    // 업데이트 요청 mock
    await page.route(`**/rest/v1/phone_inquiries?id=eq.${REPLY_ID}**`, async (route) => {
      if (route.request().method() === 'PATCH') {
        updatePayload = parseUpdatePayload(route);
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([
            {
              id: REPLY_ID,
              status: 'deleted',
              updated_at: new Date().toISOString(),
            },
          ]),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator(`[data-testid^="reply-item-"]`).first();
    await expect(replyItem).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${REPLY_ID}"]`);
    await deleteButton.click();

    // 확인 모달 확인
    const modal = page.locator('[data-testid="delete-confirm-modal"]');
    await expect(modal).toBeVisible();

    // 모달에서 삭제 버튼 클릭 (텍스트로 찾기)
    const confirmButton = modal.locator('button:has-text("삭제")');
    await confirmButton.click();

    // 성공 메시지 확인
    await waitForMessage(page, '답변이 삭제되었습니다.');

    // Supabase에 저장된 데이터 확인
    expect(updatePayload).toMatchObject({
      status: 'deleted',
    });
    expect(updatePayload).toHaveProperty('updated_at');

    // 모달이 닫혔는지 확인
    await expect(modal).not.toBeVisible();
  });

  test('성공: 취소 버튼으로 모달이 닫힌다', async ({ page }) => {
    const REPLY_ID = 'reply-001';
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        is_answer: false,
      },
      {
        id: REPLY_ID,
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '기존 답변 내용입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        updated_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator(`[data-testid^="reply-item-"]`).first();
    await expect(replyItem).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${REPLY_ID}"]`);
    await deleteButton.click();

    // 확인 모달 확인
    const modal = page.locator('[data-testid="delete-confirm-modal"]');
    await expect(modal).toBeVisible();

    // 취소 버튼 클릭 (텍스트로 찾기)
    const cancelButton = modal.locator('button:has-text("취소")');
    await cancelButton.click();

    // 모달이 닫혔는지 확인
    await expect(modal).not.toBeVisible();
  });

  test('성공: 배경 클릭으로 모달이 닫힌다', async ({ page }) => {
    const REPLY_ID = 'reply-001';
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        is_answer: false,
      },
      {
        id: REPLY_ID,
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '기존 답변 내용입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        updated_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator(`[data-testid^="reply-item-"]`).first();
    await expect(replyItem).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${REPLY_ID}"]`);
    await deleteButton.click();

    // 확인 모달 확인
    const modal = page.locator('[data-testid="delete-confirm-modal"]');
    await expect(modal).toBeVisible();

    // 배경 클릭 (모달 오버레이)
    const overlay = page.locator('[data-testid="delete-confirm-modal-overlay"]');
    await overlay.click({ position: { x: 0, y: 0 } });

    // 모달이 닫혔는지 확인
    await expect(modal).not.toBeVisible();
  });

  test('성공: 삭제 후 답변이 리스트에서 제거된다', async ({ page }) => {
    const REPLY_ID = 'reply-001';
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        is_answer: false,
      },
      {
        id: REPLY_ID,
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '기존 답변 내용입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        updated_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    // 업데이트 후 조회 시 삭제된 답변 제외
    await page.route(`**/rest/v1/phone_inquiries**`, async (route) => {
      const url = route.request().url();
      
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([
            {
              id: REPLY_ID,
              status: 'deleted',
              updated_at: new Date().toISOString(),
            },
          ]),
        });
        return;
      }

      if (route.request().method() === 'GET') {
        const isReplyQuery = url.includes('parent_id=in') || url.includes('parent_id.in');
        
        if (isReplyQuery) {
          // 삭제된 답변은 제외 (status가 active인 것만)
          const filteredReplies = mockInquiries.filter(
            (inq: any) => inq.parent_id !== null && inq.status === 'active'
          );
          await route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filteredReplies),
          });
          return;
        }

        // 최상위 문의는 그대로 반환
        const filteredInquiries = mockInquiries.filter((inq: any) => inq.parent_id === null);
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filteredInquiries),
        });
        return;
      }

      await route.continue();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator(`[data-testid^="reply-item-"]`).first();
    await expect(replyItem).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${REPLY_ID}"]`);
    await deleteButton.click();

    // 확인 모달에서 삭제 버튼 클릭
    const modal = page.locator('[data-testid="delete-confirm-modal"]');
    const confirmButton = modal.locator('button:has-text("삭제")');
    await confirmButton.click();

    // 성공 메시지 확인
    await waitForMessage(page, '답변이 삭제되었습니다.');

    // 답변이 리스트에서 제거되었는지 확인
    await expect(replyItem).not.toBeVisible();
  });

  test('API 실패: Supabase 삭제 실패 시 에러 메시지가 표시된다', async ({ page }) => {
    const REPLY_ID = 'reply-001';
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        is_answer: false,
      },
      {
        id: REPLY_ID,
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '기존 답변 내용입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        updated_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    // 업데이트 실패 mock
    await page.route(`**/rest/v1/phone_inquiries?id=eq.${REPLY_ID}**`, async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator(`[data-testid^="reply-item-"]`).first();
    await expect(replyItem).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${REPLY_ID}"]`);
    await deleteButton.click();

    // 확인 모달 확인
    const modal = page.locator('[data-testid="delete-confirm-modal"]');
    await expect(modal).toBeVisible();

    // 모달에서 삭제 버튼 클릭 (텍스트로 찾기)
    const confirmButton = modal.locator('button:has-text("삭제")');
    await confirmButton.click();

    // 실패 메시지 확인
    await waitForMessage(page, '삭제에 실패했습니다. 다시 시도해주세요.');
  });
});

