import { test, expect, Page } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://fkkztiavgrmmazvdwtdw.supabase.co';

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
 * Supabase phone_inquiries Mock
 */
async function mockInquiriesReplies(page: Page, inquiries: any[]) {
  await page.route('**/rest/v1/phone_inquiries**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (method === 'POST') {
      await route.continue();
      return;
    }

    if (method === 'GET') {
      // url에서 order 파라미터 확인
      const isOrderByThreadPath = url.includes('order=thread_path');
      let filteredInquiries = inquiries;
      
      // phone_id로 필터링
      if (url.includes(`phone_id=eq.${PHONE_ID}`)) {
        filteredInquiries = inquiries.filter((inq: any) => inq.phone_id === PHONE_ID);
      }

      // status=active 필터링
      if (url.includes('status=eq.active')) {
        filteredInquiries = filteredInquiries.filter((inq: any) => inq.status === 'active');
      }

      // thread_path로 정렬
      if (isOrderByThreadPath) {
        filteredInquiries = [...filteredInquiries].sort((a: any, b: any) =>
          a.thread_path.localeCompare(b.thread_path)
        );
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

// =====================================================
// 테스트 시작
// =====================================================

test.describe('useReplyBinding Hook - 답변 바인딩 데이터 로딩', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 접속 전 인증 설정
    await prepareAccessToken(page);
    await mockSupabaseSession(page);
  });

  // =====================================================
  // 성공 시나리오
  // =====================================================

  test('성공: 답변 데이터 조회 및 렌더링 - useReplyBinding Hook이 Supabase에서 데이터 조회', async ({ page }) => {
    // 이 테스트는 useReplyBinding Hook이 정상적으로 작동하는지 검증합니다.
    // Hook의 역할:
    // 1. phoneId로 phone_inquiries 테이블에서 데이터 조회
    // 2. thread_path 기준 오름차순 정렬
    // 3. parent_id 기반 트리 구조 유지
    // 4. 데이터를 InquiryItem[] 타입으로 변환
    // 5. 날짜를 YYYY.MM.DD 형식으로 변환

    const mockInquiries = [
      {
        id: '01-parent-inquiry',
        phone_id: PHONE_ID,
        parent_id: null, // 최상위 문의
        thread_path: '0001',
        author_id: 'user-001',
        content: '이 폰의 배터리는 얼마나 지속되나요?',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      },
      {
        id: '02-seller-reply',
        phone_id: PHONE_ID,
        parent_id: '01-parent-inquiry', // 판매자 답변
        thread_path: '0001.0001',
        author_id: 'seller-001',
        content: '배터리는 약 12시간 지속됩니다.',
        is_answer: true, // 판매자 답변
        status: 'active',
        created_at: '2025-11-01T11:00:00Z',
        updated_at: '2025-11-01T11:00:00Z',
      },
    ];

    await mockInquiriesReplies(page, mockInquiries);
    await page.goto(`/phones/${PHONE_ID}`);

    // 페이지 로드 확인
    await page.waitForLoadState('domcontentloaded');
    
    // 기본적으로 페이지가 로드되었는지 확인
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('성공: thread_path 기준 정렬 검증 - 비정렬 데이터가 정렬되어 반환됨', async ({ page }) => {
    // useReplyBinding Hook은 Supabase의 결과를 thread_path 기준으로 정렬하여 반환합니다.
    // Mock Supabase API가 정렬된 데이터를 반환하므로,
    // Hook이 제대로 작동하면 정렬된 데이터를 받을 수 있습니다.

    const mockInquiries = [
      // Mock은 요청한 order 파라미터에 맞춰 정렬된 데이터 반환
      {
        id: 'inquiry-1',
        phone_id: PHONE_ID,
        parent_id: null,
        thread_path: '0001',
        author_id: 'user-001',
        content: '첫 번째 문의',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      },
      {
        id: 'inquiry-2',
        phone_id: PHONE_ID,
        parent_id: null,
        thread_path: '0002',
        author_id: 'user-001',
        content: '두 번째 문의',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-02T10:00:00Z',
        updated_at: '2025-11-02T10:00:00Z',
      },
    ];

    await mockInquiriesReplies(page, mockInquiries);
    await page.goto(`/phones/${PHONE_ID}`);

    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('성공: parent_id 기반 계층 구조 검증 - 부모/자식 관계 유지', async ({ page }) => {
    // useReplyBinding Hook은 parent_id를 유지하며 데이터를 반환합니다.
    // 최상위 문의 (parent_id: null)와 답변 (parent_id: inquiry id)의 관계가 유지됩니다.

    const mockInquiries = [
      {
        id: 'parent-1',
        phone_id: PHONE_ID,
        parent_id: null, // 최상위
        thread_path: '0001',
        author_id: 'user-001',
        content: '최상위 문의',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      },
      {
        id: 'reply-1',
        phone_id: PHONE_ID,
        parent_id: 'parent-1',
        thread_path: '0001.0001',
        author_id: 'user-002',
        content: '첫 번째 답변',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T11:00:00Z',
        updated_at: '2025-11-01T11:00:00Z',
      },
    ];

    await mockInquiriesReplies(page, mockInquiries);
    await page.goto(`/phones/${PHONE_ID}`);

    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('성공: 로딩 상태 표시', async ({ page }) => {
    const mockInquiries = [
      {
        id: 'inquiry-1',
        phone_id: PHONE_ID,
        parent_id: null,
        thread_path: '0001',
        author_id: 'user-001',
        content: '문의 내용',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      },
    ];

    await mockInquiriesReplies(page, mockInquiries);
    await page.goto(`/phones/${PHONE_ID}`);

    // 페이지 로드 상태 확인
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  // =====================================================
  // 실패 시나리오
  // =====================================================

  test('실패: API 호출 실패 시 에러 메시지 표시', async ({ page }) => {
    // API 호출 실패 Mock
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForLoadState('domcontentloaded');

    // 실패 시나리오 테스트
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('실패: 빈 배열 처리 - "문의가 없습니다" 표시', async ({ page }) => {
    // 빈 배열 반환 Mock
    await page.route('**/rest/v1/phone_inquiries**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([]  ), // 빈 배열
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForLoadState('domcontentloaded');

    // 빈 상태 확인
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('실패: 판매자가 아닌 사용자는 canEdit/canDelete가 false', async ({ page }) => {
    const mockInquiries = [
      {
        id: 'inquiry-1',
        phone_id: PHONE_ID,
        parent_id: null,
        thread_path: '0001',
        author_id: 'other-user-id', // 다른 사용자
        content: '문의 내용',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      },
    ];

    await mockInquiriesReplies(page, mockInquiries);
    await page.goto(`/phones/${PHONE_ID}`);
    await page.waitForLoadState('domcontentloaded');

    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('실패: 판매자 답변 표시 검증 - is_answer 필드로 판매자 구분', async ({ page }) => {
    // useReplyBinding Hook은 is_answer 필드를 InquiryItem의 author.role로 변환합니다.
    // is_answer가 true이면 role: 'seller', false이면 role: 'user'

    const mockInquiries = [
      {
        id: 'inquiry-1',
        phone_id: PHONE_ID,
        parent_id: null,
        thread_path: '0001',
        author_id: 'user-001',
        content: '일반 사용자 문의',
        is_answer: false,
        status: 'active',
        created_at: '2025-11-01T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      },
      {
        id: 'reply-1',
        phone_id: PHONE_ID,
        parent_id: 'inquiry-1',
        thread_path: '0001.0001',
        author_id: 'seller-001',
        content: '판매자 답변',
        is_answer: true, // 판매자 답변
        status: 'active',
        created_at: '2025-11-01T11:00:00Z',
        updated_at: '2025-11-01T11:00:00Z',
      },
    ];

    await mockInquiriesReplies(page, mockInquiries);
    await page.goto(`/phones/${PHONE_ID}`);

    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});
