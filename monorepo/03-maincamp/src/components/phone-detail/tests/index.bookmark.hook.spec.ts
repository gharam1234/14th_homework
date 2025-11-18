import { test, expect, BrowserContext, Page, Route } from '@playwright/test';

/**
 * PhoneDetail 북마크 기능 테스트
 * @description TDD 기반으로 구현한 북마크 기능의 통합 테스트
 * - Playwright를 사용한 E2E 테스트
 * - timeout 500ms 이하로 설정
 * - data-testid를 사용하여 페이지 로드 대기
 */

const BOOKMARK_BUTTON_SELECTOR = '[title="북마크"]';
const BOOKMARK_BADGE_SELECTOR = '[data-testid="bookmark-badge"]';
const ACTION_BUTTONS_SELECTOR = '[data-testid="action-buttons"]';
const BOOKMARK_ICON_PATH_SELECTOR = `${BOOKMARK_BUTTON_SELECTOR} path`;
const SUPABASE_REACTIONS_ROUTE = '**/rest/v1/phone_reactions**';
const PHONE_ID = 'listing-001';

const resolveSupabaseStorageKey = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  return projectRef ? `sb-${projectRef}-auth-token` : 'sb-bookmark-test-auth-token';
};

const SUPABASE_STORAGE_KEY = resolveSupabaseStorageKey();

const TEST_SESSION = {
  currentSession: {
    access_token: 'test-token',
    token_type: 'bearer',
    refresh_token: 'test-refresh-token',
    user: { id: 'test-user' },
  },
  access_token: 'test-token',
  refresh_token: 'test-refresh-token',
  user: { id: 'test-user' },
};
const TEST_USER_ID = TEST_SESSION.user.id;

async function mockLogin(context: BrowserContext) {
  await context.addInitScript(({ key, session }) => {
    window.localStorage.setItem(key, JSON.stringify(session));
    (window as any).__TEST_SUPABASE_USER__ = session.user;
    (window as any).__TEST_SUPABASE_LOGIN__ = true;
  }, { key: SUPABASE_STORAGE_KEY, session: TEST_SESSION });
}

async function expectBookmarkFill(page: Page, value: string) {
  const bookmarkPath = page.locator(BOOKMARK_ICON_PATH_SELECTOR);
  await expect(bookmarkPath).toHaveAttribute('fill', value);
}

type ReactionRecord = {
  id: string;
  phone_id: string;
  user_id: string;
  type: 'favorite';
  deleted_at: string | null;
  metadata: Record<string, unknown> | null;
};

function createReaction(phoneId: string, userId: string): ReactionRecord {
  return {
    id: 'reaction-001',
    phone_id: phoneId,
    user_id: userId,
    type: 'favorite',
    deleted_at: null,
    metadata: null,
  };
}

function fulfillJson(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  });
}

function parseRequestBody(route: Route) {
  const raw = route.request().postData();
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed[0] ?? {} : parsed;
}

async function stubPhoneReactions(
  page: Page,
  resolver: (route: Route, stored: { current: ReactionRecord | null }) => Promise<void>
) {
  const stored = { current: null as ReactionRecord | null };
  await page.route(SUPABASE_REACTIONS_ROUTE, (route) => resolver(route, stored));
}

/**
 * 테스트: 로그인되지 않은 경우, 경고 메시지 표시
 */
test('미로그인 상태에서 북마크 버튼 클릭 시 경고 메시지 표시', async ({
  page,
}) => {
  // 페이지 로드
  await page.goto('/phone-detail');

  // 페이지가 완전히 로드될 때까지 대기 (data-testid)
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 북마크 버튼 클릭
  await page.click(BOOKMARK_BUTTON_SELECTOR);

  // 경고 메시지 확인
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  const messageText = await page.textContent('.ant-message-notice-content');
  expect(messageText).toContain('로그인이 필요합니다.');
});

/**
 * 테스트: 로그인된 상태에서 북마크 추가 성공
 */
test('로그인 후 북마크 추가 시 성공 메시지 표시 및 UI 업데이트', async ({
  page,
  context,
}) => {
  // 로그인 상태 설정
  await mockLogin(context);

  await stubPhoneReactions(page, async (route, stored) => {
    const method = route.request().method();
    if (method === 'GET') {
      if (stored.current) {
        await fulfillJson(route, [stored.current]);
      } else {
        await fulfillJson(route, []);
      }
      return;
    }

    if (method === 'POST') {
      const payload = parseRequestBody(route);
      stored.current = {
        ...createReaction(PHONE_ID, TEST_USER_ID),
        ...payload,
      };
      await fulfillJson(route, [stored.current]);
      return;
    }

    await route.fallback();
  });

  // 페이지 로드
  await page.goto('/phone-detail');

  // 페이지 로드 완료 대기
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 북마크 버튼 클릭
  await page.click(BOOKMARK_BUTTON_SELECTOR);

  // 성공 메시지 확인
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  const messageText = await page.textContent('.ant-message-notice-content');
  expect(messageText).toContain('관심상품에 추가되었습니다.');

  await expectBookmarkFill(page, '#ff6b6b');
});

