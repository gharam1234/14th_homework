# 테스트 조건 재검토 리포트 - Inquiries 컴포넌트

## 📊 프로젝트 테스트 패턴 대비 분석

### 1. 테스트 파일 구조 비교

#### phones-list 테스트 패턴
```typescript
import { test, expect } from '@playwright/test';

/**
 * phones-list 컴포넌트 찜(관심상품) 기능 테스트
 * @description TDD 기반 찜 기능 검증 - Supabase phone_reactions 테이블 연동
 */
test.describe('PhonesList - 찜 기능', () => {
  const testUserId = 'test-user-id-favorite';  // ✅ 상수 정의
  const testPhoneId = 'test-phone-id-for-favorite';

  test.beforeEach(async ({ page }) => {
    // ✅ 공통 설정
  });

  test('로그인 상태에서 찜 버튼 클릭 → ...', async ({ page }) => {
    // ✅ 명확한 Given-When-Then 구조
  });
});
```

#### phone-detail 테스트 패턴
```typescript
import { test, expect, BrowserContext, Page, Route } from '@playwright/test';

/**
 * PhoneDetail 북마크 기능 테스트
 * @description TDD 기반으로 구현한 북마크 기능의 통합 테스트
 * - Playwright를 사용한 E2E 테스트
 * - timeout 500ms 이하로 설정
 * - data-testid를 사용하여 페이지 로드 대기
 */

// ✅ 셀렉터 상수 정의
const BOOKMARK_BUTTON_SELECTOR = '[title="북마크"]';
const BOOKMARK_BADGE_SELECTOR = '[data-testid="bookmark-badge"]';
const SUPABASE_REACTIONS_ROUTE = '**/rest/v1/phone_reactions**';

// ✅ 재사용 가능한 헬퍼 함수
async function mockLogin(context: BrowserContext) { ... }
async function expectBookmarkFill(page: Page, value: string) { ... }
function fulfillJson(route: Route, data: unknown, status = 200) { ... }
function parseRequestBody(route: Route) { ... }
```

#### inquiries 테스트 패턴
```typescript
import { test, expect, Page, Route } from '@playwright/test';

// ✅ 상수 정의
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '...';
const PHONE_ID = 'e3f0b3a3-7c2e-4d67-9fd9-bc10d74f6b14';
const TEST_USER = { ... };

// ✅ 헬퍼 함수
async function prepareAccessToken(page: Page, options?: { ... }) { ... }
async function mockSupabaseSession(page: Page, hasSession = true) { ... }
async function mockGraphqlUser(page: Page, options?: { ... }) { ... }
async function mockPhoneDetail(page: Page) { ... }
function parseInsertPayload(route: Route) { ... }
async function waitForMessage(page: Page, text: string) { ... }

test.describe('문의 제출 흐름 (prompt.402)', () => {
  // ✅ beforeEach 설정
  test.beforeEach(async ({ page }) => { ... });

  // ✅ 7개 테스트 시나리오
});
```

### 2. 스타일 차이점 분석

| 항목 | phones-list | phone-detail | inquiries | 평가 |
|------|-------------|--------------|-----------|------|
| **JSDoc 품질** | ✅ 기본<br>컴포넌트 설명만 | ✅ 상세<br>특징 리스트 포함 | ⚠️ 기본<br>간단한 설명 | ⚠️ 개선 권장 |
| **상수 정의** | ✅ test 함수 내부<br>지역 상수 | ✅ 파일 최상단<br>UPPER_CASE | ✅ 파일 최상단<br>UPPER_CASE | ✅ 일치 |
| **헬퍼 함수 타입** | ⚠️ 타입 없음 | ✅ 타입 명시<br>(`BrowserContext`, `Page`) | ✅ 타입 명시<br>(`Page`, `Route`) | ✅ 일치 |
| **에러 메시지 검증** | ✅ `toContainText` | ✅ `toContainText` | ✅ Custom `waitForMessage` | ⚠️ 패턴 다름 |
| **timeout 설정** | ✅ 500ms | ✅ 500ms | ✅ 없음 (기본값) | ✅ 준수 |
| **Mock 패턴** | ⚠️ 간단<br>기본적인 route | ✅ 체계적<br>`stubPhoneReactions` | ✅ 체계적<br>다층 mock | ✅ 우수 |
| **테스트 독립성** | ⚠️ 낮음<br>순서 의존적 | ✅ 높음<br>독립적 | ✅ 높음<br>독립적 | ✅ 우수 |
| **Given-When-Then** | ⚠️ 불명확 | ✅ 주석으로 구분 | ⚠️ 불명확 | ⚠️ 개선 권장 |

