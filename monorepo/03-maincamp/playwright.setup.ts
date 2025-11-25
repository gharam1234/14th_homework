import { test as base } from '@playwright/test';

/**
 * Playwright 테스트 설정
 * 모든 테스트에서 인증 상태를 사전에 설정합니다.
 */
export const test = base.extend({
  // 각 테스트 컨텍스트에 테스트 우회 플래그 및 인증 정보 설정
  context: async ({ context }, use) => {
    // 1. localStorage 초기화
    await context.addInitScript(() => {
      localStorage.clear();
    });

    // 2. 테스트 환경 플래그 설정
    await context.addInitScript(() => {
      (window as any).__TEST_BYPASS__ = true;
      // 테스트 환경 변수 설정
      process.env.NEXT_PUBLIC_TEST_ENV = 'test';
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? 'fkkztiavgrmmazvdwtdw';
    const supabaseStorageKey = `sb-${projectRef}-auth-token`;

    // 3. 기본 인증 정보 설정
    await context.addInitScript((payload) => {
      const testUser = {
        id: '85f42831-5761-4cc9-8186-987653ef915c',
        email: 'gharanm1234@gmail.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      };

      try {
        localStorage.setItem('accessToken', 'test-access-token');
        localStorage.setItem('user', JSON.stringify(testUser));

        const sessionPayload = {
          currentSession: {
            access_token: 'test-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: 'test-refresh-token',
            user: testUser,
          },
          user: testUser,
        };

        localStorage.setItem(payload.supabaseStorageKey, JSON.stringify(sessionPayload));
        (window as any).__TEST_SUPABASE_USER__ = testUser;
      } catch (e) {
        console.warn('localStorage setItem failed during setup:', e);
      }
    }, { supabaseStorageKey });

    await use(context);
  },
});

export { expect } from '@playwright/test';
