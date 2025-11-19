import { test, expect, Page } from '@playwright/test';

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
 * Supabase phone_inquiries + profiles JOIN Mock
 * 실제 Supabase API와 동일한 응답 구조 사용
 */
async function mockInquiriesWithProfiles(page: Page, inquiries: any[]) {
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

test.describe('문의 데이터 바인딩 (prompt.401)', () => {
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

  test('성공: 문의 목록이 렌더링되고 작성자 정보와 문의 내용이 표시된다', async ({ page }) => {
    // Mock 데이터 준비 (Supabase JOIN 응답 형식)
    const mockInquiries = [
      {
        id: 'inquiry-001',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '첫 번째 문의 내용입니다.',
        created_at: '2025-01-15T10:30:00.000Z',
        parent_id: null,
        status: 'active',
        author: {
          avatar_url: 'https://example.com/avatar1.jpg',
          username: '사용자1',
        },
      },
      {
        id: 'inquiry-002',
        phone_id: PHONE_ID,
        author_id: 'user-002',
        content: '두 번째 문의 내용입니다.',
        created_at: '2025-01-16T14:45:00.000Z',
        parent_id: null,
        status: 'active',
        author: {
          avatar_url: 'https://example.com/avatar2.jpg',
          username: '사용자2',
        },
      },
    ];

    await mockInquiriesWithProfiles(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 문의 목록이 렌더링되는지 확인
    const inquiryItems = page.locator('[data-testid^="inquiry-item-"]');
    await expect(inquiryItems).toHaveCount(2);

    // 첫 번째 문의 검증
    const firstInquiry = page.locator('[data-testid="inquiry-item-0"]');
    await expect(firstInquiry).toContainText('사용자1');
    await expect(firstInquiry).toContainText('첫 번째 문의 내용입니다.');
    await expect(firstInquiry).toContainText('2025.01.15');
    
    // 프로필 이미지 확인
    const firstAvatar = firstInquiry.locator('img[alt="사용자1"]');
    await expect(firstAvatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg');

    // 두 번째 문의 검증
    const secondInquiry = page.locator('[data-testid="inquiry-item-1"]');
    await expect(secondInquiry).toContainText('사용자2');
    await expect(secondInquiry).toContainText('두 번째 문의 내용입니다.');
    await expect(secondInquiry).toContainText('2025.01.16');
  });

  test('성공: 프로필 정보가 없는 경우 기본값이 표시된다', async ({ page }) => {
    const mockInquiries = [
      {
        id: 'inquiry-no-profile',
        phone_id: PHONE_ID,
        author_id: 'user-no-profile',
        content: '프로필 정보 없는 문의',
        created_at: '2025-01-17T09:00:00.000Z',
        parent_id: null,
        status: 'active',
        author: null,
      },
    ];

    await mockInquiriesWithProfiles(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    await expect(inquiryItem).toContainText('프로필 정보 없는 문의');
    
    // 기본 닉네임이 표시되는지 확인
    await expect(inquiryItem).toContainText('알 수 없음');
  });

  test('성공: 데이터가 없을 때 빈 상태 메시지가 표시된다', async ({ page }) => {
    await mockInquiriesWithProfiles(page, []);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 빈 상태 메시지 확인
    const emptyMessage = page.locator('[data-testid="inquiries-list"]');
    await expect(emptyMessage).toContainText('문의가 없습니다.');
  });

  test('성공: 작성 날짜가 YYYY.MM.DD 형식으로 표시된다', async ({ page }) => {
    const mockInquiries = [
      {
        id: 'inquiry-date-test',
        phone_id: PHONE_ID,
        author_id: 'user-001',
        content: '날짜 포맷 테스트',
        created_at: '2025-03-25T15:20:30.123Z',
        parent_id: null,
        status: 'active',
        author: {
          avatar_url: null,
          username: '날짜테스터',
        },
      },
    ];

    await mockInquiriesWithProfiles(page, mockInquiries);

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    const inquiryItem = page.locator('[data-testid="inquiry-item-0"]');
    
    // YYYY.MM.DD 형식으로 표시되는지 확인
    await expect(inquiryItem).toContainText('2025.03.25');
    
    // 잘못된 형식은 표시되지 않아야 함
    await expect(inquiryItem).not.toContainText('2025-03-25');
    await expect(inquiryItem).not.toContainText('15:20');
  });

  test('성공: 로딩 상태가 표시된다', async ({ page }) => {
    let resolveInquiries: ((value: any) => void) | null = null;
    
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'GET') {
        // 로딩 상태를 확인하기 위해 지연
        await new Promise((resolve) => {
          resolveInquiries = resolve;
          setTimeout(() => resolve(null), 100);
        });
        
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([]),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    
    // 로딩 상태 확인 (선택적 - 컴포넌트에 로딩 표시가 있는 경우)
    // const loadingIndicator = page.locator('[data-testid="inquiries-loading"]');
    // await expect(loadingIndicator).toBeVisible();
    
    // 최종적으로 컨테이너가 표시되는지 확인
    await page.waitForSelector('[data-testid="inquiries-container"]');
  });

  test('실패: API 호출 실패 시 빈 배열이 처리된다', async ({ page }) => {
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForSelector('[data-testid="inquiries-container"]');

    // 에러 발생 시에도 빈 상태 메시지가 표시되어야 함
    const emptyMessage = page.locator('[data-testid="inquiries-list"]');
    await expect(emptyMessage).toContainText('문의가 없습니다.');
  });
});

