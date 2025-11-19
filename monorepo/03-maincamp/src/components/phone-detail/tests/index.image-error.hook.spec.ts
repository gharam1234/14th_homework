import { test, expect, BrowserContext, ConsoleMessage } from '@playwright/test';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getPath } from '@/commons/constants/url';

/**
 * PhoneDetail 이미지 에러 처리 테스트
 * @description 이미지 로드 실패 시 기본 이미지로 대체 및 에러 로그 검증
 */

const PHONE_DETAIL_BODY_SELECTOR = '[data-testid="phone-detail-body"]';
const WAIT_TIMEOUT = 450;
const DEFAULT_IMAGE_PATH = '/images/phone_sample.png';

type SaleState = 'available' | 'reserved' | 'sold';
type SaleType = 'immediate' | 'scheduled';

interface InsertPhonePayload {
  id?: string;
  title: string;
  price: number;
  summary: string;
  description: string;
  model_name: string;
  storage_capacity: string;
  device_condition: string;
  address: string;
  address_detail: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  main_image_url: string;
  seller_id: string;
  sale_state: SaleState;
  sale_type: SaleType;
  available_from: string;
  available_until: string;
  tags: string[];
  categories: string[];
  currency: string;
  status: string;
}

type InsertedPhoneRecord = InsertPhonePayload & {
  id: string;
  created_at: string;
  updated_at?: string;
};

const BASE_TEST_PHONE: InsertPhonePayload = {
  title: 'Image Test Phone',
  price: 500000,
  summary: 'Test summary for image error',
  description: 'Test description',
  model_name: 'Test Model',
  storage_capacity: '128GB',
  device_condition: 'excellent',
  address: 'Test Address',
  address_detail: 'Suite 100',
  zipcode: '12345',
  latitude: 37.5665,
  longitude: 126.978,
  main_image_url: 'https://example.com/valid-image.jpg',
  seller_id: 'test-seller-id',
  sale_state: 'available',
  sale_type: 'immediate',
  available_from: '2025-01-01T00:00:00Z',
  available_until: '2025-12-31T00:00:00Z',
  tags: ['test'],
  categories: ['smartphone'],
  currency: 'KRW',
  status: 'published',
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

/**
 * 로그인 상태 설정 (accessToken 설정)
 */
async function mockLogin(context: BrowserContext) {
  await context.addInitScript(() => {
    window.localStorage.setItem('accessToken', 'test-access-token');
  });
}

const describeImageError = isSupabaseConfigured ? test.describe.serial : test.describe.skip;

describeImageError('PhoneDetail 이미지 에러 처리', () => {
  test.beforeEach(async ({ context }) => {
    await mockLogin(context);
  });

  test('정상 이미지 로드 시 기본 이미지로 대체되지 않음', async ({ page }) => {
    const validImageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop';
    const { id } = await createTestPhone({ main_image_url: validImageUrl });

    try {
      await page.goto(getPath('PHONE_DETAIL', { id }));
      await page.waitForSelector(PHONE_DETAIL_BODY_SELECTOR, { timeout: WAIT_TIMEOUT });

      const mainImageSrc = await page.getAttribute('[data-testid="gallery-image-0"]', 'src');
      expect(mainImageSrc).toBe(validImageUrl);
      expect(mainImageSrc).not.toBe(DEFAULT_IMAGE_PATH);
    } finally {
      await cleanupTestPhone(id);
    }
  });

  test('잘못된 이미지 URL이 기본 이미지로 대체됨', async ({ page }) => {
    const invalidImageUrl = 'https://invalid-domain-12345.com/nonexistent-image.jpg';
    const { id } = await createTestPhone({ main_image_url: invalidImageUrl });

    const consoleMessages: ConsoleMessage[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg);
      }
    });

    try {
      await page.goto(getPath('PHONE_DETAIL', { id }));
      await page.waitForSelector(PHONE_DETAIL_BODY_SELECTOR, { timeout: WAIT_TIMEOUT });

      // 이미지 로드 에러가 발생할 때까지 대기
      await page.waitForFunction(
        (defaultPath) => {
          const img = document.querySelector('[data-testid="gallery-image-0"]') as HTMLImageElement;
          return img && img.src.includes(defaultPath);
        },
        DEFAULT_IMAGE_PATH,
        { timeout: WAIT_TIMEOUT }
      );

      const mainImageSrc = await page.getAttribute('[data-testid="gallery-image-0"]', 'src');
      expect(mainImageSrc).toContain(DEFAULT_IMAGE_PATH);

      // 콘솔 에러 로그 확인
      const errorLogs = consoleMessages.filter((msg) =>
        msg.text().includes('이미지 로드 실패')
      );
      expect(errorLogs.length).toBeGreaterThan(0);
    } finally {
      await cleanupTestPhone(id);
    }
  });

  test('기본 이미지 로드 실패 시 무한 루프 방지', async ({ page }) => {
    const invalidImageUrl = 'https://invalid-domain-99999.com/bad-image.png';
    const { id } = await createTestPhone({ main_image_url: invalidImageUrl });

    const consoleMessages: ConsoleMessage[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg);
      }
    });

    try {
      await page.goto(getPath('PHONE_DETAIL', { id }));
      await page.waitForSelector(PHONE_DETAIL_BODY_SELECTOR, { timeout: WAIT_TIMEOUT });

      // 이미지가 기본 이미지로 대체될 때까지 대기
      await page.waitForFunction(
        (defaultPath) => {
          const img = document.querySelector('[data-testid="gallery-image-0"]') as HTMLImageElement;
          return img && img.src.includes(defaultPath);
        },
        DEFAULT_IMAGE_PATH,
        { timeout: WAIT_TIMEOUT }
      );

      // 기본 이미지로 대체 완료 후, src가 더 이상 변경되지 않는지 확인
      const finalSrc = await page.getAttribute('[data-testid="gallery-image-0"]', 'src');
      expect(finalSrc).toContain(DEFAULT_IMAGE_PATH);

      // 에러 로그가 무한 반복되지 않았는지 확인 (최대 2번까지 허용)
      const errorLogs = consoleMessages.filter((msg) =>
        msg.text().includes('이미지 로드 실패')
      );
      expect(errorLogs.length).toBeLessThanOrEqual(2);
    } finally {
      await cleanupTestPhone(id);
    }
  });
});

async function createTestPhone(overrides: Partial<InsertPhonePayload> = {}) {
  const payload: InsertPhonePayload = {
    ...BASE_TEST_PHONE,
    ...overrides,
  };

  if (!supabaseClient) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const insertPayload = { ...payload } as InsertPhonePayload;
  if (!insertPayload.id) {
    delete insertPayload.id;
  }

  const { data, error } = await supabaseClient
    .from('phones')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('테스트용 중고폰 데이터를 생성하지 못했습니다.');
  }

  const result = data as InsertedPhoneRecord;

  const normalizedResult: InsertedPhoneRecord = {
    ...result,
    tags: Array.isArray(result.tags) ? result.tags : [],
    categories: Array.isArray(result.categories) ? result.categories : [],
  };

  return {
    id: normalizedResult.id,
    record: normalizedResult,
  };
}

async function cleanupTestPhone(phoneId: string): Promise<void> {
  if (!supabaseClient) {
    return;
  }

  await supabaseClient.from('phones').delete().eq('id', phoneId);
}
