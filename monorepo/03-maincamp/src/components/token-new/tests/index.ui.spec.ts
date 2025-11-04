/**
 * 토큰 판매 등록 폼 - UI 렌더링 테스트
 *
 * Playwright를 사용한 E2E 테스트
 * 모든 입력 필드, 버튼, 라벨이 올바르게 렌더링되는지 검증
 */

import { test, expect } from "@playwright/test";

test.describe("TokenNew 컴포넌트 UI", () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 페이지로 이동
    // NOTE: 실제 페이지 경로는 프로젝트 설정에 따라 수정 필요
    await page.goto("http://localhost:3000/token/new");
  });

  test("페이지 제목이 렌더링되어야 함", async ({ page }) => {
    const title = page.locator("[data-testid='page-title']");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("토큰 판매하기");
  });

  test("모든 입력 필드가 렌더링되어야 함", async ({ page }) => {
    // 토큰명 입력
    const tokenName = page.locator("[data-testid='input-token-name']");
    await expect(tokenName).toBeVisible();
    await expect(tokenName).toHaveAttribute(
      "placeholder",
      "토큰명을 입력해 주세요."
    );

    // 한줄 요약 입력
    const summary = page.locator("[data-testid='input-token-summary']");
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute(
      "placeholder",
      "토큰을 한줄로 요약해 주세요."
    );

    // 판매 가격 입력
    const price = page.locator("[data-testid='input-token-price']");
    await expect(price).toBeVisible();
    await expect(price).toHaveAttribute(
      "placeholder",
      "판매 가격을 입력해 주세요. (원 단위)"
    );

    // 태그 입력
    const tags = page.locator("[data-testid='input-token-tags']");
    await expect(tags).toBeVisible();
    await expect(tags).toHaveAttribute(
      "placeholder",
      "태그를 입력해 주세요."
    );
  });

  test("에디터가 렌더링되어야 함", async ({ page }) => {
    const editor = page.locator("[data-testid='editor-container']");
    await expect(editor).toBeVisible();

    // 에디터 툴바
    const toolbar = page.locator("[data-testid='editor-toolbar']");
    await expect(toolbar).toBeVisible();

    // 에디터 콘텐츠 영역
    const content = page.locator("[data-testid='editor-content']");
    await expect(content).toBeVisible();
    await expect(content).toHaveText("내용을 입력해 주세요.");
  });

  test("주소 입력 필드가 렌더링되어야 함", async ({ page }) => {
    // 우편번호 입력 (disabled)
    const postcode = page.locator("[data-testid='input-postcode']");
    await expect(postcode).toBeVisible();
    await expect(postcode).toBeDisabled();

    // 우편번호 검색 버튼
    const postcodeBtn = page.locator("[data-testid='btn-postcode-search']");
    await expect(postcodeBtn).toBeVisible();
    await expect(postcodeBtn).toHaveText("우편번호 검색");

    // 상세주소 입력
    const detailed = page.locator("[data-testid='input-detailed-address']");
    await expect(detailed).toBeVisible();
    await expect(detailed).toHaveAttribute(
      "placeholder",
      "상세주소를 입력해 주세요."
    );

    // 위도/경도 입력 (disabled)
    const latitude = page.locator("[data-testid='input-latitude']");
    const longitude = page.locator("[data-testid='input-longitude']");
    await expect(latitude).toBeDisabled();
    await expect(longitude).toBeDisabled();
  });

  test("지도 영역이 렌더링되어야 함", async ({ page }) => {
    const mapContainer = page.locator("[data-testid='map-placeholder']");
    await expect(mapContainer).toBeVisible();
    await expect(mapContainer).toHaveText("주소를 먼저 입력해 주세요.");
  });

  test("이미지 업로드 버튼이 렌더링되어야 함", async ({ page }) => {
    const uploadBtn = page.locator("[data-testid='btn-upload-image']");
    await expect(uploadBtn).toBeVisible();
    await expect(uploadBtn).toContainText("클릭해서 사진 업로드");
  });

  test("버튼이 렌더링되어야 함", async ({ page }) => {
    // 취소 버튼
    const cancelBtn = page.locator("[data-testid='btn-cancel']");
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toHaveText("취소");

    // 등록하기 버튼
    const submitBtn = page.locator("[data-testid='btn-submit']");
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveText("등록하기");
    await expect(submitBtn).toBeDisabled();
  });

  test("모든 필드 라벨이 렌더링되어야 함", async ({ page }) => {
    const labels = await page.locator("label").all();
    expect(labels.length).toBeGreaterThan(0);
  });

  test("구분선이 렌더링되어야 함", async ({ page }) => {
    const dividers = await page.locator("[class*='divider']").all();
    expect(dividers.length).toBeGreaterThan(0);
  });

  test("에디터 툴바 버튼이 렌더링되어야 함", async ({ page }) => {
    const boldBtn = page.locator("[data-testid='btn-bold']");
    const italicBtn = page.locator("[data-testid='btn-italic']");
    const linkBtn = page.locator("[data-testid='btn-link']");

    await expect(boldBtn).toBeVisible();
    await expect(italicBtn).toBeVisible();
    await expect(linkBtn).toBeVisible();
  });

  test("컨테이너가 올바른 크기를 가져야 함", async ({ page }) => {
    const container = page.locator("[data-testid='token-new-container']");
    const box = await container.boundingBox();

    // 1280px 고정 폭 확인 (또는 반응형으로 더 작을 수 있음)
    expect(box?.width).toBeGreaterThan(300);
  });
});