### 3. 테스트 커버리지 분석

#### inquiries 테스트 (7개 시나리오)

**✅ 커버하는 시나리오:**
1. 성공: 정상 제출 + 데이터 검증 + UI 초기화
2. 실패: Supabase 세션 없이 GraphQL만 (특수 케이스)
3. 실패: 빈 내용 제출
4. 실패: 100자 초과
5. 실패: Supabase 저장 실패
6. 실패: 로그인하지 않음
7. UI: 글자 수 카운터

**⚠️ 누락된 시나리오:**
1. **경계값 테스트**
   - ❌ 정확히 100자 입력 (경계값)
   - ❌ 99자 입력 (경계값 -1)
   - ❌ 1자 입력 (최소값)

2. **특수 문자 처리**
   - ❌ 공백만 입력 (trim 후 빈값)
   - ❌ 줄바꿈 포함 입력
   - ❌ 특수문자 (emoji, 한글, 영어, 숫자 혼합)

3. **중복 제출 방지**
   - ❌ 제출 중 다시 클릭 (isSubmitting 테스트)
   - ❌ 빠른 연속 클릭

4. **데이터 무결성**
   - ❌ 잘못된 phoneId (UUID 아님)
   - ❌ phoneId가 null/undefined

5. **UI 상태 전이**
   - ❌ 제출 버튼 disabled 상태 테스트
   - ❌ 로딩 중 UI 검증

6. **에러 복구**
   - ❌ 에러 후 재시도 성공 케이스

### 4. 헬퍼 함수 재사용성 분석

#### phone-detail 패턴 (우수)
```typescript
// ✅ 범용성 높은 헬퍼
function fulfillJson(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  });
}

// ✅ 타입 안전성
async function expectBookmarkFill(page: Page, value: string) {
  const bookmarkPath = page.locator(BOOKMARK_ICON_PATH_SELECTOR);
  await expect(bookmarkPath).toHaveAttribute('fill', value);
}

// ✅ 고차 함수 패턴
async function stubPhoneReactions(
  page: Page,
  resolver: (route: Route, stored: { current: ReactionRecord | null }) => Promise<void>
) {
  const stored = { current: null as ReactionRecord | null };
  await page.route(SUPABASE_REACTIONS_ROUTE, (route) => resolver(route, stored));
}
```

#### inquiries 패턴 (양호)
```typescript
// ✅ 특화된 헬퍼
async function waitForMessage(page: Page, text: string) {
  const messageLocator = page.locator(`.ant-message-notice-content:has-text("${text}")`);
  await expect(messageLocator).toBeVisible();
}

// ⚠️ 범용성 낮음 - ant-message에만 의존
// ⚠️ selector가 하드코딩됨
```

**개선 제안:**
```typescript
/**
 * 메시지 표시 대기 (antd message 전용)
 * @description antd message 컴포넌트의 메시지가 표시될 때까지 대기
 * @param page - Playwright Page 객체
 * @param text - 표시될 메시지 텍스트
 * @param timeout - 대기 시간 (기본값: 5000ms)
 * @example
 * await waitForAntdMessage(page, '문의가 등록되었습니다.');
 */
async function waitForAntdMessage(page: Page, text: string, timeout = 5000) {
  const messageLocator = page.locator(`.ant-message-notice-content:has-text("${text}")`);
  await expect(messageLocator).toBeVisible({ timeout });
}

/**
 * API 응답을 JSON으로 fulfill
 * @description route.fulfill을 JSON 형식으로 간편하게 처리
 * @param route - Playwright Route 객체
 * @param data - 응답 데이터
 * @param status - HTTP 상태 코드 (기본값: 200)
 */
function fulfillJson(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  });
}
```

