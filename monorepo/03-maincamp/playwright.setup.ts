import { test as base } from '@playwright/test';

/**
 * Playwright 테스트 설정
 * 모든 테스트에서 window.__TEST_BYPASS__를 설정하여 권한 검증을 우회합니다.
 */
export const test = base.extend({
  // 각 테스트 컨텍스트에 테스트 우회 플래그 설정
  context: async ({ context }, use) => {
    // 컨텍스트 생성 후 초기 스크립트 추가
    await context.addInitScript(() => {
      // 테스트 환경에서 권한 검증 우회
      (window as any).__TEST_BYPASS__ = true;
    });

    await use(context);
  },
});

export { expect } from '@playwright/test';
