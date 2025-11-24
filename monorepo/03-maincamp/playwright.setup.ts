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

    // 3. 기본 인증 정보 설정
    await context.addInitScript(() => {
      const testUser = {
        id: '8d159ce6-5a84-46f4-95d7-dd0d7a37b6a9',
        email: 'tester@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      };

      try {
        localStorage.setItem('accessToken', 'test-access-token');
        localStorage.setItem('user', JSON.stringify(testUser));
      } catch (e) {
        console.warn('localStorage setItem failed during setup:', e);
      }
    });

    await use(context);
  },
});

export { expect } from '@playwright/test';