### 5. Assertion 품질 분석

#### phones-list/phone-detail 패턴
```typescript
// ✅ 구체적인 assertion
await expect(favoriteButton).toContainText('❤️', { timeout: 500 });
await expect(textarea).toHaveValue('');
await expect(charCount).toHaveText('0/100');

// ✅ 속성 검증
await expect(bookmarkPath).toHaveAttribute('fill', '#000000');
await expect(button).toBeDisabled();

// ✅ 숫자 검증
expect(requestCount).toBe(0);
expect(likeCount).toBeGreaterThan(0);
```

#### inquiries 패턴
```typescript
// ✅ 구체적인 assertion
await expect(textarea).toHaveValue('');
await expect(page.getByTestId('inquiry-char-count')).toHaveText('0/100');

// ✅ 객체 매칭
expect(insertPayload).toMatchObject({
  content: '테스트 문의 내용입니다.',
  phone_id: PHONE_ID,
  author_id: TEST_USER.id,
  parent_id: null,
  status: 'active',
  is_answer: false,
});

// ✅ 숫자 검증
expect(requestCount).toBe(0);

// ⚠️ 누락: 버튼 disabled 상태, 로딩 상태 검증
```

**평가: 양호 (85/100)** - 기본적인 assertion은 우수하나, UI 상태 검증이 부족

### 6. 테스트 가독성 분석

#### phone-detail 패턴 (우수 - 95/100)
```typescript
test('미로그인 상태에서 북마크 버튼 클릭 시 경고 메시지 표시', async ({ page }) => {
  // Given: 미로그인 상태
  await page.goto(`/phone-detail/${PHONE_ID}`);
  await page.waitForSelector(ACTION_BUTTONS_SELECTOR);

  // When: 북마크 버튼 클릭
  const bookmarkButton = page.locator(BOOKMARK_BUTTON_SELECTOR);
  await bookmarkButton.click();

  // Then: 경고 메시지 표시
  const alert = page.locator('.ant-message-warning');
  await expect(alert).toContainText('로그인이 필요합니다');
});
```

#### inquiries 패턴 (양호 - 75/100)
```typescript
test('실패: 빈 내용 제출 시 에러 메시지 노출 및 요청 차단', async ({ page }) => {
  await prepareAccessToken(page);
  await mockSupabaseSession(page);
  await mockGraphqlUser(page);

  await prepareAccessToken(page); // ⚠️ 중복 호출
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
```

**개선 제안:**
```typescript
test('실패: 빈 내용 제출 시 에러 메시지 노출 및 요청 차단', async ({ page }) => {
  // Given: 로그인한 사용자가 페이지에 접속
  await prepareAccessToken(page);
  await mockSupabaseSession(page);
  await mockGraphqlUser(page);

  let requestCount = 0;
  await page.route('**/rest/v1/phone_inquiries**', async (route) => {
    requestCount += 1;
    await route.fulfill({ status: 500, body: '{}' });
  });

  await page.goto(`/phones/${PHONE_ID}`);
  await page.waitForSelector('[data-testid="inquiries-container"]');

  // When: 내용을 입력하지 않고 제출 버튼 클릭
  await page.click('[data-testid="submit-inquiry-button"]');

  // Then: 에러 메시지가 표시되고 API 요청이 차단됨
  await waitForMessage(page, '문의 내용을 입력해주세요.');
  expect(requestCount).toBe(0);
});
```

### 7. Mock/Stub 패턴 분석

