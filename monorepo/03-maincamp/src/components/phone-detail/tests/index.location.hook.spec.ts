import { test, expect, Page } from '@playwright/test';

/**
 * PhoneDetail 위치 기능 테스트
 * @description TDD 기반으로 구현한 위치 기능의 통합 테스트
 * - Playwright를 사용한 E2E 테스트
 * - timeout 500ms 이하로 설정
 * - data-testid를 사용하여 페이지 로드 대기
 */

const LOCATION_BUTTON_SELECTOR = '[title="위치"]';
const PHONE_DETAIL_ROUTE = '**/rest/v1/phones**';

/**
 * 지도 URL이 올바른 형식인지 검증
 */
function isValidMapUrl(url: string): boolean {
  const kakaoMapPattern = /^https:\/\/map\.kakao\.com\/link\/search\/.+/;
  const naverMapPattern = /^https:\/\/map\.naver\.com\/v5\/search\/.+/;
  return kakaoMapPattern.test(url) || naverMapPattern.test(url);
}

/**
 * 테스트: 거래 지역 정보가 있는 경우 - 지도 서비스로 열기
 */
test('거래 지역 정보가 있는 경우 위치 아이콘 클릭 시 외부 지도 서비스로 새 창 열기', async ({
  page,
  context,
}) => {
  // Mock 데이터 설정 (거래 지역 정보 포함)
  await page.route(PHONE_DETAIL_ROUTE, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify([
          {
            id: 'listing-001',
            title: '아이폰 14 Pro 256GB',
            price: 1180000,
            description: '좋은 상태입니다',
            address: '서울시 마포구 합정동',
            address_detail: '123번길 45',
            zipcode: '04001',
            seller_id: 'seller-001',
            main_image_url: 'https://example.com/image.jpg',
            sale_state: 'available',
            created_at: '2025-02-18T10:30:00Z',
          },
        ]),
      });
      return;
    }
    await route.fallback();
  });

  // 페이지 로드
  await page.goto('/phone-detail/listing-001');

  // 페이지가 완전히 로드될 때까지 대기 (data-testid)
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 새 창이 열리는 것을 감지
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click(LOCATION_BUTTON_SELECTOR),
  ]);

  // 새 창의 URL이 지도 서비스 URL 형식인지 확인
  const newPageUrl = newPage.url();
  expect(isValidMapUrl(newPageUrl)).toBe(true);

  // 검색어가 URL에 인코딩되어 포함되었는지 확인
  const decodedUrl = decodeURIComponent(newPageUrl);
  expect(decodedUrl).toContain('서울시 마포구 합정동');
  expect(decodedUrl).toContain('123번길 45');
  expect(decodedUrl).toContain('04001');

  await newPage.close();
});

/**
 * 테스트: 거래 지역 정보가 없는 경우 - 경고 메시지 표시
 */
test('거래 지역 정보가 없는 경우 위치 아이콘 클릭 시 경고 메시지 표시 및 지도 창 열지 않기', async ({
  page,
  context,
}) => {
  // Mock 데이터 설정 (거래 지역 정보 없음)
  await page.route(PHONE_DETAIL_ROUTE, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify([
          {
            id: 'listing-002',
            title: '아이폰 14 Pro 256GB',
            price: 1180000,
            description: '좋은 상태입니다',
            address: null,
            address_detail: null,
            zipcode: null,
            seller_id: 'seller-001',
            main_image_url: 'https://example.com/image.jpg',
            sale_state: 'available',
            created_at: '2025-02-18T10:30:00Z',
          },
        ]),
      });
      return;
    }
    await route.fallback();
  });

  // 페이지 로드
  await page.goto('/phone-detail/listing-002');

  // 페이지가 완전히 로드될 때까지 대기 (data-testid)
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 새 창이 열리지 않는지 확인하기 위한 리스너 설정
  let newPageOpened = false;
  context.on('page', () => {
    newPageOpened = true;
  });

  // 위치 버튼 클릭
  await page.click(LOCATION_BUTTON_SELECTOR);

  // 경고 메시지 확인
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  const messageText = await page.textContent('.ant-message-notice-content');
  expect(messageText).toContain('거래 지역 정보가 없습니다.');

  // 새 창이 열리지 않았는지 확인
  await page.waitForTimeout(200);
  expect(newPageOpened).toBe(false);
});

/**
 * 테스트: 빈 문자열인 경우도 거래 지역 정보가 없는 것으로 간주
 */
test('거래 지역 정보가 빈 문자열인 경우 위치 아이콘 클릭 시 경고 메시지 표시', async ({
  page,
  context,
}) => {
  // Mock 데이터 설정 (거래 지역 정보가 빈 문자열)
  await page.route(PHONE_DETAIL_ROUTE, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify([
          {
            id: 'listing-003',
            title: '아이폰 14 Pro 256GB',
            price: 1180000,
            description: '좋은 상태입니다',
            address: '',
            address_detail: '',
            zipcode: '',
            seller_id: 'seller-001',
            main_image_url: 'https://example.com/image.jpg',
            sale_state: 'available',
            created_at: '2025-02-18T10:30:00Z',
          },
        ]),
      });
      return;
    }
    await route.fallback();
  });

  // 페이지 로드
  await page.goto('/phone-detail/listing-003');

  // 페이지가 완전히 로드될 때까지 대기 (data-testid)
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 새 창이 열리지 않는지 확인하기 위한 리스너 설정
  let newPageOpened = false;
  context.on('page', () => {
    newPageOpened = true;
  });

  // 위치 버튼 클릭
  await page.click(LOCATION_BUTTON_SELECTOR);

  // 경고 메시지 확인
  await page.waitForSelector('.ant-message-notice-content', { timeout: 300 });
  const messageText = await page.textContent('.ant-message-notice-content');
  expect(messageText).toContain('거래 지역 정보가 없습니다.');

  // 새 창이 열리지 않았는지 확인
  await page.waitForTimeout(200);
  expect(newPageOpened).toBe(false);
});

/**
 * 테스트: 일부 필드만 있는 경우 - 있는 정보로만 검색
 */
test('일부 거래 지역 정보만 있는 경우 있는 정보로만 지도 검색', async ({
  page,
  context,
}) => {
  // Mock 데이터 설정 (address만 있음)
  await page.route(PHONE_DETAIL_ROUTE, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify([
          {
            id: 'listing-004',
            title: '아이폰 14 Pro 256GB',
            price: 1180000,
            description: '좋은 상태입니다',
            address: '서울시 강남구',
            address_detail: null,
            zipcode: null,
            seller_id: 'seller-001',
            main_image_url: 'https://example.com/image.jpg',
            sale_state: 'available',
            created_at: '2025-02-18T10:30:00Z',
          },
        ]),
      });
      return;
    }
    await route.fallback();
  });

  // 페이지 로드
  await page.goto('/phone-detail/listing-004');

  // 페이지가 완전히 로드될 때까지 대기 (data-testid)
  await page.waitForSelector('[data-testid="phone-detail-body"]');

  // 새 창이 열리는 것을 감지
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click(LOCATION_BUTTON_SELECTOR),
  ]);

  // 새 창의 URL이 지도 서비스 URL 형식인지 확인
  const newPageUrl = newPage.url();
  expect(isValidMapUrl(newPageUrl)).toBe(true);

  // 검색어가 URL에 인코딩되어 포함되었는지 확인
  const decodedUrl = decodeURIComponent(newPageUrl);
  expect(decodedUrl).toContain('서울시 강남구');

  await newPage.close();
});
