import { test, expect, BrowserContext } from '@playwright/test';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getPath } from '@/commons/constants/url';

/**
 * PhoneDetail 데이터 조회 기능 테스트
 * @description 프롬프트 요구사항에 맞춰 로딩/에러/재시도 및 데이터 바인딩을 검증
 */

const PHONE_DETAIL_LOADING_SELECTOR = '[data-testid="phone-detail-loading"]';
const PHONE_DETAIL_ERROR_SELECTOR = '[data-testid="phone-detail-error"]';
const PHONE_DETAIL_RETRY_SELECTOR = '[data-testid="phone-detail-retry"]';
const PHONE_DETAIL_BODY_SELECTOR = '[data-testid="phone-detail-body"]';
const PHONE_DETAIL_TITLE_SELECTOR = '[data-testid="phone-detail-title"]';
const PHONE_SUMMARY_SELECTOR = '[data-testid="phone-summary"]';
const WAIT_TIMEOUT = 450;

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
  title: 'Test Phone for E2E Testing',
  price: 500000,
  summary: 'Test summary',
  description: 'Test description for E2E testing',
  model_name: 'Test Model',
  storage_capacity: '128GB',
  device_condition: 'excellent',
  address: 'Test Address',
  address_detail: 'Suite 100',
  zipcode: '12345',
  latitude: 37.5665,
  longitude: 126.978,
  main_image_url: 'https://example.com/test.jpg',
  seller_id: 'test-seller-id',
  sale_state: 'available',
  sale_type: 'immediate',
  available_from: '2025-01-01T00:00:00Z',
  available_until: '2025-12-31T00:00:00Z',
  tags: ['test', 'phone'],
  categories: ['smartphone', 'android'],
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

const describeFetchDetail = isSupabaseConfigured ? test.describe.serial : test.describe.skip;

describeFetchDetail('PhoneDetail 데이터 조회', () => {
  test.beforeEach(async ({ context }) => {
    await mockLogin(context);
  });

  test('정상적인 phoneId로 상세 정보 조회 성공 시 모든 필드가 표시됨', async ({ page }) => {
    const { id, record } = await createTestPhone();

    try {
      await page.goto(getPath('PHONE_DETAIL', { id }));
      await page.waitForSelector(PHONE_DETAIL_LOADING_SELECTOR, { timeout: WAIT_TIMEOUT, state: 'hidden' }).catch(() => undefined);
      await page.waitForSelector(PHONE_DETAIL_BODY_SELECTOR, { timeout: WAIT_TIMEOUT });

      await expect(page.locator(PHONE_DETAIL_TITLE_SELECTOR)).toHaveText(record.title);
      await expect(page.locator(PHONE_SUMMARY_SELECTOR)).toHaveText(record.summary);
      await expect(page.locator(PHONE_DETAIL_BODY_SELECTOR)).toBeVisible();
    } finally {
      await cleanupTestPhone(id);
    }
  });

  test('존재하지 않는 phoneId로 조회 시 에러 메시지 표시됨', async ({ page }) => {
    const nonExistentId = randomUUID();

    await page.goto(getPath('PHONE_DETAIL', { id: nonExistentId }));
    await page.waitForSelector(PHONE_DETAIL_ERROR_SELECTOR, { timeout: WAIT_TIMEOUT });

    await expect(page.locator(PHONE_DETAIL_ERROR_SELECTOR)).toBeVisible();
    await expect(page.locator(PHONE_DETAIL_RETRY_SELECTOR)).toBeVisible();
  });

  test('조회 실패 후 재시도 버튼 클릭 시 다시 조회 실행됨', async ({ page }) => {
    const transientId = randomUUID();

    await page.goto(getPath('PHONE_DETAIL', { id: transientId }));
    await page.waitForSelector(PHONE_DETAIL_ERROR_SELECTOR, { timeout: WAIT_TIMEOUT });

    const { record } = await createTestPhone({ id: transientId });

    try {
      await page.click(PHONE_DETAIL_RETRY_SELECTOR);
      await page.waitForSelector(PHONE_DETAIL_BODY_SELECTOR, { timeout: WAIT_TIMEOUT });
      await expect(page.locator(PHONE_DETAIL_TITLE_SELECTOR)).toHaveText(record.title);
    } finally {
      await cleanupTestPhone(transientId);
    }
  });

  test('모든 필수 필드가 올바르게 바인딩됨', async ({ page }) => {
    const overrides: Partial<InsertPhonePayload> = {
      title: 'Galaxy S Test Edition',
      summary: '완벽한 상태의 테스트 기기',
      model_name: 'Galaxy S Test',
      storage_capacity: '256GB',
      device_condition: 'like-new',
      address: 'Seoul Test Address',
      tags: ['galaxy', 'flagship'],
      categories: ['smartphone', 'samsung'],
      available_from: '2025-03-01T00:00:00Z',
      available_until: '2025-04-01T00:00:00Z',
    };
    const { id, record } = await createTestPhone(overrides);

    try {
      await page.goto(getPath('PHONE_DETAIL', { id }));
      await page.waitForSelector(PHONE_DETAIL_BODY_SELECTOR, { timeout: WAIT_TIMEOUT });

      await expect(page.locator('[data-testid="phone-price"]')).toHaveText(String(record.price));
      await expect(page.locator('[data-testid="phone-model-name"]')).toHaveText(record.model_name);
      await expect(page.locator('[data-testid="phone-storage"]')).toHaveText(record.storage_capacity);
      await expect(page.locator('[data-testid="phone-condition"]')).toHaveText(record.device_condition);
      await expect(page.locator('[data-testid="phone-address"]')).toHaveText(record.address);
      await expect(page.locator('[data-testid="phone-main-image-url"]')).toHaveText(record.main_image_url);
      await expect(page.locator('[data-testid="phone-seller-id"]')).toHaveText(record.seller_id);
      await expect(page.locator('[data-testid="phone-sale-state"]')).toHaveText(record.sale_state);
      await expect(page.locator('[data-testid="phone-sale-type"]')).toHaveText(record.sale_type);
      await expect(page.locator('[data-testid="phone-available-from"]')).toHaveText(record.available_from);
      await expect(page.locator('[data-testid="phone-available-until"]')).toHaveText(record.available_until);
      await expect(page.locator('[data-testid="phone-tags"]')).toHaveText((record.tags || []).join(','));
      await expect(page.locator('[data-testid="phone-categories"]')).toHaveText((record.categories || []).join(','));
      await expect(page.locator('[data-testid="phone-created-at"]')).not.toHaveText('');

      const mainImageSrc = await page.getAttribute('[data-testid="phone-main-image"]', 'src');
      expect(mainImageSrc).toBe(record.main_image_url);
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
