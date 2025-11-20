import { test, expect, Page } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://fkkztiavgrmmazvdwtdw.supabase.co';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://main-practice.codebootcamp.co.kr/graphql';

// 테스트용 상수
const PHONE_ID = 'e3f0b3a3-7c2e-4d67-9fd9-bc10d74f6b14';
const TEST_USER = {
  id: '8d159ce6-5a84-46f4-95d7-dd0d7a37b6a9',
  email: 'tester@example.com',
};
const OTHER_USER = {
  id: 'other-user-id-12345',
  email: 'other@example.com',
};

const resolveSupabaseStorageKey = () => {
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  return projectRef ? `sb-${projectRef[1]}-auth-token` : 'sb-test-auth-token';
};

const SUPABASE_SESSION_KEY = resolveSupabaseStorageKey();

/**
 * 페이지 초기화 헬퍼 - 인증 토큰 설정
 */
async function prepareAccessToken(page: Page, user: typeof TEST_USER | typeof OTHER_USER = TEST_USER, options?: { includeSupabaseSession?: boolean }) {
  await page.addInitScript(
    ({ key, user, includeSession }) => {
      try {
        window.localStorage.setItem('accessToken', 'test-access-token');
        window.localStorage.setItem('user', JSON.stringify(user));
        if (includeSession) {
          const sessionValue = JSON.stringify({
            currentSession: {
              access_token: 'test-token',
              token_type: 'bearer',
              user,
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
      user,
      includeSession: options?.includeSupabaseSession ?? true,
    }
  );
}

/**
 * Supabase 세션 Mock
 */
async function mockSupabaseSession(page: Page, user: typeof TEST_USER | typeof OTHER_USER = TEST_USER) {
  await page.route('**/auth/v1/session', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          session: {
            user,
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
async function mockGraphqlUser(page: Page, user: typeof TEST_USER | typeof OTHER_USER = TEST_USER) {
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
              _id: user.id,
              email: user.email,
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
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiries),
      });
      return;
    }

    await route.continue();
  });
}

test.describe('답변 수정/삭제 버튼 조건부 렌더링 (prompt.401.binding)', () => {
  test.beforeEach(async ({ page }) => {
    // 디버깅을 위한 콘솔 로그
    page.on('console', (message) => {
      console.log('[browser]', message.type(), message.text());
    });
    
    await prepareAccessToken(page, TEST_USER);
    await mockSupabaseSession(page, TEST_USER);
    await mockGraphqlUser(page, TEST_USER);
    await mockPhoneDetail(page);
  });

  test('성공: 판매자 답변이고 본인 작성일 때 수정/삭제 버튼이 표시된다', async ({ page }) => {
    // Mock 데이터: 판매자 답변 (is_answer === true)이고 현재 사용자가 작성한 답변
    // Supabase API 응답 형식 (author 객체 없이 author_id만 사용)
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
        id: 'reply-001',
        phone_id: PHONE_ID,
        author_id: TEST_USER.id, // 현재 사용자가 작성한 답변
        content: '판매자 답변입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true, // 판매자 답변
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator('[data-testid^="reply-item-"]').first();
    await expect(replyItem).toBeVisible();

    // 수정 버튼이 표시되는지 확인
    const editButton = replyItem.locator(`[data-testid="edit-reply-${mockInquiries[1].id}"]`);
    await expect(editButton).toBeVisible();

    // 삭제 버튼이 표시되는지 확인
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${mockInquiries[1].id}"]`);
    await expect(deleteButton).toBeVisible();
  });

  test('성공: 판매자 답변이 아닐 때 수정/삭제 버튼이 숨겨진다', async ({ page }) => {
    // Mock 데이터: 일반 답변 (is_answer === false)
    // Supabase API 응답 형식 (author 객체 없이 author_id만 사용)
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
        id: 'reply-001',
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '일반 답변입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: false, // 판매자 답변이 아님
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator('[data-testid^="reply-item-"]').first();
    await expect(replyItem).toBeVisible();

    // 수정 버튼이 숨겨지는지 확인
    const editButton = replyItem.locator(`[data-testid="edit-reply-${mockInquiries[1].id}"]`);
    await expect(editButton).not.toBeVisible();

    // 삭제 버튼이 숨겨지는지 확인
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${mockInquiries[1].id}"]`);
    await expect(deleteButton).not.toBeVisible();
  });

  test('성공: 다른 사용자의 답변일 때 수정/삭제 버튼이 숨겨진다', async ({ page }) => {
    // Mock 데이터: 판매자 답변이지만 다른 사용자가 작성한 답변
    // Supabase API 응답 형식 (author 객체 없이 author_id만 사용)
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
        id: 'reply-001',
        phone_id: PHONE_ID,
        author_id: OTHER_USER.id, // 다른 사용자가 작성한 답변
        content: '다른 사용자의 판매자 답변입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true, // 판매자 답변이지만
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator('[data-testid^="reply-item-"]').first();
    await expect(replyItem).toBeVisible();

    // 수정 버튼이 숨겨지는지 확인
    const editButton = replyItem.locator(`[data-testid="edit-reply-${mockInquiries[1].id}"]`);
    await expect(editButton).not.toBeVisible();

    // 삭제 버튼이 숨겨지는지 확인
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${mockInquiries[1].id}"]`);
    await expect(deleteButton).not.toBeVisible();
  });

  test('성공: 로그인하지 않은 사용자는 수정/삭제 버튼이 표시되지 않는다', async ({ page }) => {
    // 로그인하지 않은 상태로 설정
    await prepareAccessToken(page, TEST_USER, { includeSupabaseSession: false });
    await page.addInitScript(() => {
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('accessToken');
    });
    
    await page.route('**/auth/v1/session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            session: null,
          },
          error: null,
        }),
      });
    });

    // Mock 데이터: 판매자 답변
    // Supabase API 응답 형식 (author 객체 없이 author_id만 사용)
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
        id: 'reply-001',
        phone_id: PHONE_ID,
        author_id: TEST_USER.id,
        content: '판매자 답변입니다.',
        created_at: '2025-01-15T11:00:00.000Z',
        parent_id: 'inquiry-001',
        status: 'active',
        is_answer: true,
      },
    ];

    await mockInquiriesWithReplies(page, mockInquiries);
    await mockPhoneDetail(page);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 답변 아이템 확인
    const replyItem = page.locator('[data-testid^="reply-item-"]').first();
    await expect(replyItem).toBeVisible();

    // 수정 버튼이 숨겨지는지 확인
    const editButton = replyItem.locator(`[data-testid="edit-reply-${mockInquiries[1].id}"]`);
    await expect(editButton).not.toBeVisible();

    // 삭제 버튼이 숨겨지는지 확인
    const deleteButton = replyItem.locator(`[data-testid="delete-reply-${mockInquiries[1].id}"]`);
    await expect(deleteButton).not.toBeVisible();
  });
});

