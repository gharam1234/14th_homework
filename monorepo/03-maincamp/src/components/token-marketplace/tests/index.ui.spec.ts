import { test, expect } from "@playwright/test";

/**
 * 토큰 마켓플레이스 컴포넌트 UI 테스트
 * 주요 요소들이 올바르게 렌더링되는지 확인합니다.
 */
test.describe("TokenMarketplace Component", () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 페이지 이동
    await page.goto("http://localhost:3000/tokens");
  });

  test("컴포넌트가 렌더링되어야 함", async ({ page }) => {
    const component = page.locator("[data-testid='token-marketplace']");
    await expect(component).toBeVisible();
  });

  test("제목이 올바르게 표시되어야 함", async ({ page }) => {
    const title = page.locator("[data-testid='title']");
    await expect(title).toBeVisible();
    await expect(title).toContainText("여기에서만 거래할 수 있는 AI 토큰");
  });

  test("탭 섹션이 렌더링되어야 함", async ({ page }) => {
    const tabSection = page.locator("[data-testid='tab-section']");
    await expect(tabSection).toBeVisible();

    const sellingTab = page.locator("[data-testid='tab-selling']");
    const completedTab = page.locator("[data-testid='tab-completed']");

    await expect(sellingTab).toBeVisible();
    await expect(completedTab).toBeVisible();
  });

  test("탭 클릭 시 활성 상태가 변경되어야 함", async ({ page }) => {
    const completedTab = page.locator("[data-testid='tab-completed']");

    // 초기 상태 확인
    let sellingTab = page.locator("[data-testid='tab-selling']");
    await expect(sellingTab).toHaveClass(/tabActive/);

    // 거래완료 탭 클릭
    await completedTab.click();

    // 활성 상태 변경 확인
    completedTab = page.locator("[data-testid='tab-completed']");
    await expect(completedTab).toHaveClass(/tabActive/);

    sellingTab = page.locator("[data-testid='tab-selling']");
    await expect(sellingTab).not.toHaveClass(/tabActive/);
  });

  test("검색 섹션이 렌더링되어야 함", async ({ page }) => {
    const searchSection = page.locator("[data-testid='search-section']");
    await expect(searchSection).toBeVisible();

    const datepicker = page.locator("[data-testid='datepicker']");
    const searchBar = page.locator("[data-testid='search-bar']");
    const searchButton = page.locator("[data-testid='search-button']");
    const sellButton = page.locator("[data-testid='sell-button']");

    await expect(datepicker).toBeVisible();
    await expect(searchBar).toBeVisible();
    await expect(searchButton).toBeVisible();
    await expect(sellButton).toBeVisible();
  });

  test("필터 섹션에 9개의 필터 아이콘이 있어야 함", async ({ page }) => {
    const filterSection = page.locator("[data-testid='filter-section']");
    const filterItems = page.locator("[data-testid^='filter-']");

    await expect(filterSection).toBeVisible();
    await expect(filterItems).toHaveCount(9);
  });

  test("각 필터 아이콘이 올바르게 렌더링되어야 함", async ({ page }) => {
    const filters = [
      "claude",
      "cursor",
      "windsurf",
      "codex",
      "chatgpt",
      "github-copilot",
      "perplexity",
      "v0",
      "etc",
    ];

    for (const filter of filters) {
      const filterItem = page.locator(`[data-testid='filter-${filter}']`);
      await expect(filterItem).toBeVisible();
    }
  });

  test("카드 영역에 8개의 카드가 있어야 함", async ({ page }) => {
    const cardArea = page.locator("[data-testid='card-area']");
    const cards = page.locator("[data-testid='token-card']");

    await expect(cardArea).toBeVisible();
    await expect(cards).toHaveCount(8);
  });

  test("각 카드가 올바른 정보를 표시해야 함", async ({ page }) => {
    const firstCard = page.locator("[data-testid='token-card']").first();
    const bookmark = firstCard.locator("[data-testid='bookmark']");

    await expect(firstCard).toBeVisible();
    await expect(bookmark).toBeVisible();
  });

  test("검색 버튼이 클릭 가능해야 함", async ({ page }) => {
    const searchButton = page.locator("[data-testid='search-button']");
    await expect(searchButton).toBeEnabled();
  });

  test("토큰 판매 등록 버튼이 클릭 가능해야 함", async ({ page }) => {
    const sellButton = page.locator("[data-testid='sell-button']");
    await expect(sellButton).toBeEnabled();
  });

  test("페이지 레이아웃이 모바일에서도 올바르게 표시되어야 함", async ({
    page,
  }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    const component = page.locator("[data-testid='token-marketplace']");
    await expect(component).toBeVisible();

    // 카드 영역이 여전히 표시되는지 확인
    const cardArea = page.locator("[data-testid='card-area']");
    await expect(cardArea).toBeVisible();
  });

  test("스크롤 가능한 필터가 렌더링되어야 함", async ({ page }) => {
    const filterSection = page.locator("[data-testid='filter-section']");
    await expect(filterSection).toBeVisible();

    // 필터 항목들이 모두 보이는지 확인
    const filterItems = page.locator("[data-testid^='filter-']");
    const count = await filterItems.count();
    expect(count).toBe(9);
  });
});
