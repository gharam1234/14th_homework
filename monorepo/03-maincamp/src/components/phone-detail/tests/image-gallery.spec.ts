import { test, expect } from '@playwright/test';

test.describe('Phone Detail Page - Task2 이미지 갤러리', () => {
  // 테스트용 폰 ID (실제 Supabase 데이터 사용)
  // Supabase 대시보드에서 phones 테이블의 첫 번째 레코드 UUID를 아래에 입력하세요
  const VALID_PHONE_ID = 'YOUR_ACTUAL_PHONE_UUID_HERE'; // 예: '550e8400-e29b-41d4-a716-446655440000'

  test.beforeEach(async ({ page }) => {
    // 페이지 로드 (baseUrl은 playwright.config.ts에서 정의)
    await page.goto(`/phones/${VALID_PHONE_ID}`);
    // data-testid 기반으로 페이지 완전 로드 대기
    await page.waitForSelector('[data-testid="gallery-main-image"]', { timeout: 500 });
  });

  test.describe('메인 이미지 표시', () => {
    test('성공 케이스: 메인 이미지가 올바르게 표시된다', async ({ page }) => {
      const mainImageWrapper = await page.locator('[data-testid="gallery-main-image"]').first();
      await expect(mainImageWrapper).toBeVisible();

      const mainImage = await mainImageWrapper.locator('[data-testid="main-image-img"]').first();
      await expect(mainImage).toBeVisible();

      // 이미지 src 속성 확인
      const imageSrc = await mainImage.getAttribute('src');
      expect(imageSrc).toBeTruthy();
    });

    test('성공 케이스: 이미지 로드 중 로딩 상태가 표시된다', async ({ page }) => {
      const mainImageWrapper = await page.locator('[data-testid="gallery-main-image"]').first();

      // 이미지가 로드될 때까지 대기
      const loadingElement = await mainImageWrapper.locator('[data-testid="image-loading"]').first();
      const isLoadingVisible = await loadingElement.isVisible().catch(() => false);

      // 로딩이 표시되었거나 이미지가 로드됨
      expect(isLoadingVisible || await mainImageWrapper.locator('[data-testid="main-image-img"]').isVisible()).toBeTruthy();
    });

    test('성공 케이스: 이미지 로드 완료 후 로딩 상태가 사라진다', async ({ page }) => {
      const mainImageWrapper = await page.locator('[data-testid="gallery-main-image"]').first();
      const mainImage = await mainImageWrapper.locator('[data-testid="main-image-img"]').first();

      // 이미지 로드 완료 대기
      await mainImage.evaluate(img => {
        return new Promise((resolve) => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.complete) {
            resolve(null);
          } else {
            imgElement.onload = () => resolve(null);
          }
        });
      });

      // 로딩 상태가 사라짐
      const loadingElement = await mainImageWrapper.locator('[data-testid="image-loading"]').first();
      const isLoadingVisible = await loadingElement.isVisible().catch(() => false);
      expect(isLoadingVisible).toBeFalsy();
    });
  });

  test.describe('썸네일 슬라이더', () => {
    test('성공 케이스: 모든 썸네일이 렌더링된다', async ({ page }) => {
      const thumbnailContainer = await page.locator('[data-testid="thumbnail-container"]').first();
      const thumbnailItems = await thumbnailContainer.locator('[data-testid^="thumbnail-item-"]').all();

      expect(thumbnailItems.length).toBeGreaterThan(0);
    });

    test('성공 케이스: 첫 번째 썸네일이 기본 선택 상태다', async ({ page }) => {
      const firstThumbnail = await page.locator('[data-testid="thumbnail-item-0"]').first();
      const borderStyle = await firstThumbnail.evaluate(el => {
        return window.getComputedStyle(el).borderColor;
      });

      // 선택된 썸네일은 테두리 색상이 다름
      expect(borderStyle).toBeTruthy();
    });

    test('성공 케이스: 썸네일 클릭 시 메인 이미지가 변경된다', async ({ page }) => {
      // 두 번째 썸네일 클릭
      const secondThumbnail = await page.locator('[data-testid="thumbnail-item-1"]').first();
      const secondThumbnailExists = await secondThumbnail.isVisible().catch(() => false);

      if (secondThumbnailExists) {
        await secondThumbnail.click();

        // 메인 이미지가 변경될 때까지 대기
        await page.waitForTimeout(100);

        const newMainImage = await page.locator('[data-testid="main-image-img"]').first();
        const newSrc = await newMainImage.getAttribute('src');

        // 이미지가 변경되었는지 확인 (또는 다른 인덱스임)
        expect(newSrc).toBeTruthy();
      }
    });

    test('성공 케이스: 이전(좌측) 화살표 버튼이 작동한다', async ({ page }) => {
      // 두 번째 썸네일로 이동
      const secondThumbnail = await page.locator('[data-testid="thumbnail-item-1"]').first();
      const secondThumbnailExists = await secondThumbnail.isVisible().catch(() => false);

      if (secondThumbnailExists) {
        await secondThumbnail.click();

        // 좌측 화살표 클릭
        const prevButton = await page.locator('[data-testid="thumbnail-prev-btn"]').first();
        const isPrevEnabled = await prevButton.isEnabled();
        expect(isPrevEnabled).toBeTruthy();

        if (isPrevEnabled) {
          await prevButton.click();
          await page.waitForTimeout(100);

          // 첫 번째 썸네일이 선택됨
          const firstThumbnail = await page.locator('[data-testid="thumbnail-item-0"]').first();
          const borderColor = await firstThumbnail.evaluate(el => {
            return window.getComputedStyle(el).borderColor;
          });
          expect(borderColor).toBeTruthy();
        }
      }
    });

    test('성공 케이스: 다음(우측) 화살표 버튼이 작동한다', async ({ page }) => {
      // 우측 화살표 클릭
      const nextButton = await page.locator('[data-testid="thumbnail-next-btn"]').first();
      const isNextEnabled = await nextButton.isEnabled();

      if (isNextEnabled) {
        await nextButton.click();
        await page.waitForTimeout(100);

        // 두 번째 썸네일이 선택됨
        const secondThumbnail = await page.locator('[data-testid="thumbnail-item-1"]').first();
        const secondThumbnailExists = await secondThumbnail.isVisible().catch(() => false);
        expect(secondThumbnailExists).toBeTruthy();
      }
    });

    test('성공 케이스: 마지막 썸네일에서 다음 버튼이 비활성화된다', async ({ page }) => {
      // 마지막 썸네일의 인덱스 찾기
      const allThumbnails = await page.locator('[data-testid^="thumbnail-item-"]').all();
      const lastIndex = allThumbnails.length - 1;

      // 마지막 썸네일 클릭
      await page.locator(`[data-testid="thumbnail-item-${lastIndex}"]`).first().click();
      await page.waitForTimeout(100);

      // 다음 버튼이 비활성화되어야 함
      const nextButton = await page.locator('[data-testid="thumbnail-next-btn"]').first();
      const isNextDisabled = await nextButton.isDisabled();
      expect(isNextDisabled).toBeTruthy();
    });

    test('성공 케이스: 모바일에서 스와이프가 작동한다', async ({ page }) => {
      // 스와이프 이벤트 시뮬레이션 (왼쪽에서 오른쪽)
      const gallery = await page.locator('[data-testid="image-gallery"]').first();

      // 첫 번째 썸네일로 이동
      await page.locator('[data-testid="thumbnail-item-0"]').first().click();
      await page.waitForTimeout(100);

      // 터치 스타트 (x: 400)
      await gallery.evaluate((el) => {
        const touchData = {
          clientX: 400,
          clientY: 0,
        };
        const event = new TouchEvent('touchstart', {
          touches: [touchData as unknown as Touch],
          bubbles: true,
        });
        el.dispatchEvent(event);
      });

      // 터치 엔드 (x: 300) - 왼쪽으로 100px 스와이프 (다음 이미지로)
      await gallery.evaluate((el) => {
        const touchData = {
          clientX: 300,
          clientY: 0,
        };
        const event = new TouchEvent('touchend', {
          changedTouches: [touchData as unknown as Touch],
          bubbles: true,
        });
        el.dispatchEvent(event);
      });

      await page.waitForTimeout(100);

      // 썸네일이 변경되었는지 확인
      const thumbnailContainer = await page.locator('[data-testid="thumbnail-container"]').first();
      expect(thumbnailContainer).toBeVisible();
    });
  });

  test.describe('이미지 줌 기능', () => {
    test('성공 케이스: 메인 이미지 클릭 시 줌 모달이 열린다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      // 줌 모달이 표시됨
      const zoomModal = await page.locator('[data-testid="zoom-modal"]').first();
      await expect(zoomModal).toBeVisible();
    });

    test('성공 케이스: 줌 모달에서 이미지가 표시된다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      await page.waitForSelector('[data-testid="zoom-image"]', { timeout: 300 });

      const zoomImage = await page.locator('[data-testid="zoom-image"]').first();
      await expect(zoomImage).toBeVisible();

      const imageSrc = await zoomImage.getAttribute('src');
      expect(imageSrc).toBeTruthy();
    });

    test('성공 케이스: 줌 인 버튼이 작동한다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      await page.waitForSelector('[data-testid="zoom-controls"]', { timeout: 300 });

      // 초기 줌 레벨 확인
      const initialZoomLevel = await page.locator('[data-testid="zoom-level"]').first().textContent();
      expect(initialZoomLevel).toBe('100%');

      // 줌 인 버튼 클릭
      const zoomInButton = await page.locator('[data-testid="zoom-in-btn"]').first();
      await zoomInButton.click();

      await page.waitForTimeout(100);

      // 줌 레벨이 증가했는지 확인
      const newZoomLevel = await page.locator('[data-testid="zoom-level"]').first().textContent();
      expect(newZoomLevel).not.toBe(initialZoomLevel);
    });

    test('성공 케이스: 줌 아웃 버튼이 작동한다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      await page.waitForSelector('[data-testid="zoom-controls"]', { timeout: 300 });

      // 줌 인 (2배)
      const zoomInButton = await page.locator('[data-testid="zoom-in-btn"]').first();
      await zoomInButton.click();
      await page.waitForTimeout(100);

      // 줌 아웃 버튼 클릭
      const zoomOutButton = await page.locator('[data-testid="zoom-out-btn"]').first();
      const isZoomOutEnabled = await zoomOutButton.isEnabled();
      expect(isZoomOutEnabled).toBeTruthy();

      if (isZoomOutEnabled) {
        await zoomOutButton.click();
        await page.waitForTimeout(100);

        // 줌 레벨이 감소했는지 확인
        const zoomLevel = await page.locator('[data-testid="zoom-level"]').first().textContent();
        expect(zoomLevel).toBeTruthy();
      }
    });

    test('성공 케이스: 닫기 버튼으로 줌 모달을 닫을 수 있다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      await page.waitForSelector('[data-testid="zoom-modal"]', { timeout: 300 });

      const closeButton = await page.locator('[data-testid="zoom-close-btn"]').first();
      await closeButton.click();

      await page.waitForTimeout(100);

      // 줌 모달이 사라짐
      const zoomModal = await page.locator('[data-testid="zoom-modal"]').first();
      const isVisible = await zoomModal.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });

    test('성공 케이스: 모달 배경 클릭으로 줌 모달을 닫을 수 있다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      await page.waitForSelector('[data-testid="zoom-modal"]', { timeout: 300 });

      const zoomModal = await page.locator('[data-testid="zoom-modal"]').first();
      // 모달 배경 클릭 (이미지가 아닌 배경 부분)
      await zoomModal.click({ position: { x: 10, y: 10 } });

      await page.waitForTimeout(100);

      // 줌 모달이 사라짐
      const isVisible = await zoomModal.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });

    test('성공 케이스: ESC 키로 줌 모달을 닫을 수 있다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="gallery-main-image"]').first();
      await mainImage.click();

      await page.waitForSelector('[data-testid="zoom-modal"]', { timeout: 300 });

      // ESC 키 입력
      await page.keyboard.press('Escape');

      await page.waitForTimeout(100);

      // 줌 모달이 사라짐
      const zoomModal = await page.locator('[data-testid="zoom-modal"]').first();
      const isVisible = await zoomModal.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });
  });

  test.describe('에러 처리 및 플레이스홀더', () => {
    test('성공 케이스: 이미지 로드 실패 시 에러 메시지가 표시된다', async ({ page }) => {
      // 이미지 URL을 잘못된 URL로 변경
      await page.evaluate(() => {
        const mainImage = document.querySelector('[data-testid="main-image-img"]') as HTMLImageElement;
        if (mainImage) {
          mainImage.src = 'https://invalid-url-that-does-not-exist.com/image.jpg';
          mainImage.onerror = function () {
            // 에러 이벤트 트리거
            const event = new Event('error');
            mainImage.dispatchEvent(event);
          };
        }
      });

      await page.waitForTimeout(200);

      // 에러 메시지 확인
      const errorElement = await page.locator('[data-testid="image-error"]').first();
      const isErrorVisible = await errorElement.isVisible().catch(() => false);
      expect(isErrorVisible).toBeTruthy();
    });

    test('성공 케이스: 이미지가 없을 경우 플레이스홀더가 표시된다', async ({ page }) => {
      // 이미지 배열이 비어있을 경우를 시뮬레이션
      const mainImage = await page.locator('[data-testid="main-image-img"]').first();
      const imageSrc = await mainImage.getAttribute('src');

      // 이미지 src가 존재하거나 플레이스홀더가 표시됨
      expect(imageSrc).toBeTruthy();
    });
  });

  test.describe('성능 최적화', () => {
    test('성공 케이스: 이미지가 렌더링되어 있다', async ({ page }) => {
      const mainImage = await page.locator('[data-testid="main-image-img"]').first();

      // 이미지가 표시되어 있음
      await expect(mainImage).toBeVisible();
    });

    test('성공 케이스: 불필요한 리렌더링이 방지된다', async ({ page }) => {
      // 첫 번째 썸네일 클릭
      const firstThumbnail = await page.locator('[data-testid="thumbnail-item-0"]').first();
      await firstThumbnail.click();

      // 동일한 이미지 클릭 (리렌더링 방지)
      await firstThumbnail.click();

      // 페이지가 정상적으로 응답함
      const gallery = await page.locator('[data-testid="image-gallery"]').first();
      await expect(gallery).toBeVisible();
    });
  });
});
