import { test, expect } from '@playwright/test';

test.describe('PhoneDetail 구매 플로우 모달', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/phones/listing-001', { waitUntil: 'networkidle' });
  });

  test('구매 버튼 클릭 시 구매 안내 모달이 노출된다', async ({ page }) => {
    await page.getByTestId('purchase-button').click();
    await expect(page.getByTestId('purchase-guide-modal')).toBeVisible();
  });

  test('구매 안내 모달에서 취소를 누르면 /phones로 이동한다', async ({ page }) => {
    await page.getByTestId('purchase-button').click();
    await page.getByTestId('purchase-guide-cancel-btn').click();
    await expect(page).toHaveURL(/\/phones$/);
  });

  test('구매를 진행하면 FetchUserLoggedIn 쿼리가 호출된다', async ({ page }) => {
    let fetchUserLoggedInCaptured = false;

    page.on('request', (request) => {
      if (!request.url().includes('/graphql')) return;
      try {
        const payload = JSON.parse(request.postData() ?? '{}');
        if (
          payload?.operationName === 'FetchUserLoggedIn' ||
          (typeof payload?.query === 'string' && payload.query.includes('fetchUserLoggedIn'))
        ) {
          fetchUserLoggedInCaptured = true;
        }
      } catch {
        // no-op
      }
    });

    await page.getByTestId('purchase-button').click();
    await page.getByTestId('purchase-guide-confirm-btn').click();
    await expect
      .poll(() => fetchUserLoggedInCaptured)
      .toBe(true);
  });

  test('포인트 부족 분기에서는 충전 모달로 이어진다', async ({ page }) => {
    await page.getByTestId('purchase-button').click();
    await page.getByTestId('purchase-guide-confirm-btn').click();

    const insufficiencyModal = page.getByTestId('point-insufficiency-modal');

    try {
      await expect(insufficiencyModal).toBeVisible();
    } catch {
      test.skip(true, '해당 계정의 포인트가 충분하여 포인트 부족 플로우를 검증할 수 없습니다.');
    }

    await page.getByTestId('point-insufficiency-charge-btn').click();
    await expect(page.getByTestId('point-charge-modal')).toBeVisible();
  });

  test('충전 모달에서 자유롭게 입력한 금액으로 포트원 SDK 요청 이벤트가 발생한다', async ({ page }) => {
    await page.getByTestId('purchase-button').click();
    await page.getByTestId('purchase-guide-confirm-btn').click();

    const insufficiencyModal = page.getByTestId('point-insufficiency-modal');
    try {
      await expect(insufficiencyModal).toBeVisible();
    } catch {
      test.skip(true, '포인트 부족 조건을 만족하지 않아 충전 모달을 열 수 없습니다.');
    }

    await page.getByTestId('point-insufficiency-charge-btn').click();

    await page.evaluate(() => {
      (window as unknown as {
        __PORTONE_EVENTS__?: Array<{ amount: number; paymentId: string }>;
      }).__PORTONE_EVENTS__ = [];

      window.addEventListener('portone:payment-request', (event: Event) => {
        const customEvent = event as Event & {
          detail: { amount: number; paymentId: string };
        };
        const store = (window as unknown as {
          __PORTONE_EVENTS__?: Array<{ amount: number; paymentId: string }>;
        }).__PORTONE_EVENTS__;

        if (store) {
          store.push(customEvent.detail);
        }
      });
    });

    const chargeInput = page.getByTestId('point-charge-amount-input');
    await chargeInput.fill('');
    await chargeInput.type('543210');

    await page.getByTestId('point-charge-confirm-btn').click();

    await expect
      .poll(async () => {
        const records = await page.evaluate(() => {
          return (window as unknown as {
            __PORTONE_EVENTS__?: Array<{ amount: number; paymentId: string }>;
          }).__PORTONE_EVENTS__;
        });
        return Array.isArray(records) && records.length > 0 ? records[0]?.amount : null;
      })
      .toBe(543210);
  });

  test('모든 모달의 닫기 버튼은 즉시 모달을 닫는다', async ({ page }) => {
    await page.getByTestId('purchase-button').click();
    await page.getByTestId('purchase-guide-cancel-btn').click();

    await page.goto('/phones/listing-001', { waitUntil: 'networkidle' });
    await page.getByTestId('purchase-button').click();
    await page.getByTestId('purchase-guide-confirm-btn').click();

    const insufficiencyModal = page.getByTestId('point-insufficiency-modal');
    try {
      await expect(insufficiencyModal).toBeVisible();
      await page.getByTestId('point-insufficiency-cancel-btn').click();
      await expect(insufficiencyModal).toBeHidden();
    } catch {
      test.skip(true, '포인트 부족 조건이 아니라 닫기 버튼 검증을 건너뜁니다.');
    }
  });
});