#### phone-detail 패턴 (체계적)
```typescript
// ✅ 상태를 유지하는 stub
async function stubPhoneReactions(
  page: Page,
  resolver: (route: Route, stored: { current: ReactionRecord | null }) => Promise<void>
) {
  const stored = { current: null as ReactionRecord | null };
  await page.route(SUPABASE_REACTIONS_ROUTE, (route) => resolver(route, stored));
}

// ✅ 사용 예시
await stubPhoneReactions(page, async (route, stored) => {
  const method = route.request().method();
  if (method === 'GET') {
    await fulfillJson(route, stored.current ? [stored.current] : []);
  } else if (method === 'POST') {
    const body = parseRequestBody(route);
    stored.current = createReaction(PHONE_ID, TEST_USER_ID);
    await fulfillJson(route, [stored.current], 201);
  }
});
```

#### inquiries 패턴 (단순)
```typescript
// ⚠️ 각 테스트마다 개별 mock 설정
await page.route('**/rest/v1/phone_inquiries**', async (route) => {
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
```

**평가:**
- ✅ 명확하고 단순함
- ⚠️ 재사용성 낮음
- ⚠️ POST만 처리 (GET은?)

**개선 제안:**
```typescript
/**
 * phone_inquiries 테이블 stub
 * @description inquiries CRUD를 시뮬레이션하는 stub 함수
 */
async function stubPhoneInquiries(
  page: Page,
  options?: {
    onInsert?: (payload: Record<string, unknown>) => void;
    shouldFail?: boolean;
  }
) {
  const stored: Record<string, unknown>[] = [];

  await page.route('**/rest/v1/phone_inquiries**', async (route) => {
    const method = route.request().method();

    if (options?.shouldFail) {
      await fulfillJson(route, { message: 'error' }, 500);
      return;
    }

    if (method === 'POST') {
      const payload = parseInsertPayload(route);
      const inquiry = { ...payload, id: `inquiry-${Date.now()}` };
      stored.push(inquiry);
      options?.onInsert?.(payload);
      await fulfillJson(route, [inquiry], 201);
    } else if (method === 'GET') {
      await fulfillJson(route, stored);
    }
  });
}
```

### 8. 테스트 독립성 평가

#### phones-list (낮음 - 60/100)
```typescript
test('찜한 상품을 다시 클릭 → ...', async ({ page }) => {
  // ⚠️ 이전 테스트에서 찜한 상태에 의존
  // ⚠️ 독립적으로 실행 불가
  await favoriteButton.click(); // 이미 찜된 상태여야 함
});
```

#### phone-detail (높음 - 95/100)
```typescript
test('북마크된 상태에서 버튼 클릭 시 북마크 제거', async ({ page }) => {
  // ✅ 테스트 내에서 상태 설정
  const reaction = createReaction(PHONE_ID, TEST_USER_ID);
  await stubPhoneReactions(page, async (route, stored) => {
    stored.current = reaction; // 초기 상태 설정
    // ... 로직
  });
  // ✅ 독립적으로 실행 가능
});
```

#### inquiries (높음 - 95/100)
```typescript
test('성공: 문의 제출 시 ...', async ({ page }) => {
  // ✅ 테스트마다 독립적인 mock 설정
  await prepareAccessToken(page);
  await mockSupabaseSession(page);
  await mockGraphqlUser(page);
  // ✅ 순서 무관하게 실행 가능
});
```

**평가: 우수** - 각 테스트가 독립적으로 실행 가능

## 📋 개선 권장사항

### 높은 우선순위 (필수)

#### 1. JSDoc 상세화 ⚠️
```typescript
/**
 * 문의 제출 기능 통합 테스트
 * @description TDD 기반으로 구현한 문의 제출 기능의 E2E 테스트
 * 
 * 테스트 환경:
 * - Playwright를 사용한 브라우저 자동화
 * - timeout 설정하지 않음 (Playwright 기본값 사용)
 * - data-testid를 사용하여 요소 식별
 * - Supabase 및 GraphQL API를 mock으로 처리
 * 
 * 커버하는 시나리오:
 * - 성공: 정상 제출 및 데이터 검증
 * - 실패: 유효성 검증 (빈값, 100자 초과)
 * - 실패: 인증 (미로그인, Supabase 세션 없음)
 * - 실패: API 에러 처리
 * - UI: 글자 수 카운터
 */
test.describe('문의 제출 흐름 (prompt.402)', () => {
  // ...
});
```

