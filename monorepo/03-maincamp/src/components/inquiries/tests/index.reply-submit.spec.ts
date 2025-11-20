import { test, expect, Page } from '@playwright/test';
import {
  createMockPhoneInquiryRecord,
  createMockPhoneRecord,
  getSupabaseMockStore,
  resetSupabaseMockStore,
  setupSupabaseRestMock,
} from '@/tests/mocks/supabase-rest-mock';
import type { SupabasePhoneInquiryRecord } from '@/tests/mocks/supabase-rest-mock';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://fkkztiavgrmmazvdwtdw.supabase.co';
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://main-practice.codebootcamp.co.kr/graphql';
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
const GRAPHQL_ONLY_USER_ID = '68fecf129bffc00029cce40c';
// 테스트용 부모 문의 ID
const TEST_INQUIRY_ID = '11111111-1111-4111-8111-111111111111';
const INQUIRIES_CONTAINER_SELECTOR = '[data-testid="inquiries-container"]';
const CONTAINER_WAIT_TIMEOUT = 60_000;

const DEFAULT_PHONE_RECORD = {
  id: PHONE_ID,
  seller_id: 'e670c3aa-1571-4aa5-9336-1f0d8e04650f',
  status: 'published' as const,
  sale_state: 'available' as const,
  sale_type: 'immediate' as const,
  bookmark_count: 0,
  title: 'Playwright 테스트용 중고폰',
  summary: '테스트 전용 요약',
  description: '테스트 전용 상세 설명입니다.',
  price: 1200000,
  currency: 'KRW',
  available_from: '2025-01-01T00:00:00Z',
  available_until: null,
  model_name: '테스트 모델',
  storage_capacity: '256GB',
  device_condition: 'A급',
  address: '서울특별시 중구 세종대로 110',
  address_detail: '테스트 타워 10층',
  zipcode: '04524',
  latitude: 37.5665,
  longitude: 126.978,
  main_image_url:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
  tags: ['#테스트'],
  categories: ['스마트폰', '애플'],
  created_at: '2025-01-10T00:00:00Z',
};

const BASE_PARENT_INQUIRY: Partial<SupabasePhoneInquiryRecord> = {
  id: TEST_INQUIRY_ID,
  phone_id: PHONE_ID,
  author_id: 'user-001',
  content: '테스트 문의입니다.',
  parent_id: null,
  thread_path: null,
  is_answer: false,
  status: 'active',
};

const seedParentInquiry = (overrides: Partial<SupabasePhoneInquiryRecord> = {}) =>
  createMockPhoneInquiryRecord({
    ...BASE_PARENT_INQUIRY,
    ...overrides,
    phone_id: PHONE_ID,
  });

const getRepliesFromStore = () => {
  const store = getSupabaseMockStore();
  return Array.from(store.phone_inquiries.values()).filter(
    (record) => record.parent_id === TEST_INQUIRY_ID && record.id !== TEST_INQUIRY_ID,
  );
};

async function prepareAccessToken(page: Page, options?: { includeSupabaseSession?: boolean }) {
  await page.addInitScript(
    ({ key, user, includeSession }) => {
      try {
        window.localStorage.setItem('accessToken', 'test-access-token');
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
        } else {
          try {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem(key);
          } catch (e) {
            console.warn('localStorage removeItem failed:', e);
          }
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

async function mockSupabaseSession(page: Page, hasSession = true) {
  await page.route('**/auth/v1/session', async (route) => {
    if (!hasSession) {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { session: null }, error: null }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          session: {
            user: TEST_USER,
          },
        },
        error: null,
      }),
    });
  });
}

async function mockGraphqlUser(
  page: Page,
  options?: { isAuthenticated?: boolean; userId?: string; email?: string; name?: string }
) {
  const isAuthenticated = options?.isAuthenticated ?? true;
  const userId = options?.userId ?? TEST_USER.id;
  const email = options?.email ?? TEST_USER.email;
  const name = options?.name ?? '테스트 사용자';

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
            fetchUserLoggedIn: isAuthenticated
              ? {
                  _id: userId,
                  email,
                  name,
                }
              : null,
          },
        }),
      });
    } catch (error) {
      console.warn('[mockGraphqlUser] 요청 파싱 실패:', error);
      await route.continue();
    }
  });
}

async function waitForMessage(page: Page, text: string) {
  const messageLocator = page.locator(`.ant-message-notice-content:has-text("${text}")`);
  await expect(messageLocator).toBeVisible();
}

async function waitForInquiriesContainer(page: Page) {
  await page.waitForSelector(INQUIRIES_CONTAINER_SELECTOR, { timeout: CONTAINER_WAIT_TIMEOUT });
}

