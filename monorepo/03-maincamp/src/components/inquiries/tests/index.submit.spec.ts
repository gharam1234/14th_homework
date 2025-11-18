import { test, expect, Page, Route } from '@playwright/test';

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

const defaultPhoneResponse = {
  id: PHONE_ID,
  title: 'Playwright 테스트용 중고폰',
  price: 1200000,
  summary: '테스트 전용 요약',
  description: '테스트 전용 상세 설명입니다.',
  seller_id: 'e670c3aa-1571-4aa5-9336-1f0d8e04650f',
  sale_state: 'available',
  sale_type: 'immediate',
  categories: ['스마트폰', '애플'],
  tags: ['#테스트'],
  created_at: new Date().toISOString(),
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

async function mockPhoneDetail(page: Page) {
  await page.route('**/rest/v1/phones**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([defaultPhoneResponse]),
    });
  });
}

function parseInsertPayload(route: Route) {
  const raw = route.request().postData();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed[0] ?? null : parsed;
  } catch (error) {
    return null;
  }
}

async function waitForMessage(page: Page, text: string) {
  const messageLocator = page.locator(`.ant-message-notice-content:has-text("${text}")`);
  await expect(messageLocator).toBeVisible();
}

test.describe('문의 제출 흐름 (prompt.402)', () => {
  test.beforeEach(async ({ page }) => {
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
    await mockPhoneDetail(page);
  });

  test('성공: 문의 제출 시 Supabase로 데이터가 저장되고 입력창 초기화', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    page.on('request', (request) => {
      if (request.url().includes('phone_inquiries')) {
        console.log('[playwright] observed phone_inquiries request:', request.url());
      }
    });

    let insertPayload: Record<string, unknown> | null = null;

    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      // Debug log to ensure the Supabase insert request is intercepted during tests
      console.log('[playwright] phone_inquiries request:', route.request().url());
      insertPayload = parseInsertPayload(route);
      await route.fulfill({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            ...insertPayload,
            id: 'inquiry-001',
          },
        ]),
      });
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    const storageKeys = await page.evaluate(() => Object.keys(window.localStorage));
    console.log('[playwright] localStorage keys', storageKeys);

    const textarea = page.locator('[data-testid="inquiry-textarea"]');
    await textarea.fill('테스트 문의 내용입니다.');
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '문의가 등록되었습니다.');
    await expect(textarea).toHaveValue('');
    await expect(page.getByTestId('inquiry-char-count')).toHaveText('0/100');

    expect(insertPayload).toMatchObject({
      content: '테스트 문의 내용입니다.',
      phone_id: PHONE_ID,
      author_id: TEST_USER.id,
      parent_id: null,
      status: 'active',
      is_answer: false,
    });
  });

  test('실패: Supabase 세션 없이 GraphQL 로그인만 있으면 경고 메시지가 표시된다', async ({ page }) => {
    await prepareAccessToken(page, { includeSupabaseSession: false });
    await mockSupabaseSession(page, false);
    await mockGraphqlUser(page, { userId: GRAPHQL_ONLY_USER_ID });

    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 500, body: '{}' });
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    await page.fill('[data-testid="inquiry-textarea"]', '그래프 로그인 문의');
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '로그인이 필요합니다.');
    expect(requestCount).toBe(0);
  });

  test('실패: 빈 내용 제출 시 에러 메시지 노출 및 요청 차단', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    await prepareAccessToken(page);
    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 500, body: '{}' });
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    await page.click('[data-testid="submit-inquiry-button"]');
    await waitForMessage(page, '문의 내용을 입력해주세요.');
    expect(requestCount).toBe(0);
  });

  test('실패: 100자 초과 입력 시 에러 메시지 노출 및 입력 유지', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    await prepareAccessToken(page);
    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 500, body: '{}' });
    });

    const longContent = 'a'.repeat(101);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    const textarea = page.locator('[data-testid="inquiry-textarea"]');
    await textarea.fill(longContent);
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '문의 내용은 100자 이내로 작성해주세요.');
    expect(requestCount).toBe(0);
    await expect(textarea).toHaveValue(longContent);
  });

  test('실패: Supabase 저장 실패 시 에러 메시지 노출 및 입력 유지', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    await prepareAccessToken(page);
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      console.log('[playwright] phone_inquiries request (error test):', route.request().url());
      await route.fulfill({ status: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'error' }) });
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    const textarea = page.locator('[data-testid="inquiry-textarea"]');
    await textarea.fill('저장 실패 케이스');
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '문의 등록에 실패했습니다. 다시 시도해주세요.');
    await expect(textarea).toHaveValue('저장 실패 케이스');
  });

  test('실패: 로그인하지 않은 경우 경고 메시지 노출', async ({ page }) => {
    await prepareAccessToken(page, { includeSupabaseSession: false });
    await mockSupabaseSession(page, false);
    await mockGraphqlUser(page, { isAuthenticated: false });
    let requestCount = 0;
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 500, body: '{}' });
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    await page.fill('[data-testid="inquiry-textarea"]', '로그인 필요 테스트');
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '로그인이 필요합니다.');
    expect(requestCount).toBe(0);
  });

  test('글자 수 카운터는 입력 길이에 맞춰 실시간으로 업데이트된다', async ({ page }) => {
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
    await mockGraphqlUser(page);

    await prepareAccessToken(page);
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      await route.fulfill({ status: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([{ id: 'inquiry-100' }]) });
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    const charCount = page.getByTestId('inquiry-char-count');
    await expect(charCount).toHaveText('0/100');

    await page.fill('[data-testid="inquiry-textarea"]', '테스트');
    await expect(charCount).toHaveText('3/100');
  });
});
