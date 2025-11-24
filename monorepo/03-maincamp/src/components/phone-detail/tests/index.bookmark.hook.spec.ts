import { test, expect } from '@playwright/test';
import { getPath } from '@/commons/constants/url';

/**
 * 북마크(즐겨찾기) 기능 테스트
 * 
 * @description
 * - Supabase phone_reactions 테이블 연동 테스트
 * - 로그인 검증 시나리오
 * - 즐겨찾기 토글 시나리오
 * - 에러 처리 시나리오
 */

test.describe('PhoneDetail - Bookmark Hook', () => {
  // 테스트용 전화기 ID (실제 Supabase에 존재하는 ID)
  let testPhoneId: string;

  test.beforeEach(async ({ page }) => {
    // 페이지 로드 대기 (networkidle 사용 금지)
    await page.goto('/');
    await page.waitForSelector('[data-testid="phones-list-container"]');
    
    // 첫 번째 상품 카드의 ID 가져오기
    const firstCard = page.locator('[data-testid^="phone-card-"]').first();
    const cardTestId = await firstCard.getAttribute('data-testid');
    testPhoneId = cardTestId?.replace('phone-card-', '') || '';
    
    // 상품 상세 페이지로 이동
    await firstCard.click();
    await page.waitForSelector('[data-testid="phone-detail-container"]');
  });

  test.describe('1. 로그인 검증 시나리오', () => {
    test('1-1) 로그인되지 않은 경우 - 경고 토스트가 표시된다', async ({ page }) => {
      // localStorage에서 인증 토큰 제거
      await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.removeItem('accessToken');
      });

      // 북마크 버튼 클릭
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button');
      await bookmarkButton.click();

      // 경고 토스트 메시지 확인
      const toast = page.locator('[data-testid="toast-message"]');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('로그인이 필요합니다.');
      
      // 토스트 타입 확인 (warning)
      const toastClass = await toast.getAttribute('class');
      expect(toastClass).toContain('warning');
    });

    test('1-2) 로그인되지 않은 경우 - 즐겨찾기 작업이 중단된다', async ({ page }) => {
      // localStorage에서 인증 토큰 제거
      await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.removeItem('accessToken');
      });

      // 초기 북마크 상태 확인
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button svg path');
      const initialFill = await bookmarkButton.getAttribute('fill');

      // 북마크 버튼 클릭
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // 북마크 상태가 변경되지 않았는지 확인
      const currentFill = await bookmarkButton.getAttribute('fill');
      expect(currentFill).toBe(initialFill);
    });
  });

  test.describe('2. 즐겨찾기 토글 시나리오', () => {
    test.beforeEach(async ({ page }) => {
      // 테스트용 사용자 로그인 세션 설정
      await page.evaluate(() => {
        // Supabase URL을 window 객체에서 가져오기
        const supabaseUrl = (window as any).location.origin.includes('localhost')
          ? 'https://qbxzzpkpnpthfyjyrkux.supabase.co'
          : (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_URL;
        
        const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'qbxzzpkpnpthfyjyrkux';

        const storageKey = `sb-${projectRef}-auth-token`;
        const mockSession = {
          currentSession: {
            user: {
              id: 'test-user-id-' + Date.now(),
              email: 'test@example.com',
            },
            access_token: 'test-access-token',
          },
        };
        
        localStorage.setItem(storageKey, JSON.stringify(mockSession));
        localStorage.setItem('accessToken', 'test-access-token');

        // 테스트 환경 지원
        (window as any).__TEST_SUPABASE_USER__ = mockSession.currentSession.user;
      });
    });

    test('2-1) 즐겨찾기 추가 성공 시 - 성공 토스트가 표시된다', async ({ page }) => {
      // 초기 상태 확인 (비활성화 상태로 시작)
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button svg path');
      const initialFill = await bookmarkButton.getAttribute('fill');
      
      // 비활성화 상태인 경우에만 테스트 진행
      if (initialFill === '#ff6b6b' || initialFill === 'rgb(255, 107, 107)') {
        // 먼저 비활성화
        await page.locator('[data-testid="bookmark-badge"] button').click();
        await page.waitForTimeout(200);
      }

      // 북마크 추가 클릭
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // 성공 토스트 확인
      const toast = page.locator('[data-testid="toast-message"]');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('관심상품에 추가되었습니다.');
      
      // 토스트 타입 확인 (success)
      const toastClass = await toast.getAttribute('class');
      expect(toastClass).toContain('success');
    });

    test('2-2) 즐겨찾기 추가 성공 시 - UI가 활성화 상태로 변경된다', async ({ page }) => {
      // 초기 상태 확인
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button svg path');
      const initialFill = await bookmarkButton.getAttribute('fill');
      
      // 비활성화 상태인 경우에만 테스트 진행
      if (initialFill === '#ff6b6b' || initialFill === 'rgb(255, 107, 107)') {
        await page.locator('[data-testid="bookmark-badge"] button').click();
        // 토스트가 나타났다가 사라질 때까지 대기
        const toast = page.locator('[data-testid="toast-message"]');
        await toast.waitFor({ state: 'hidden' });
      }

      // 북마크 추가
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // UI 상태 확인 (하트 아이콘이 채워진 상태)
      const newFill = await bookmarkButton.getAttribute('fill');
      expect(newFill).toBe('#ff6b6b');
    });

    test('2-3) 즐겨찾기 제거 성공 시 - 성공 토스트가 표시된다', async ({ page }) => {
      // 먼저 북마크 추가
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button svg path');
      const initialFill = await bookmarkButton.getAttribute('fill');
      
      if (initialFill !== '#ff6b6b' && initialFill !== 'rgb(255, 107, 107)') {
        await page.locator('[data-testid="bookmark-badge"] button').click();
        // 토스트가 나타났다가 사라질 때까지 대기
        const toast = page.locator('[data-testid="toast-message"]');
        await toast.waitFor({ state: 'visible' });
        await toast.waitFor({ state: 'hidden' });
      }

      // 북마크 제거
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // 성공 토스트 확인
      const toast = page.locator('[data-testid="toast-message"]');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('관심상품에서 제거되었습니다.');
      
      // 토스트 타입 확인 (success)
      const toastClass = await toast.getAttribute('class');
      expect(toastClass).toContain('success');
    });

    test('2-4) 즐겨찾기 제거 성공 시 - UI가 비활성화 상태로 변경된다', async ({ page }) => {
      // 먼저 북마크 추가
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button svg path');
      const initialFill = await bookmarkButton.getAttribute('fill');
      
      if (initialFill !== '#ff6b6b' && initialFill !== 'rgb(255, 107, 107)') {
        await page.locator('[data-testid="bookmark-badge"] button').click();
        // 토스트가 나타났다가 사라질 때까지 대기
        const toast = page.locator('[data-testid="toast-message"]');
        await toast.waitFor({ state: 'visible' });
        await toast.waitFor({ state: 'hidden' });
      }

      // 북마크 제거
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // UI 상태 확인 (하트 아이콘이 빈 상태)
      const newFill = await bookmarkButton.getAttribute('fill');
      expect(newFill).not.toBe('#ff6b6b');
      expect(newFill).not.toBe('rgb(255, 107, 107)');
    });
  });

  test.describe('3. 에러 처리', () => {
    test('3-1) Supabase 연동 실패 시 - 에러 토스트가 표시된다', async ({ page }) => {
      // 테스트용 사용자 로그인
      await page.evaluate(() => {
        const supabaseUrl = (window as any).location.origin.includes('localhost')
          ? 'https://qbxzzpkpnpthfyjyrkux.supabase.co'
          : (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_URL;
        
        const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'qbxzzpkpnpthfyjyrkux';

        const storageKey = `sb-${projectRef}-auth-token`;
        const mockSession = {
          currentSession: {
            user: {
              id: 'invalid-user-id',
              email: 'invalid@example.com',
            },
            access_token: 'invalid-token',
          },
        };
        
        localStorage.setItem(storageKey, JSON.stringify(mockSession));
        (window as any).__TEST_SUPABASE_USER__ = mockSession.currentSession.user;
      });

      // API 요청 가로채기 (에러 응답 반환)
      await page.route('**/rest/v1/phone_reactions*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      // 북마크 버튼 클릭
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // 에러 토스트 확인
      const toast = page.locator('[data-testid="toast-message"]');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('작업에 실패했습니다. 다시 시도해주세요.');
      
      // 토스트 타입 확인 (error)
      const toastClass = await toast.getAttribute('class');
      expect(toastClass).toContain('error');
    });

    test('3-2) 에러 발생 시 - UI가 이전 상태로 롤백된다', async ({ page }) => {
      // 테스트용 사용자 로그인
      await page.evaluate(() => {
        const supabaseUrl = (window as any).location.origin.includes('localhost')
          ? 'https://qbxzzpkpnpthfyjyrkux.supabase.co'
          : (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_URL;
        
        const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'qbxzzpkpnpthfyjyrkux';

        const storageKey = `sb-${projectRef}-auth-token`;
        const mockSession = {
          currentSession: {
            user: {
              id: 'invalid-user-id',
              email: 'invalid@example.com',
            },
            access_token: 'invalid-token',
          },
        };
        
        localStorage.setItem(storageKey, JSON.stringify(mockSession));
        (window as any).__TEST_SUPABASE_USER__ = mockSession.currentSession.user;
      });

      // 초기 상태 저장
      const bookmarkButton = page.locator('[data-testid="bookmark-badge"] button svg path');
      const initialFill = await bookmarkButton.getAttribute('fill');

      // API 요청 가로채기 (에러 응답 반환)
      await page.route('**/rest/v1/phone_reactions*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      // 북마크 버튼 클릭
      await page.locator('[data-testid="bookmark-badge"] button').click();

      // 에러 토스트가 나타날 때까지 대기
      const toast = page.locator('[data-testid="toast-message"]');
      await toast.waitFor({ state: 'visible' });

      // UI가 원래 상태로 롤백되었는지 확인
      const currentFill = await bookmarkButton.getAttribute('fill');
      expect(currentFill).toBe(initialFill);
    });
  });
});
