import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export default defineConfig({
  // 테스트 타임아웃 설정 (ms)
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // 글로벌 타임아웃 설정
  globalTimeout: 600000,

  // 공통 테스트 설정
  use: {
    // 기본 URL (개발 서버)
    baseURL: `http://localhost:${port}`,
    // 인증 상태 저장 (localStorage 등)
    storageState: 'playwright.storage.json',
    // 테스트 환경에서 localhost SSL 무시
    ignoreHTTPSErrors: true,
    // 실패 시 스크린샷 저장
    screenshot: 'only-on-failure',
    // 트레이싱 (첫 재시도에만)
    trace: 'on-first-retry',
  },

  // Setup 파일 - 모든 테스트 전에 실행할 파일
  globalSetup: undefined,
  globalTeardown: undefined,

  // 브라우저 프로젝트 설정
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // 개발 서버 설정 (테스트 실행 시 자동으로 Next.js 서버 시작)
  webServer: process.env.SKIP_WEB_SERVER ? undefined : {
    command: `PORT=${port} npm run dev`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_TEST_ENV: 'test',
    },
    // 서버 시작 타임아웃
    timeout: 120000,
  },

  // 재시도 설정
  retries: process.env.CI ? 2 : 0,

  // 병렬 실행 설정
  fullyParallel: true,
});