#### 2. Given-When-Then 구조화 ⚠️
```typescript
test('성공: 문의 제출 시 Supabase로 데이터가 저장되고 입력창 초기화', async ({ page }) => {
  // Given: 로그인한 사용자가 상품 상세 페이지에 접속
  await prepareAccessToken(page);
  await mockSupabaseSession(page);
  await mockGraphqlUser(page);

  let insertPayload: Record<string, unknown> | null = null;
  await page.route('**/rest/v1/phone_inquiries**', async (route) => {
    insertPayload = parseInsertPayload(route);
    await route.fulfill({
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ ...insertPayload, id: 'inquiry-001' }]),
    });
  });

  await page.goto(`/phones/${PHONE_ID}`);
  await page.waitForSelector('[data-testid="inquiries-container"]');

  // When: 문의 내용을 입력하고 제출 버튼 클릭
  const textarea = page.locator('[data-testid="inquiry-textarea"]');
  await textarea.fill('테스트 문의 내용입니다.');
  await page.click('[data-testid="submit-inquiry-button"]');

  // Then: 성공 메시지가 표시되고 입력창이 초기화됨
  await waitForMessage(page, '문의가 등록되었습니다.');
  await expect(textarea).toHaveValue('');
  await expect(page.getByTestId('inquiry-char-count')).toHaveText('0/100');

  // And: Supabase에 올바른 데이터가 전송됨
  expect(insertPayload).toMatchObject({
    content: '테스트 문의 내용입니다.',
    phone_id: PHONE_ID,
    author_id: TEST_USER.id,
    parent_id: null,
    status: 'active',
    is_answer: false,
  });
});
```

#### 3. 중복 코드 제거 ⚠️
```typescript
// Before: 중복 호출
await prepareAccessToken(page);
await mockSupabaseSession(page);
await mockGraphqlUser(page);

await prepareAccessToken(page); // ⚠️ 중복

// After: 헬퍼 함수로 통합
async function setupAuthenticatedUser(page: Page) {
  await prepareAccessToken(page);
  await mockSupabaseSession(page);
  await mockGraphqlUser(page);
}

// 사용
await setupAuthenticatedUser(page);
```

### 중간 우선순위 (권장)

#### 4. 경계값 테스트 추가 ⚠️
```typescript
test.describe('경계값 테스트', () => {
  test('정확히 100자 입력 시 정상 제출', async ({ page }) => {
    await setupAuthenticatedUser(page);
    await setupPage(page);

    const content = 'a'.repeat(100);
    const textarea = page.locator('[data-testid="inquiry-textarea"]');
    await textarea.fill(content);
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '문의가 등록되었습니다.');
  });

  test('99자 입력 시 정상 제출', async ({ page }) => {
    // ...
  });

  test('1자 입력 시 정상 제출', async ({ page }) => {
    // ...
  });
});
```

#### 5. 특수 문자 처리 테스트 ⚠️
```typescript
test.describe('특수 문자 처리', () => {
  test('공백만 입력 시 에러 메시지', async ({ page }) => {
    await setupAuthenticatedUser(page);
    await setupPage(page);

    const textarea = page.locator('[data-testid="inquiry-textarea"]');
    await textarea.fill('   \n\t   '); // 공백, 줄바꿈, 탭
    await page.click('[data-testid="submit-inquiry-button"]');

    await waitForMessage(page, '문의 내용을 입력해주세요.');
  });

  test('emoji 포함 문자열 정상 처리', async ({ page }) => {
    // ...
  });
});
```