/**
 * 테스트: 북마크 제거 시 성공 메시지 표시 및 UI 업데이트
 */
test('북마크 제거 시 성공 메시지 표시 및 UI 업데이트', async ({
  page,
  context,
}) => {
  // 로그인 상태 설정
  await mockLogin(context);

  await stubPhoneReactions(page, async (route, stored) => {
    const method = route.request().method();
    if (method === 'GET') {
      if (stored.current) {
        await fulfillJson(route, [stored.current]);
      } else {
        await fulfillJson(route, []);
      }
      return;
    }

    if (method === 'POST') {
      const payload = parseRequestBody(route);
      stored.current = {
        ...createReaction(PHONE_ID, TEST_USER_ID),
        ...payload,
      };
      await fulfillJson(route, [stored.current]);
      return;
    }

    if (method === 'PATCH') {
      const payload = parseRequestBody(route);
      stored.current = {
        ...(stored.current ?? createReaction(PHONE_ID, TEST_USER_ID)),
        ...payload,
      };
      await fulfillJson(route, [stored.current]);
      return;
    }

    await route.fallback();
  });

  // 페이지 로드
  await page.goto('/phone-detail');

  // 페이지 로드 완료 대기
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 첫 번째 클릭 - 북마크 추가
  await page.click(BOOKMARK_BUTTON_SELECTOR);
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  await expectBookmarkFill(page, '#ff6b6b');

  await page.waitForSelector('.ant-message-notice', {
    state: 'detached',
  });

  // 두 번째 클릭 - 북마크 제거
  await page.click(BOOKMARK_BUTTON_SELECTOR);

  // 제거 성공 메시지 확인
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  const messageText = await page.textContent('.ant-message-notice-content');
  expect(messageText).toContain('관심상품에서 제거되었습니다.');
  await expectBookmarkFill(page, 'none');
});

/**
 * 테스트: 북마크 업데이트 실패 시 에러 메시지 및 UI 롤백
 */
test('북마크 업데이트 실패 시 에러 메시지 표시 및 상태 롤백', async ({
  page,
  context,
}) => {
  // 로그인 상태 설정
  await mockLogin(context);

  // Supabase API 실패하도록 설정
  await stubPhoneReactions(page, async (route, _stored) => {
    const method = route.request().method();
    if (method === 'GET') {
      await fulfillJson(route, []);
      return;
    }

    route.abort('failed');
  });

  // 페이지 로드
  await page.goto('/phone-detail');

  // 페이지 로드 완료 대기
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 북마크 버튼 클릭
  await page.click(BOOKMARK_BUTTON_SELECTOR);

  // 에러 메시지 확인
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  const messageText = await page.textContent('.ant-message-notice-content');
  expect(messageText).toContain(
    '작업에 실패했습니다. 다시 시도해주세요.'
  );
  await expectBookmarkFill(page, 'none');
});

/**
 * 테스트: 북마크 배지에 좋아요 수 표시
 */
test('북마크 배지에 좋아요 수가 올바르게 표시됨', async ({ page }) => {
  // 페이지 로드
  await page.goto('/phone-detail');

  // 페이지 로드 완료 대기
  await page.waitForSelector('[data-testid="bookmark-badge"]');

  // 북마크 배지의 숫자 확인
  const countText = await page.textContent(BOOKMARK_BADGE_SELECTOR);
  expect(countText).toMatch(/\d+/);
});

/**
 * 테스트: 액션 버튼 섹션이 렌더링됨
 */
test('액션 버튼 섹션(삭제, 공유, 위치, 북마크)이 렌더링됨', async ({
  page,
}) => {
  // 페이지 로드
  await page.goto('/phone-detail');

  // 페이지 로드 완료 대기
  await page.waitForSelector(ACTION_BUTTONS_SELECTOR);

  // 액션 버튼이 존재하는지 확인
  const actionButtons = await page.$$(ACTION_BUTTONS_SELECTOR);
  expect(actionButtons.length).toBeGreaterThan(0);
});
