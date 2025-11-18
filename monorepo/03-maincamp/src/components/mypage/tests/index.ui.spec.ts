import { test, expect } from "@playwright/test";

/**
 * 토큰 지갑 컴포넌트 UI 테스트
 */
test.describe("TokenWallet Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/mypage");
  });

  test("컴포넌트가 렌더링되어야 함", async ({ page }) => {
    const component = page.locator("[data-testid='mypage']");
    await expect(component).toBeVisible();
  });

  test("페이지 제목이 올바르게 표시되어야 함", async ({ page }) => {
    const title = page.locator("[data-testid='page-title']");
    await expect(title).toBeVisible();
    await expect(title).toContainText("토큰 지갑");
  });

  test("사용자 정보 섹션이 렌더링되어야 함", async ({ page }) => {
    const userInfo = page.locator("[data-testid='user-info-section']");
    await expect(userInfo).toBeVisible();

    const profileName = page.locator("[data-testid='profile-name']");
    await expect(profileName).toContainText("사용자");

    const pointsValue = page.locator("[data-testid='points-value']");
    await expect(pointsValue).toBeVisible();
  });

  test("사용자 프로필이 올바르게 표시되어야 함", async ({ page }) => {
    const profileImage = page.locator("[data-testid='profile-image']");
    await expect(profileImage).toBeVisible();

    const profile = page.locator("[data-testid='profile']");
    await expect(profile).toBeVisible();
  });

  test("포인트 정보가 올바르게 표시되어야 함", async ({ page }) => {
    const pointsSection = page.locator("[data-testid='points-section']");
    await expect(pointsSection).toBeVisible();

    const pointIcon = page.locator("[data-testid='point-icon']");
    await expect(pointIcon).toBeVisible();
  });

  test("메뉴 아이템들이 렌더링되어야 함", async ({ page }) => {
    const menuList = page.locator("[data-testid='menu-list']");
    await expect(menuList).toBeVisible();

    const transactionsMenu = page.locator("[data-testid='menu-item-transactions']");
    const pointsMenu = page.locator("[data-testid='menu-item-points']");
    const passwordMenu = page.locator("[data-testid='menu-item-password']");

    await expect(transactionsMenu).toBeVisible();
    await expect(pointsMenu).toBeVisible();
    await expect(passwordMenu).toBeVisible();
  });

  test("메뉴 클릭 시 활성 상태가 변경되어야 함", async ({ page }) => {
    const transactionsMenu = page.locator("[data-testid='menu-item-transactions']");
    const pointsMenu = page.locator("[data-testid='menu-item-points']");

    // 초기 상태 확인
    await expect(transactionsMenu).toHaveClass(/menuItemActive/);

    // 포인트 메뉴 클릭
    await pointsMenu.click();

    // 활성 상태 변경 확인
    await expect(pointsMenu).toHaveClass(/menuItemActive/);
  });

  test("탭이 렌더링되어야 함", async ({ page }) => {
    const tabSection = page.locator("[data-testid='tab-section']");
    await expect(tabSection).toBeVisible();

    const myProductsTab = page.locator("[data-testid='tab-my-products']");
    const bookmarksTab = page.locator("[data-testid='tab-bookmarks']");

    await expect(myProductsTab).toBeVisible();
    await expect(bookmarksTab).toBeVisible();
  });

  test("탭 클릭 시 활성 상태가 변경되어야 함", async ({ page }) => {
    const myProductsTab = page.locator("[data-testid='tab-my-products']");
    const bookmarksTab = page.locator("[data-testid='tab-bookmarks']");

    // 초기 상태 확인
    await expect(myProductsTab).toHaveClass(/tabActive/);

    // 북마크 탭 클릭
    await bookmarksTab.click();

    // 활성 상태 변경 확인
    await expect(bookmarksTab).toHaveClass(/tabActive/);
    await expect(myProductsTab).not.toHaveClass(/tabActive/);
  });

  test("검색 섹션이 렌더링되어야 함", async ({ page }) => {
    const searchSection = page.locator("[data-testid='search-section']");
    await expect(searchSection).toBeVisible();

    const searchBar = page.locator("[data-testid='search-bar']");
    const searchInput = page.locator("[data-testid='search-input']");
    const searchButton = page.locator("[data-testid='search-button']");

    await expect(searchBar).toBeVisible();
    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();
  });

  test("검색 입력이 작동해야 함", async ({ page }) => {
    const searchInput = page.locator("[data-testid='search-input']");
    const searchKeyword = "테스트 키워드";

    await searchInput.fill(searchKeyword);
    await expect(searchInput).toHaveValue(searchKeyword);
  });

  test("거래 내역 테이블이 렌더링되어야 함", async ({ page }) => {
    const table = page.locator("[data-testid='transaction-table']");
    await expect(table).toBeVisible();

    const header = page.locator("[data-testid='table-header']");
    await expect(header).toBeVisible();
  });

  test("테이블 헤더가 올바르게 표시되어야 함", async ({ page }) => {
    const headerNumber = page.locator("[data-testid='header-number']");
    const headerName = page.locator("[data-testid='header-name']");
    const headerPrice = page.locator("[data-testid='header-price']");
    const headerDate = page.locator("[data-testid='header-date']");

    await expect(headerNumber).toContainText("번호");
    await expect(headerName).toContainText("토큰 이름");
    await expect(headerPrice).toContainText("가격");
    await expect(headerDate).toContainText("날짜");
  });

  test("테이블 행들이 렌더링되어야 함", async ({ page }) => {
    const tableBody = page.locator("[data-testid='table-body']");
    const tableRows = page.locator("[data-testid^='table-row-']");

    await expect(tableBody).toBeVisible();
    const count = await tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("레이아웃이 반응형이어야 함", async ({ page }) => {
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1280, height: 800 });
    const mainLayout = page.locator("[data-testid='main-layout']");
    await expect(mainLayout).toBeVisible();

    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(mainLayout).toBeVisible();
  });

  test("사이드바가 올바르게 배치되어야 함", async ({ page }) => {
    const sidebar = page.locator("[data-testid='sidebar']");
    const contentArea = page.locator("[data-testid='content-area']");

    await expect(sidebar).toBeVisible();
    await expect(contentArea).toBeVisible();
  });

  test("검색 버튼이 클릭 가능해야 함", async ({ page }) => {
    const searchButton = page.locator("[data-testid='search-button']");
    await expect(searchButton).toBeEnabled();
    await expect(searchButton).toContainText("검색");
  });
});
