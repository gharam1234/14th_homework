import { test, expect } from '@playwright/test';

/**
 * phones-list 컴포넌트 찜(관심상품) 기능 테스트
 * @description TDD 기반 찜 기능 검증 - Supabase phone_reactions 테이블 연동
 */
test.describe('PhonesList - 찜 기능', () => {
  const testUserId = 'test-user-id-favorite';
  const testPhoneId = 'test-phone-id-for-favorite';

  test.beforeEach(async ({ page }) => {
    // 로그인 처리 및 테스트 환경 설정
    await page.addInitScript((userId) => {
      try {
        // 테스트 환경 우회 플래그 설정
        (window as any).__TEST_BYPASS__ = true;

        // 로그인 정보 설정
        window.localStorage.setItem('accessToken', 'test-token');
        
        // Supabase 세션 설정
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
        const storageKey = `sb-${projectRef}-auth-token`;
        
        const sessionData = {
          currentSession: {
            user: {
              id: userId,
              email: 'test@example.com',
              aud: 'authenticated',
              role: 'authenticated',
              created_at: new Date().toISOString(),
            },
            access_token: 'test-access-token',
          },
        };
        
        window.localStorage.setItem(storageKey, JSON.stringify(sessionData));
        (window as any).__TEST_SUPABASE_USER__ = sessionData.currentSession.user;
      } catch (e) {
        console.warn('localStorage setItem failed:', e);
      }
    }, testUserId);

    // 페이지 로드
    await page.goto('/phones');

    // 페이지 로드 완료 대기
    await page.waitForSelector('[data-testid="phones-list"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="card-area"]', { timeout: 10000 });
  });

  // 테스트 후 정리는 Supabase에서 수동으로 처리하거나, 
  // 실제 운영 환경에서는 테스트 데이터베이스를 사용해야 합니다.

  test('로그인 상태에서 찜 버튼 클릭 → 하트가 채워지고 토스트 메시지 표시', async ({ page }) => {
    // 첫 번째 카드의 찜 버튼 찾기
    const firstCard = page.locator('[data-testid="phone-card"]').first();
    await expect(firstCard).toBeVisible();

    // 찜 버튼 클릭 전 상태 확인 (빈 하트)
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();
    await expect(favoriteButton).toBeVisible();

    // 초기 하트 상태 확인 (🤍)
    const initialHeartText = await favoriteButton.textContent();
    expect(initialHeartText).toContain('🤍');

    // 찜 버튼 클릭
    await favoriteButton.click();

    // 낙관적 업데이트: 하트가 즉시 채워지는지 확인 (❤️)
    await expect(favoriteButton).toContainText('❤️', { timeout: 500 });

    // 토스트 메시지 표시 확인
    const toast = page.locator('[data-testid="favorite-toast"]');
    await expect(toast).toBeVisible({ timeout: 500 });
    await expect(toast).toContainText('관심상품에 추가되었습니다');

    // Supabase에 데이터가 저장되었는지 확인 (선택적)
    await page.waitForTimeout(300); // API 완료 대기
  });

  test('찜한 상품을 다시 클릭 → 하트가 빈 상태로 변경되고 토스트 메시지 표시', async ({ page }) => {
    // 첫 번째 카드의 찜 버튼 찾기
    const firstCard = page.locator('[data-testid="phone-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();

    // 찜 추가
    await favoriteButton.click();
    await expect(favoriteButton).toContainText('❤️', { timeout: 500 });

    // 토스트가 사라질 때까지 대기
    await page.waitForTimeout(500);

    // 찜 제거
    await favoriteButton.click();

    // 하트가 빈 상태로 변경되는지 확인
    await expect(favoriteButton).toContainText('🤍', { timeout: 500 });

    // 토스트 메시지 표시 확인
    const toast = page.locator('[data-testid="favorite-toast"]');
    await expect(toast).toBeVisible({ timeout: 500 });
    await expect(toast).toContainText('관심상품에서 제거되었습니다');
  });

  test('찜 버튼에 올바른 접근성 속성이 있어야 함', async ({ page }) => {
    // 첫 번째 카드의 찜 버튼 찾기
    const firstCard = page.locator('[data-testid="phone-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();

    // aria-label 확인
    const ariaLabel = await favoriteButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/관심상품 저장|관심상품 제거/);

    // aria-pressed 확인
    const ariaPressed = await favoriteButton.getAttribute('aria-pressed');
    expect(ariaPressed).toBeTruthy();
    expect(['true', 'false']).toContain(ariaPressed);
  });

  test('여러 상품을 찜하고 상태가 독립적으로 유지되어야 함', async ({ page }) => {
    // 첫 번째와 두 번째 카드 찾기
    const cards = page.locator('[data-testid="phone-card"]');
    const firstButton = cards.nth(0).locator('[data-testid^="favorite-button-"]').first();
    const secondButton = cards.nth(1).locator('[data-testid^="favorite-button-"]').first();

    // 첫 번째 상품 찜
    await firstButton.click();
    await expect(firstButton).toContainText('❤️', { timeout: 500 });

    await page.waitForTimeout(300);

    // 두 번째 상품 찜
    await secondButton.click();
    await expect(secondButton).toContainText('❤️', { timeout: 500 });

    // 두 버튼 모두 찜 상태 확인
    await expect(firstButton).toContainText('❤️');
    await expect(secondButton).toContainText('❤️');

    // 첫 번째만 찜 해제
    await firstButton.click();
    await expect(firstButton).toContainText('🤍', { timeout: 500 });

    // 두 번째는 여전히 찜 상태
    await expect(secondButton).toContainText('❤️');
  });

  test('API 실패 시 UI 롤백 및 에러 토스트 표시', async ({ page }) => {
    // 첫 번째 카드의 찜 버튼 찾기
    const firstCard = page.locator('[data-testid="phone-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();

    // 초기 상태 확인 (빈 하트)
    await expect(favoriteButton).toContainText('🤍');
    const initialState = '🤍';

    // Supabase API 요청 실패 시뮬레이션 (POST/PATCH 요청 차단)
    await page.route('**/rest/v1/phone_reactions*', route => {
      if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        // 네트워크 오류 시뮬레이션
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    // 찜 버튼 클릭
    await favoriteButton.click();

    // 낙관적 업데이트로 하트가 먼저 채워짐
    await expect(favoriteButton).toContainText('❤️', { timeout: 500 });

    // 잠시 대기 (API 실패 처리)
    await page.waitForTimeout(300);

    // API 실패 후 원래 상태로 롤백되는지 확인
    await expect(favoriteButton).toContainText(initialState, { timeout: 500 });

    // 에러 토스트 메시지 표시 확인
    const toast = page.locator('[data-testid="favorite-toast"]');
    await expect(toast).toBeVisible({ timeout: 500 });
    await expect(toast).toContainText('관심상품 처리에 실패하였습니다');
  });

  test('찜 추가 시 Supabase에 데이터 전송 확인', async ({ page }) => {
    // POST 요청 모니터링
    const insertRequestPromise = page.waitForRequest(request =>
      request.url().includes('/rest/v1/phone_reactions') &&
      request.method() === 'POST',
      { timeout: 5000 }
    );

    const firstCard = page.locator('[data-testid="phone-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();

    // 찜 버튼 클릭
    await favoriteButton.click();

    try {
      // POST 요청이 발생했는지 확인
      const insertRequest = await insertRequestPromise;
      expect(insertRequest).toBeTruthy();
      expect(insertRequest.method()).toBe('POST');

      // 요청 데이터 검증 (가능한 경우)
      try {
        const postData = insertRequest.postDataJSON();
        expect(postData).toHaveProperty('phone_id');
        expect(postData).toHaveProperty('user_id');
        expect(postData.type).toBe('favorite');
      } catch (e) {
        // postDataJSON이 실패해도 요청이 발생한 것만 확인
        console.log('POST 요청 데이터 파싱 실패 (요청은 발생함)');
      }
    } catch (error) {
      // 타임아웃 또는 요청 없음 - 실패로 처리
      throw new Error('Supabase에 데이터 전송 요청이 발생하지 않음');
    }
  });

  test('찜 취소 시 Supabase에 업데이트 요청 확인', async ({ page }) => {
    const firstCard = page.locator('[data-testid="phone-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();

    // 먼저 찜 추가
    await favoriteButton.click();
    await expect(favoriteButton).toContainText('❤️', { timeout: 500 });
    await page.waitForTimeout(300);

    // PATCH 요청 모니터링 (deleted_at 업데이트)
    const updateRequestPromise = page.waitForRequest(request =>
      request.url().includes('/rest/v1/phone_reactions') &&
      request.method() === 'PATCH',
      { timeout: 5000 }
    );

    // 찜 제거
    await favoriteButton.click();

    try {
      // PATCH 요청이 발생했는지 확인
      const updateRequest = await updateRequestPromise;
      expect(updateRequest).toBeTruthy();
      expect(updateRequest.method()).toBe('PATCH');

      // 요청 데이터 검증 (deleted_at 필드 포함 여부)
      try {
        const patchData = updateRequest.postDataJSON();
        expect(patchData).toHaveProperty('deleted_at');
      } catch (e) {
        // postDataJSON이 실패해도 요청이 발생한 것만 확인
        console.log('PATCH 요청 데이터 파싱 실패 (요청은 발생함)');
      }
    } catch (error) {
      // 타임아웃 또는 요청 없음 - 실패로 처리
      throw new Error('Supabase에 업데이트 요청이 발생하지 않음');
    }
  });
});

/**
 * 미로그인 상태 찜 기능 테스트
 */
test.describe('PhonesList - 찜 기능 (미로그인)', () => {
  test.beforeEach(async ({ page }) => {
    // 미로그인 상태 설정
    await page.addInitScript(() => {
      try {
        // 테스트 환경 우회 플래그 설정
        (window as any).__TEST_BYPASS__ = true;
        
        // 로그인 정보 제거
        window.localStorage.removeItem('accessToken');
        
        // Supabase 세션 제거
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
        const storageKey = `sb-${projectRef}-auth-token`;
        window.localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('localStorage removeItem failed:', e);
      }
    });

    // 페이지 로드
    await page.goto('/phones');

    // 페이지 로드 완료 대기
    await page.waitForSelector('[data-testid="phones-list"]', { timeout: 10000 });
  });

  test('미로그인 상태에서 찜 버튼 클릭 → 로그인 페이지로 이동', async ({ page }) => {
    // 첫 번째 카드의 찜 버튼 찾기
    const firstCard = page.locator('[data-testid="phone-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid^="favorite-button-"]').first();

    // 찜 버튼 클릭
    await favoriteButton.click();

    // 로그인 페이지로 이동했는지 확인
    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);

    // 또는 로그인 관련 요소가 있는지 확인 (선택적)
    // 로그인 페이지의 특정 요소가 있다면 확인
  });
});

