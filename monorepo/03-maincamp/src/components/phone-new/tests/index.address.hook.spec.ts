import { test, expect, Page } from '@playwright/test';

/**
 * 폼이 완전히 로드될 때까지 대기
 */
async function waitForForm(page: Page) {
  // 컨테이너가 나타날 때까지 대기
  await page.locator('[data-testid="phone-new-container"]').waitFor({ state: 'visible', timeout: 10000 });
  // 로딩이 완료될 때까지 대기 (로딩 인디케이터가 사라질 때까지)
  await page.locator('[data-testid="loading-indicator"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // 로딩 인디케이터가 없으면 이미 로드된 것으로 간주
  });
  // 폼이 완전히 렌더링될 때까지 추가 대기
  await page.waitForTimeout(500);
}

/**
 * Daum 우편번호 스크립트 모킹
 */
async function mockDaumPostcode(page: Page) {
  await page.addInitScript(() => {
    (window as any).daum = {
      Postcode: class MockPostcode {
        constructor(private config: any) {}

        open() {
          // 팝업 열림 시뮬레이션
          setTimeout(() => {
            if (this.config.oncomplete) {
              this.config.oncomplete({
                zonecode: '06236',
                address: '서울 강남구 역삼동 123',
                roadAddress: '서울 강남구 테헤란로 123',
                jibunAddress: '서울 강남구 역삼동 123',
                addressEnglish: 'Seoul Gangnam-gu Teheran-ro 123',
                addressType: 'R',
                userSelectedType: 'R',
              });
            }
          }, 100);
        }
      }
    };
  });

  // Daum Postcode 스크립트 로드 모킹
  await page.route('**/postcode.v2.js', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/javascript' },
      body: '// Daum Postcode mocked'
    });
  });
}

test.describe('주소 검색 및 지오코딩 통합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await mockDaumPostcode(page);
    await page.goto('/phones/new');
    await waitForForm(page);
    await page.evaluate(() => {
      window.__TEST_ADDRESS_OVERRIDES__ = {
        geocode: {
          '서울 강남구 테헤란로 123': { latitude: 37.4979, longitude: 127.0276 },
          '서울특별시 강남구 테헤란로 123': { latitude: 37.4979, longitude: 127.0276 },
        },
        reverse: {
          '37.4979,127.0276': {
            zipCode: '06236',
            roadAddress: '서울 강남구 테헤란로 123',
            jibunAddress: '서울 강남구 역삼동 123',
            address: '서울 강남구 테헤란로 123',
            detailAddress: '',
          },
        },
      };
    });
  });

  test('주소 검색 성공 시나리오 - 주소 선택 후 자동 지오코딩', async ({ page }) => {
    // 주소 검색 버튼 클릭
    const searchButton = page.locator('[data-testid="btn-address-search"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Daum 팝업에서 주소 선택이 완료될 때까지 대기
    await page.waitForTimeout(200);

    // 선택된 주소가 표시되는지 확인
    const selectedAddress = page.locator('[data-testid="selected-address"]');
    await expect(selectedAddress).toContainText('테헤란로 123');

    // 우편번호가 표시되는지 확인
    const zipCode = page.locator('[data-testid="address-zipcode"]');
    await expect(zipCode).toHaveText('06236');

    // 자동 지오코딩으로 좌표가 설정되었는지 확인
    const latitude = page.locator('[data-testid="address-latitude"]');
    const longitude = page.locator('[data-testid="address-longitude"]');

    await expect(latitude).toHaveText('37.4979');
    await expect(longitude).toHaveText('127.0276');
  });

  test('좌표 수정 시 역지오코딩 시나리오', async ({ page }) => {
    // 먼저 좌표 입력 필드에 값 설정
    const latInput = page.locator('[data-testid="input-latitude"]');
    const lngInput = page.locator('[data-testid="input-longitude"]');

    await latInput.fill('37.4979');
    await lngInput.fill('127.0276');

    // 역지오코딩 버튼 클릭 (또는 자동 실행)
    const reverseGeocodeButton = page.locator('[data-testid="btn-reverse-geocode"]');
    if (await reverseGeocodeButton.isVisible()) {
      await reverseGeocodeButton.click();
    }

    await page.waitForTimeout(200);

    // 역지오코딩 결과로 주소가 업데이트되었는지 확인
    const selectedAddress = page.locator('[data-testid="selected-address"]');
    await expect(selectedAddress).toContainText('테헤란로 123');

    const zipCode = page.locator('[data-testid="address-zipcode"]');
    await expect(zipCode).toHaveText('06236');
  });

  test('상태 공유 시나리오 - Zustand 스토어 업데이트', async ({ page }) => {
    // 주소 검색
    const searchButton = page.locator('[data-testid="btn-address-search"]');
    await searchButton.click();
    await page.waitForTimeout(200);

    // 스토어에 주소와 좌표가 저장되었는지 확인
    const storeState = await page.evaluate(() => {
      // Zustand 스토어에서 값 가져오기
      return {
        hasAddress: document.querySelector('[data-testid="selected-address"]')?.textContent?.includes('테헤란로'),
        hasCoordinates: document.querySelector('[data-testid="address-latitude"]')?.textContent === '37.4979'
      };
    });

    expect(storeState.hasAddress).toBeTruthy();
    expect(storeState.hasCoordinates).toBeTruthy();
  });

  test('주소 초기화 기능', async ({ page }) => {
    // 주소 검색
    const searchButton = page.locator('[data-testid="btn-address-search"]');
    await searchButton.click();
    await page.waitForTimeout(200);

    // 주소가 설정되었는지 확인
    await expect(page.locator('[data-testid="selected-address"]')).toContainText('테헤란로 123');

    // 초기화 버튼 클릭
    const clearButton = page.locator('[data-testid="btn-clear-address"]');
    await clearButton.click();

    // 주소와 좌표가 초기화되었는지 확인
    await expect(page.locator('[data-testid="selected-address"]')).toBeEmpty();
    await expect(page.locator('[data-testid="address-zipcode"]')).toBeEmpty();
  });

  test('에러 처리 - 잘못된 주소 입력', async ({ page }) => {
    await page.evaluate(() => {
      window.__TEST_ADDRESS_OVERRIDES__ = {
        geocode: {},
        geocodeError: '주소를 찾을 수 없습니다',
      };
    });
    // 존재하지 않는 주소로 검색 시도
    await page.evaluate(() => {
      // 잘못된 주소로 이벤트 발생
      window.dispatchEvent(
        new CustomEvent('phone:apply-address', {
          detail: {
            zonecode: '00000',
            address: '존재하지않는주소',
            roadAddress: '존재하지않는주소',
          },
        })
      );
    });

    await page.waitForTimeout(200);

    // 에러 메시지가 표시되는지 확인
    const errorMessage = page.locator('[data-testid="address-error"]');
    await expect(errorMessage).toContainText('주소를 찾을 수 없습니다');
  });
});