test.describe('답변 제출 흐름 (prompt.402)', () => {
  test.beforeEach(async ({ page, context }) => {
    page.on('console', (message) => {
      console.log('[browser]', message.type(), message.text());
    });
    page.on('requestfailed', (request) => {
      console.log('[browser][requestfailed]', request.url(), request.failure()?.errorText);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log('[browser][response]', response.url(), response.status());
      }
    });

    await setupSupabaseRestMock(context);
    resetSupabaseMockStore();
    createMockPhoneRecord(DEFAULT_PHONE_RECORD);
  });

  test('성공: 답변 제출 시 Supabase로 데이터가 저장되고 입력창 초기화', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    const parentInquiry = seedParentInquiry();

    await page.goto(`/phones/${PHONE_ID}`);
    await waitForInquiriesContainer(page);

    // "답변 하기" 버튼 클릭
    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    const replyButton = inquiryItem.locator('[data-testid="inquiry-reply-button"]');
    await replyButton.click();

    // 답변 입력창이 표시되는지 확인
    const textarea = inquiryItem.locator('[data-testid="inquiry-reply-textarea"]');
    await expect(textarea).toBeVisible();
    const charCount = inquiryItem.getByTestId('inquiry-reply-charcount');
    const submitButton = inquiryItem.locator('[data-testid="inquiry-reply-submit-button"]');

    // 답변 내용 입력
    await textarea.fill('테스트 답변 내용입니다.');
    await expect(charCount).toHaveText('13/100');

    // "답변 하기" 버튼 클릭
    await submitButton.click();

    // 성공 메시지 확인
    await waitForMessage(page, '답변 등록에 성공하였습니다.');

    // 입력창 초기화 확인
    await expect(textarea).toHaveValue('');
    await expect(charCount).toHaveText('0/100');

    const replies = getRepliesFromStore();
    expect(replies).toHaveLength(1);
    expect(replies[0]).toMatchObject({
      content: '테스트 답변 내용입니다.',
      phone_id: PHONE_ID,
      parent_id: parentInquiry.id,
      author_id: TEST_USER.id,
      status: 'active',
      is_answer: true,
      link_url: null,
      link_title: null,
      link_description: null,
      link_image: null,
    });
    expect(replies[0].thread_path).toBe(`${parentInquiry.id}/${replies[0].id}`);
  });

  test('검증 실패: 빈 textarea 상태에서 제출 버튼 클릭 시 에러 메시지 표시', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    seedParentInquiry();

    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'POST') {
        requestCount += 1;
        await route.fulfill({ status: 500, body: '{}' });
        return;
      }
      await route.fallback();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await waitForInquiriesContainer(page);

    // "답변 하기" 버튼 클릭
    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    const replyButton = inquiryItem.locator('[data-testid="inquiry-reply-button"]');
    await replyButton.click();

    // 답변 입력창 확인
    const textarea = inquiryItem.locator('[data-testid="inquiry-reply-textarea"]');
    await expect(textarea).toBeVisible();

    const submitButton = inquiryItem.locator('[data-testid="inquiry-reply-submit-button"]');
    await expect(submitButton).toBeDisabled();

    // 요청이 전송되지 않았는지 확인
    expect(requestCount).toBe(0);
    expect(getRepliesFromStore()).toHaveLength(0);
  });

  test('검증 실패: 100자 초과 입력 시 에러 메시지 표시 및 입력 유지', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    seedParentInquiry();

    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'POST') {
        requestCount += 1;
        await route.fulfill({ status: 500, body: '{}' });
        return;
      }
      await route.fallback();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await waitForInquiriesContainer(page);

    // "답변 하기" 버튼 클릭
    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    const replyButton = inquiryItem.locator('[data-testid="inquiry-reply-button"]');
    await replyButton.click();

    // 답변 입력창 확인
    const textarea = inquiryItem.locator('[data-testid="inquiry-reply-textarea"]');
    await expect(textarea).toBeVisible();

    // 100자 초과 입력 (101자)
    const longContent = 'a'.repeat(101);
    await textarea.fill(longContent);

    // textarea는 100자로 제한되어야 함
    const actualValue = await textarea.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(100);

    // 제출 버튼 클릭
    await inquiryItem.locator('[data-testid="inquiry-reply-submit-button"]').click();

    // 요청이 전송되지 않았는지 확인 (100자 제한으로 인해)
    expect(requestCount).toBe(0);
    expect(getRepliesFromStore()).toHaveLength(0);
  });

  test('API 실패: Supabase 저장 실패 시 에러 메시지 표시 및 입력 데이터 보존', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    const parentInquiry = seedParentInquiry();

    // Supabase 저장 실패 mock
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await waitForInquiriesContainer(page);

    // "답변 하기" 버튼 클릭
    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    const replyButton = inquiryItem.locator('[data-testid="inquiry-reply-button"]');
    await replyButton.click();

    // 답변 입력창 확인
    const textarea = inquiryItem.locator('[data-testid="inquiry-reply-textarea"]');
    await expect(textarea).toBeVisible();

    // 답변 내용 입력
    const replyContent = '저장 실패 케이스 답변';
    await textarea.fill(replyContent);

    // 제출 버튼 클릭
    await inquiryItem.locator('[data-testid="inquiry-reply-submit-button"]').click();

    // 실패 메시지 확인
    await waitForMessage(page, '답변 등록에 실패하였습니다. 다시 시도해주세요.');

    // 입력 데이터 보존 확인
    await expect(textarea).toHaveValue(replyContent);
    expect(getRepliesFromStore()).toHaveLength(0);
  });

  test('실패: 로그인하지 않은 경우 경고 메시지 노출', async ({ page }) => {
    await prepareAccessToken(page, { includeSupabaseSession: false });
    await mockSupabaseSession(page, false);
    await mockGraphqlUser(page, { isAuthenticated: false });

    seedParentInquiry();

    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'POST') {
        requestCount += 1;
        await route.fulfill({ status: 500, body: '{}' });
        return;
      }
      await route.fallback();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await waitForInquiriesContainer(page);

    // "답변 하기" 버튼 클릭
    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    const replyButton = inquiryItem.locator('[data-testid="inquiry-reply-button"]');
    await replyButton.click();

    // 답변 입력창 확인
    const textarea = inquiryItem.locator('[data-testid="inquiry-reply-textarea"]');
    await expect(textarea).toBeVisible();

    // 답변 내용 입력
    await textarea.fill('로그인 필요 테스트 답변');

    // 제출 버튼 클릭
    await inquiryItem.locator('[data-testid="inquiry-reply-submit-button"]').click();

    // 경고 메시지 확인
    await waitForMessage(page, '로그인이 필요합니다.');

    // 요청이 전송되지 않았는지 확인
    expect(requestCount).toBe(0);
    expect(getRepliesFromStore()).toHaveLength(0);
  });
});
