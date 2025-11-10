import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PLACEHOLDER_IMAGE, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../hooks/index.gallery.hook';

const PHONE_IDS = {
  DEFAULT: 'with-images-phone',
  PLACEHOLDER: 'placeholder-phone',
} as const;

type PhoneFixture = {
  id: string;
  model_name: string;
  title: string;
  description: string;
  hashtags: string[];
  condition: '미개봉' | '새것' | '중고';
  price: number;
  original_price: number | null;
  main_image_url: string | null;
  images_urls: string[];
  battery_health: number | null;
  seller_id: string;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  sellers: {
    id: string;
    nickname: string;
    location: string | null;
    profile_image_url: string | null;
  } | null;
};

const createPhoneFixture = (id: string, overrides: Partial<PhoneFixture> = {}): PhoneFixture => ({
  id,
  model_name: '테스트 모델',
  title: '테스트 타이틀',
  description: '테스트용 기기입니다.',
  hashtags: ['#테스트', '#이미지갤러리'],
  condition: '중고',
  price: 550_000,
  original_price: 640_000,
  main_image_url: 'https://picsum.photos/seed/main-image/640/480',
  images_urls: [
    'https://picsum.photos/seed/thumb-1/640/480',
    'https://picsum.photos/seed/thumb-2/640/480',
    'https://picsum.photos/seed/thumb-3/640/480',
  ],
  battery_health: 90,
  seller_id: 'seller-001',
  bookmark_count: 12,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  sellers: {
    id: 'seller-001',
    nickname: '테스트 판매자',
    location: '서울',
    profile_image_url: null,
  },
  ...overrides,
});

const PHONE_FIXTURES: Record<string, PhoneFixture> = {
  [PHONE_IDS.DEFAULT]: createPhoneFixture(PHONE_IDS.DEFAULT),
  [PHONE_IDS.PLACEHOLDER]: createPhoneFixture(PHONE_IDS.PLACEHOLDER, {
    main_image_url: null,
    images_urls: [],
  }),
};

const registerPhoneDetailMock = async (page: Page) => {
  await page.route('**/rest/v1/phones*', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 200, body: '' });
      return;
    }

    const requestUrl = new URL(route.request().url());
    const idFilter = requestUrl.searchParams.get('id');
    const normalizedId = idFilter?.replace('eq.', '').replace(/"/g, '') || PHONE_IDS.DEFAULT;
    const payload = PHONE_FIXTURES[normalizedId] ?? PHONE_FIXTURES[PHONE_IDS.DEFAULT];

    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify(payload),
    });
  });
};

const waitForGallery = async (page: Page) => {
  await page.waitForSelector('[data-testid="gallery-main-image"]', { timeout: 500 });
};

const totalThumbnails = PHONE_FIXTURES[PHONE_IDS.DEFAULT].images_urls.length + 1;

const dispatchSwipe = async (page: Page, distance: number) => {
  const gallery = page.locator('[data-testid="image-gallery"]');
  await gallery.evaluate((element, swipeDistance) => {
    const createTouchEvent = (type: 'touchstart' | 'touchend', clientX: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      const touchData = [{ clientX, clientY: 0 }];
      if (type === 'touchstart') {
        Object.defineProperty(event, 'touches', { value: touchData, configurable: true });
      }
      Object.defineProperty(event, 'changedTouches', { value: touchData, configurable: true });
      return event;
    };

    element.dispatchEvent(createTouchEvent('touchstart', 200));
    element.dispatchEvent(createTouchEvent('touchend', 200 - swipeDistance));
  }, distance);
};

test.describe('Phone Detail 이미지 갤러리 - 기본 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await registerPhoneDetailMock(page);
    await page.goto(`/phones/${PHONE_IDS.DEFAULT}`);
    await waitForGallery(page);
  });

  test('썸네일 클릭 시 메인 이미지가 변경된다', async ({ page }) => {
    const expectedSrc = PHONE_FIXTURES[PHONE_IDS.DEFAULT].images_urls[0];
    await page.locator('[data-testid="thumbnail-item-1"]').click();

    const mainImage = page.locator('[data-testid="main-image-img"]');
    await expect(mainImage).toHaveAttribute('src', expectedSrc);
  });

  test('좌우 화살표 버튼이 경계에서 비활성화된다', async ({ page }) => {
    const prevButton = page.locator('[data-testid="thumbnail-prev-btn"]');
    await expect(prevButton).toBeDisabled();

    const lastIndex = totalThumbnails - 1;
    await page.locator(`[data-testid="thumbnail-item-${lastIndex}"]`).click();

    const nextButton = page.locator('[data-testid="thumbnail-next-btn"]');
    await expect(nextButton).toBeDisabled();
  });

  test('모바일 스와이프로 이미지를 변경할 수 있다', async ({ page }) => {
    await dispatchSwipe(page, 80);
    const secondThumbnail = page.locator('[data-testid="thumbnail-item-1"]');
    await expect(secondThumbnail).toHaveAttribute('aria-selected', 'true');
  });

  test('줌 모달을 열고 ESC 키로 닫을 수 있다', async ({ page }) => {
    await page.locator('[data-testid="gallery-main-image"]').click();
    const zoomModal = page.locator('[data-testid="zoom-modal"]');
    await expect(zoomModal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(zoomModal).toHaveCount(0);
  });

  test('줌 모달 배경 클릭으로 닫을 수 있다', async ({ page }) => {
    await page.locator('[data-testid="gallery-main-image"]').click();
    const zoomModal = page.locator('[data-testid="zoom-modal"]');
    await expect(zoomModal).toBeVisible();

    await zoomModal.click({ position: { x: 10, y: 10 } });
    await expect(zoomModal).toHaveCount(0);
  });

  test('줌 인/아웃 버튼이 제한 조건을 따른다', async ({ page }) => {
    await page.locator('[data-testid="gallery-main-image"]').click();
    await page.waitForSelector('[data-testid="zoom-controls"]', { timeout: 500 });

    const zoomInButton = page.locator('[data-testid="zoom-in-btn"]');
    const zoomOutButton = page.locator('[data-testid="zoom-out-btn"]');
    const zoomLevelLabel = page.locator('[data-testid="zoom-level"]');

    await expect(zoomOutButton).toBeDisabled();
    const stepsToMax = Math.ceil((ZOOM_MAX - ZOOM_MIN) / ZOOM_STEP);
    for (let i = 0; i < stepsToMax; i += 1) {
      await zoomInButton.click();
    }

    await expect(zoomInButton).toBeDisabled();
    await expect(zoomOutButton).toBeEnabled();
    await expect(zoomLevelLabel).toHaveText(`${Math.round(ZOOM_MAX * 100)}%`);
  });

  test('이미지 로드 실패 시 에러 메시지를 표시한다', async ({ page }) => {
    await page.evaluate(() => {
      const mainImage = document.querySelector('[data-testid="main-image-img"]') as HTMLImageElement | null;
      if (mainImage) {
        mainImage.src = 'https://invalid-domain.example.invalid/image.png';
        mainImage.dispatchEvent(new Event('error'));
      }
    });

    const errorMessage = page.locator('[data-testid="image-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('이미지를 불러올 수 없습니다.');
  });
});

test('이미지가 없으면 플레이스홀더를 메인 이미지로 노출한다', async ({ page }) => {
  await registerPhoneDetailMock(page);
  await page.goto(`/phones/${PHONE_IDS.PLACEHOLDER}`);
  await waitForGallery(page);

  const mainImage = page.locator('[data-testid="main-image-img"]');
  await expect(mainImage).toHaveAttribute('src', PLACEHOLDER_IMAGE);
});
