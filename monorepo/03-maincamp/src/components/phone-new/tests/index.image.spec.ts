import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";
import os from "os";

test.describe("이미지 업로드 기능", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // 테스트 페이지 접근
    await page.goto("/phones/new", {
      waitUntil: "domcontentloaded",
    });
    // 페이지 로드 완료 대기
    await page.waitForSelector("[data-testid='phone-new-container']", {
      timeout: 500,
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("업로드 버튼 클릭: 파일 선택 다이얼로그 열림", async () => {
    // 파일 선택 다이얼로그가 열릴 때의 페이지 이벤트 감지
    const fileChooserPromise = page.waitForEvent("filechooser");

    // 업로드 버튼 클릭
    await page.click("[data-testid='btn-upload-image']");

    // 파일 선택 다이얼로그가 열렸는지 확인
    const fileChooser = await fileChooserPromise;
    expect(fileChooser).toBeTruthy();
  });

  test("이미지 선택 시: 미리보기 표시", async () => {
    // 테스트용 이미지 파일 생성
    const testImagePath = await createTestImageFile("test-image.png");

    // 파일 선택 이벤트 감지
    const fileChooserPromise = page.waitForEvent("filechooser");

    // 업로드 버튼 클릭
    await page.click("[data-testid='btn-upload-image']");

    // 파일 선택
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // 미리보기가 표시되었는지 확인 (이미지 요소가 DOM에 추가됨)
    await page.waitForSelector("[data-testid='image-preview']", { timeout: 500 });
    const imageElement = await page.locator("[data-testid='image-preview']").first();
    expect(imageElement).toBeTruthy();

    // 테스트 파일 정리
    fs.unlinkSync(testImagePath);
  });

  test("2개 이미지 선택 후 3번째 선택: 경고 메시지 표시", async () => {
    const testImage1 = await createTestImageFile("test-image-1.png");
    const testImage2 = await createTestImageFile("test-image-2.jpg");
    const testImage3 = await createTestImageFile("test-image-3.png");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click("[data-testid='btn-upload-image']");
    const fileChooser = await fileChooserPromise;

    const dialogPromise = page.waitForEvent("dialog");
    await fileChooser.setFiles([testImage1, testImage2, testImage3]);
    [testImage1, testImage2, testImage3].forEach((filePath) => fs.unlinkSync(filePath));

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("최대 2개까지만 첨부할 수 있습니다");
    await dialog.dismiss();

    await page.waitForSelector("[data-testid='image-preview']", { timeout: 500 });
    await expect(page.locator("[data-testid='image-preview']")).toHaveCount(2);
    await expect(page.locator("[data-testid='btn-upload-image']")).toHaveCount(0);
  });

  test("삭제 버튼 클릭: 이미지 제거 및 업로드 버튼 다시 표시", async () => {
    // 이미지 업로드
    const testImage = await createTestImageFile("test-image.png");
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click("[data-testid='btn-upload-image']");
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImage);
    fs.unlinkSync(testImage);

    // 이미지가 표시되었는지 확인
    const imageElements = await page.locator("[data-testid='image-preview']").count();
    expect(imageElements).toBeGreaterThan(0);

    // 삭제 버튼 클릭 (X 버튼)
    const deleteButton = page.locator("[data-testid='btn-delete-image']");
    await deleteButton.first().click();

    // 이미지가 제거되었는지 확인
    const remainingImages = await page.locator("[data-testid='image-preview']").count();
    expect(remainingImages).toBe(0);

    // 업로드 버튼이 다시 표시되었는지 확인
    await page.waitForSelector("[data-testid='btn-upload-image']", {
      timeout: 500,
    });
    const uploadButton = page.locator("[data-testid='btn-upload-image']");
    await expect(uploadButton).toHaveCount(1);
  });

  test("5MB 초과 파일: alert 메시지 표시", async () => {
    // 5MB 초과 파일 생성
    const largeImagePath = await createLargeTestImageFile(6);

    // alert 이벤트 감지
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("파일 크기는 5MB 이하여야 합니다");
      dialog.dismiss();
    });

    // 파일 선택
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click("[data-testid='btn-upload-image']");
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(largeImagePath);

    // 테스트 파일 정리
    fs.unlinkSync(largeImagePath);
  });

  test("지원하지 않는 파일 형식: alert 메시지 표시", async () => {
    // 지원하지 않는 파일 생성 (.txt 파일)
    const unsupportedFilePath = path.join(os.tmpdir(), "test-file.txt");
    fs.writeFileSync(unsupportedFilePath, "This is a text file");

    // alert 이벤트 감지
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain(
        "지원하지 않는 파일 형식입니다"
      );
      dialog.dismiss();
    });

    // 파일 선택
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click("[data-testid='btn-upload-image']");
    const fileChooser = await fileChooserPromise;
    // 파일 시스템에서 직접 선택하므로 accept 속성은 무시됨
    await fileChooser.setFiles(unsupportedFilePath);

    // 테스트 파일 정리
    fs.unlinkSync(unsupportedFilePath);
  });
});

/**
 * 테스트용 이미지 파일 생성
 * PNG 형식의 최소한의 이미지 파일 생성
 */
async function createTestImageFile(filename: string): Promise<string> {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, filename);

  // 간단한 PNG 파일 생성 (1x1 픽셀, 투명 배경)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x5b, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  fs.writeFileSync(filePath, pngData);
  return filePath;
}

/**
 * 테스트용 대용량 이미지 파일 생성
 * 지정된 크기(MB)의 이미지 파일 생성
 */
async function createLargeTestImageFile(sizeMB: number): Promise<string> {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `large-image-${sizeMB}mb.png`);

  // PNG 헤더 + 대용량 데이터
  const sizeInBytes = sizeMB * 1024 * 1024;
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const buffer = Buffer.alloc(sizeInBytes);
  pngHeader.copy(buffer);

  fs.writeFileSync(filePath, buffer);
  return filePath;
}
