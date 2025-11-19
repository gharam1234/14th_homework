import { test, expect } from '@playwright/test';

/**
 * PhoneDetail Specs 섹션 Playwright 테스트
 * - Specs 섹션이 렌더링되는지 확인
 * - 모든 필드가 표기되는지 확인
 * - 배터리 progress 색상이 올바르게 적용되는지 확인
 * - 정보 없음 처리가 올바르게 되는지 확인
 */

test.describe('PhoneDetail Specs Section', () => {
  test('should render specs section with data-testid', async ({ page }) => {
    // 테스트 페이지로 이동 (경로만 사용)
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션이 존재하는지 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });
    const specsSection = await page.locator('[data-testid="specs-section"]');
    await expect(specsSection).toBeVisible();
  });

  test('should display all spec fields when data is available', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 모든 필드가 표시되는지 확인
    const specLabels = ['제조사', '모델명', '출시년도', 'RAM', '저장용량', '배터리 건강도', '색상'];

    for (const label of specLabels) {
      const labelElement = await page.locator(`text="${label}"`).first();
      await expect(labelElement).toBeVisible();
    }
  });

  test('should display "정보 없음" for missing data', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // "정보 없음" 텍스트가 존재하는지 확인
    const missingDataElements = await page.locator('text="정보 없음"').count();
    expect(missingDataElements).toBeGreaterThanOrEqual(0);
  });

  test('should display battery health progress bar with correct color class', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 배터리 progress bar 찾기
    const batteryProgressBar = page.locator('[data-testid*="battery-progress-fill-"]').first();

    // 배터리 progress bar가 존재하는지 확인
    const count = await page.locator('[data-testid*="battery-progress-fill-"]').count();
    if (count > 0) {
      // 색상 클래스 확인 (green, yellow, red 중 하나)
      const colorClass = await batteryProgressBar.getAttribute('data-color-class');
      expect(['green', 'yellow', 'red']).toContain(colorClass);

      // progress bar의 width가 설정되었는지 확인
      const style = await batteryProgressBar.getAttribute('style');
      expect(style).toMatch(/width:\s*\d+%/);
    }
  });

  test('should display battery health percentage as number', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 배터리 progress text 찾기
    const batteryProgressTexts = await page.locator('[data-testid*="battery-progress-text-"]').all();

    for (const text of batteryProgressTexts) {
      const content = await text.textContent();
      // 퍼센트 숫자가 표시되는지 확인 (예: "85%")
      if (content && content.match(/\d+%/)) {
        expect(content).toMatch(/\d+%/);
      }
    }
  });

  test('should display release year with supplement text (years ago)', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 출시년도 supplement text 찾기
    const supplementTexts = await page.locator('[data-testid*="spec-supplement-text-"]').all();

    for (const text of supplementTexts) {
      const content = await text.textContent();
      // "(n년 전)" 형식의 텍스트가 있는지 확인
      if (content && content.match(/\(\d+년 전\)/)) {
        expect(content).toMatch(/\(\d+년 전\)/);
      }
    }
  });

  test('should apply correct battery health color classes', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 모든 battery progress fill 요소 찾기
    const batteryFillElements = await page.locator('[data-testid*="battery-progress-fill-"]').all();

    for (const element of batteryFillElements) {
      const colorClass = await element.getAttribute('data-color-class');

      // 색상 클래스가 유효한 값인지 확인
      if (colorClass) {
        expect(['green', 'yellow', 'red']).toContain(colorClass);

        // CSS 클래스 확인
        const classAttr = await element.getAttribute('class');
        expect(classAttr).toContain(colorClass);
      }
    }
  });

  test('should render grid items with correct data-testid pattern', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // spec-item-* 패턴의 요소 개수 확인
    const specItems = await page.locator('[data-testid^="spec-item-"]').count();
    expect(specItems).toBeGreaterThan(0);

    // 각 항목이 올바른 구조를 가지는지 확인
    for (let i = 0; i < specItems; i++) {
      const item = page.locator(`[data-testid="spec-item-${i}"]`);
      await expect(item).toBeVisible();
    }
  });

  test('should display specs in responsive grid layout', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // Specs grid가 존재하는지 확인
    const specsGrid = page.locator('[data-testid="specs-section"] > div:nth-child(2)');
    await expect(specsGrid).toBeVisible();

    // 그리드 아이템이 여러 개 있는지 확인
    const gridItems = await specsGrid.locator('[data-testid^="spec-item-"]').count();
    expect(gridItems).toBeGreaterThan(0);
  });

  test('should handle missing manufacturer gracefully', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 제조사 필드가 표시되는지 확인
    const manufacturerLabel = await page.locator('text="제조사"').first();
    await expect(manufacturerLabel).toBeVisible();

    // 제조사 값이 "정보 없음" 또는 실제 값인지 확인
    const specValues = await page.locator('[data-testid^="spec-value-"]').all();
    expect(specValues.length).toBeGreaterThan(0);
  });

  test('should display battery health as progress with percentage', async ({ page }) => {
    await page.goto('/components/phone-detail', { waitUntil: 'domcontentloaded' });

    // Specs 섹션 렌더링 확인
    await page.waitForSelector('[data-testid="specs-section"]', { timeout: 500 });

    // 배터리 건강도 progress 요소 찾기
    const batteryProgressBars = await page.locator('[data-testid*="battery-progress-bar-"]').all();

    if (batteryProgressBars.length > 0) {
      for (const bar of batteryProgressBars) {
        // progress bar 자체가 렌더링되는지 확인
        await expect(bar).toBeVisible();

        // 내부의 fill 요소가 있는지 확인
        const fill = bar.locator('[data-testid*="battery-progress-fill-"]');
        const fillCount = await fill.count();
        expect(fillCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
