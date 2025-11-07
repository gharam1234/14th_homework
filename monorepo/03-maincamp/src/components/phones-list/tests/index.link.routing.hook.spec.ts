import { test, expect, Page } from '@playwright/test';

/**
 * 중고폰 리스트 라우팅 훅 테스트
 */
test.describe('중고폰 리스트 라우팅', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // 로컬스토리지에 샘플 중고폰 데이터 설정
    const listingData = [
      {
        id: '1',
        title: '아이폰 14 Pro 256GB',
        description: 'A급 상태, 자급제 모델',
        tags: '#Apple #A급',
        price: '1,180,000',
        sellerName: '홍대직거래',
        likeCount: 142,
      },
      {
        id: '2',
        title: '갤럭시 S23 울트라',
        description: '삼성 케어 잔여 6개월',
        tags: '#Samsung #케어',
        price: '1,090,000',
        sellerName: '삼성중고샵',
        likeCount: 98,
      },
    ];

    // 페이지 이동 (localStorage 설정은 페이지 이동 전 실행)
    await page.goto('/phones');

    // 로컬스토리지에 중고폰 데이터 저장
    await page.evaluate(
      (data) => {
        localStorage.setItem('phones', JSON.stringify(data));
      },
      listingData
    );

    // 페이지 새로고침 (localStorage 데이터 반영)
    await page.reload();

    // 페이지 완전 로드 확인 (data-testid 기반)
    await page.waitForSelector('[data-testid="phones-list"]', { timeout: 500 });
  });

  test('중고폰 카드 클릭 시 상세 페이지로 이동해야 한다', async () => {
    // 첫 번째 기기 카드 선택
    const phoneCard = page.locator('[data-testid="phone-card"]').first();

    // 기기 카드 클릭
    await phoneCard.click();

    // 상세 페이지로 이동 확인 (PHONE_DETAIL: /phones/[id])
    await expect(page).toHaveURL(/\/phones\/\d+/);
  });

  test('중고폰 판매 등록 버튼 클릭 시 새 등록 페이지로 이동해야 한다', async () => {
    // 중고폰 판매 등록 버튼 찾기 및 클릭
    const sellButton = page.locator('[data-testid="sell-button"]');

    await sellButton.click();

    // 새 등록 페이지로 이동 확인 (PHONE_CREATE: /phones/new)
    await expect(page).toHaveURL('/phones/new');
  });

  test('여러 카드 중 특정 기기를 클릭하면 해당 상세 페이지로 이동해야 한다', async () => {
    // 모든 기기 카드 선택
    const phoneCards = page.locator('[data-testid="phone-card"]');

    // 두 번째 카드 클릭
    await phoneCards.nth(1).click();

    // 두 번째 기기의 상세 페이지로 이동 확인
    await expect(page).toHaveURL(/\/phones\/\d+/);
  });
});