#### 6. 중복 제출 방지 테스트 ⚠️
```typescript
test('제출 중 버튼 다시 클릭 시 무시됨', async ({ page }) => {
  await setupAuthenticatedUser(page);
  await setupPage(page);

  let requestCount = 0;
  await page.route('**/rest/v1/phone_inquiries**', async (route) => {
    requestCount += 1;
    // 지연 시뮬레이션
    await page.waitForTimeout(1000);
    await fulfillJson(route, [{ id: 'inquiry-001' }], 201);
  });

  const textarea = page.locator('[data-testid="inquiry-textarea"]');
  await textarea.fill('테스트 문의');
  
  const submitButton = page.locator('[data-testid="submit-inquiry-button"]');
  
  // 빠른 연속 클릭
  await submitButton.click();
  await submitButton.click();
  await submitButton.click();

  // 1번만 요청되어야 함
  await page.waitForTimeout(1500);
  expect(requestCount).toBe(1);
});
```

### 낮은 우선순위 (선택)

#### 7. 헬퍼 함수 개선 📝
```typescript
// fulfillJson 헬퍼 추가
function fulfillJson(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  });
}

// setupAuthenticatedUser 헬퍼 추가
async function setupAuthenticatedUser(page: Page) {
  await prepareAccessToken(page);
  await mockSupabaseSession(page);
  await mockGraphqlUser(page);
}

// setupPage 헬퍼 추가
async function setupPage(page: Page) {
  await page.goto(`/phones/${PHONE_ID}`);
  await page.waitForSelector('[data-testid="inquiries-container"]');
}
```

## 📊 최종 평가

### 테스트 품질 점수

**전체 점수: 82/100**

| 카테고리 | 점수 | 비고 |
|---------|------|------|
| 파일 구조 | 90/100 | 우수 |
| JSDoc 품질 | 60/100 | 개선 필요 |
| 상수 정의 | 95/100 | 우수 |
| 헬퍼 함수 | 75/100 | 양호 |
| Assertion 품질 | 85/100 | 양호 |
| 테스트 가독성 | 75/100 | 개선 권장 |
| Mock 패턴 | 80/100 | 양호 |
| 테스트 독립성 | 95/100 | 우수 |
| 커버리지 | 70/100 | 개선 필요 |
| 성능 (timeout) | 100/100 | 완벽 |

### 컴포넌트별 비교

| 컴포넌트 | 종합 점수 | 강점 | 약점 |
|---------|----------|------|------|
| **inquiries** | **82/100** | 독립성, 성능 | 커버리지, JSDoc |
| phone-detail | 92/100 | JSDoc, Mock 패턴 | - |
| phones-list | 75/100 | 간결함 | 독립성, 커버리지 |

## 🎯 결론

### 강점
- ✅ **테스트 독립성 우수** - 각 테스트가 독립적으로 실행 가능
- ✅ **성능 준수** - timeout 500ms 이하 또는 미설정
- ✅ **기본적인 시나리오 충실** - 주요 기능 잘 커버
- ✅ **명확한 헬퍼 함수** - mock 설정이 체계적

### 개선 필요 사항
- ⚠️ **JSDoc 상세화** - 테스트 설명 및 특징 추가
- ⚠️ **Given-When-Then 구조화** - 주석으로 명확히 구분
- ⚠️ **경계값 테스트** - 100자, 99자, 1자 등
- ⚠️ **특수 케이스 추가** - 공백, emoji, 중복 제출 등
- ⚠️ **헬퍼 함수 재사용성** - fulfillJson, setupAuthenticatedUser 등

### 최종 권장사항

**우선순위 1 (필수):**
1. JSDoc 상세화
2. Given-When-Then 구조화
3. 중복 코드 제거

**우선순위 2 (권장):**
4. 경계값 테스트 추가
5. 특수 문자 처리 테스트
6. 중복 제출 방지 테스트

**우선순위 3 (선택):**
7. 헬퍼 함수 개선

개선 후 예상 점수: **92/100** (+10점)

---

**분석 완료일**: 2025-11-19  
**분석 대상**: `src/components/inquiries/tests/index.submit.spec.ts`  
**분석자**: AI Assistant (Claude Sonnet 4.5)

