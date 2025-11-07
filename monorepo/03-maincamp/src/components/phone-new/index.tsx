"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";
import { usePhoneForm, savePhoneToStorage } from "./hooks/index.form.hook";
import { usePhoneNewRouting } from "./hooks/index.routing.hook";
import { IPhoneNewProps, IPhoneFormInput } from "./types";

/**
 * 중고폰 판매 등록 컴포넌트
 *
 * @description Figma 디자인 기반의 중고폰 판매 등록 폼 UI 컴포넌트
 * 당근마켓 스타일의 스마트폰 거래 등록 폼입니다.
 * react-hook-form + zod를 사용한 폼 검증 기능이 포함되어 있습니다.
 *
 * @example
 * ```tsx
 * import PhoneNew from "@/components/phone-new"
 *
 * // 신규등록 모드
 * export default function PhoneNewPage() {
 *   return <PhoneNew />
 * }
 *
 * // 수정 모드
 * export default function PhoneEditPage({ params }) {
 *   return <PhoneNew isEdit={true} phoneId={params.id} />
 * }
 * ```
 */
export default function PhoneNew(props: IPhoneNewProps = {}) {
  const { isEdit = false, phoneId } = props;
  const form = usePhoneForm({ isEdit, phoneId });
  const { handleCancel: handleCancelRouting, navigateAfterSubmit } =
    usePhoneNewRouting({ isEdit, phoneId });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = form;

  // 폼 필드 값 모니터링
  const currentValues = watch();

  /**
   * 폼 제출 핸들러
   */
  const onSubmit = async (data: IPhoneFormInput) => {
    try {
      setIsLoading(true);

      // 이미지 파일 처리 (현재는 dummy 처리)
      const imageDataUrls: string[] = [];
      for (const file of imageFiles) {
        // 실제 구현: 파일을 서버에 업로드하거나 Data URL로 변환
        // 현재는 파일 이름만 저장
        imageDataUrls.push(file.name);
      }

      // 검증된 데이터에 이미지 추가
      const finalData: IPhoneFormInput = {
        ...data,
        images: imageDataUrls.length > 0 ? imageDataUrls : currentValues.images,
      };

      // 로컬스토리지 저장
      savePhoneToStorage(isEdit, phoneId, finalData);

      // 성공 메시지 표시 (실제 구현에서는 Toast 등 사용)
      alert(`${isEdit ? "수정" : "등록"}이 완료되었습니다.`);

      // 폼 초기화
      reset();
      setImageFiles([]);

      // 라우팅 처리
      navigateAfterSubmit();
    } catch (error) {
      console.error("폼 제출 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = () => {
    // 원본 값으로 복구
    reset();
    setImageFiles([]);
    // 라우팅 처리
    handleCancelRouting();
  };

  /**
   * 우편번호 검색 버튼 핸들러
   */
  const handlePostcodeSearch = () => {
    // react-daum-postcode 모달 표시 (향후 구현)
    alert("우편번호 검색 기능은 준비 중입니다.");
  };

  /**
   * 이미지 파일 변경 핸들러
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 2 - imageFiles.length);
    if (newFiles.length + imageFiles.length > 2) {
      alert("최대 2개까지만 첨부할 수 있습니다.");
      return;
    }

    setImageFiles([...imageFiles, ...newFiles]);
  };

  /**
   * 이미지 삭제 핸들러
   */
  const handleImageDelete = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  /**
   * 버튼 활성화 상태 판단
   * - 폼이 유효하고
   * - 이미지가 1개 이상
   */
  const isSubmitEnabled = isValid && imageFiles.length > 0;

  return (
    <div className={styles.container} data-testid="phone-new-container">
      {/* 페이지 제목 */}
      <h1 className={styles.title} data-testid="page-title">
        {isEdit ? "중고폰 수정하기" : "중고폰 판매하기"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formSection}>
        {/* 기기명 입력 */}
        <div className={styles.inputWrapper} data-testid="phone-name-section">
          <label className={styles.label} htmlFor="phone-name">
            기기명
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            id="phone-name"
            type="text"
            placeholder="모델명을 입력해 주세요."
            className={`${styles.inputField} ${
              errors.title ? styles.inputError : ""
            }`}
            data-testid="input-phone-name"
            {...register("title")}
          />
          {errors.title && (
            <span className={styles.errorMessage}>{errors.title.message}</span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 한줄 요약 입력 */}
        <div className={styles.inputWrapper} data-testid="summary-section">
          <label className={styles.label} htmlFor="phone-summary">
            한줄 요약
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            id="phone-summary"
            type="text"
            placeholder="기기를 한줄로 요약해 주세요."
            className={`${styles.inputField} ${
              errors.summary ? styles.inputError : ""
            }`}
            data-testid="input-phone-summary"
            {...register("summary")}
          />
          {errors.summary && (
            <span className={styles.errorMessage}>
              {errors.summary.message}
            </span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 상품 설명 */}
        <div className={styles.editorWrapper} data-testid="description-section">
          <label className={styles.label}>
            상품 설명
            <span className={styles.labelRequired}>*</span>
          </label>

          <div
            className={`${styles.editorContainer} ${
              errors.description ? styles.inputError : ""
            }`}
            data-testid="editor-container"
          >
            {/* 에디터 툴바 */}
            <div className={styles.editorToolbar} data-testid="editor-toolbar">
              {/* 텍스트 포매팅 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Bold"
                  data-testid="btn-bold"
                  type="button"
                >
                  <strong>B</strong>
                </button>
                <button
                  className={styles.editorButton}
                  title="Italic"
                  data-testid="btn-italic"
                  type="button"
                >
                  <em>I</em>
                </button>
                <button
                  className={styles.editorButton}
                  title="Underline"
                  data-testid="btn-underline"
                  type="button"
                >
                  <u>U</u>
                </button>
                <button
                  className={styles.editorButton}
                  title="Strikethrough"
                  data-testid="btn-strikethrough"
                  type="button"
                >
                  <s>S</s>
                </button>
              </div>

              {/* 블록 포매팅 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Align Left"
                  data-testid="btn-align-left"
                  type="button"
                >
                  ⬅️
                </button>
                <button
                  className={styles.editorButton}
                  title="Align Center"
                  data-testid="btn-align-center"
                  type="button"
                >
                  ⬅️➡️
                </button>
                <button
                  className={styles.editorButton}
                  title="Align Right"
                  data-testid="btn-align-right"
                  type="button"
                >
                  ➡️
                </button>
                <button
                  className={styles.editorButton}
                  title="Justify"
                  data-testid="btn-justify"
                  type="button"
                >
                  ⬅️⬅️
                </button>
              </div>

              {/* 목록 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Bullet List"
                  data-testid="btn-bullet-list"
                  type="button"
                >
                  •
                </button>
                <button
                  className={styles.editorButton}
                  title="Numbered List"
                  data-testid="btn-numbered-list"
                  type="button"
                >
                  1.
                </button>
              </div>

              {/* 미디어 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={styles.editorButton}
                  title="Insert Link"
                  data-testid="btn-link"
                  type="button"
                >
                  🔗
                </button>
                <button
                  className={styles.editorButton}
                  title="Insert Image"
                  data-testid="btn-image"
                  type="button"
                >
                  🖼️
                </button>
                <button
                  className={styles.editorButton}
                  title="Insert Video"
                  data-testid="btn-video"
                  type="button"
                >
                  📹
                </button>
              </div>

              {/* 기타 */}
              <div className={styles.editorToolbarGroup}>
                <button
                  className={`${styles.editorButton} ${styles.disabled}`}
                  title="More Options"
                  data-testid="btn-more"
                  disabled
                  type="button"
                >
                  ⋯
                </button>
              </div>
            </div>

            {/* 에디터 콘텐츠 영역 */}
            <textarea
              className={`${styles.editorContent} ${
                errors.description ? styles.inputError : ""
              }`}
              data-testid="editor-content"
              placeholder="내용을 입력해 주세요."
              {...register("description")}
              style={{
                minHeight: "350px",
                padding: "16px",
                border: "none",
                fontFamily: "inherit",
                fontSize: "16px",
                lineHeight: "24px",
                resize: "vertical",
              }}
            />
          </div>

          {errors.description && (
            <span className={styles.errorMessage}>
              {errors.description.message}
            </span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 판매 가격 입력 */}
        <div className={styles.inputWrapper} data-testid="price-section">
          <label className={styles.label} htmlFor="phone-price">
            판매 가격
            <span className={styles.labelRequired}>*</span>
          </label>
          <input
            id="phone-price"
            type="text"
            placeholder="판매 가격을 입력해 주세요. (원 단위)"
            className={`${styles.inputField} ${
              errors.price ? styles.inputError : ""
            }`}
            data-testid="input-phone-price"
            {...register("price")}
          />
          {errors.price && (
            <span className={styles.errorMessage}>{errors.price.message}</span>
          )}
        </div>

        <hr className={styles.divider} />

        {/* 태그 입력 */}
        <div className={styles.inputWrapper} data-testid="tags-section">
          <label className={styles.label} htmlFor="phone-tags">
            태그 입력
          </label>
          <input
            id="phone-tags"
            type="text"
            placeholder="태그를 입력해 주세요."
            className={styles.inputField}
            data-testid="input-phone-tags"
            {...register("tags")}
          />
        </div>

        <hr className={styles.divider} />

        {/* 주소 및 지도 섹션 */}
        <div className={styles.addressMapLayout} data-testid="address-section">
          {/* 좌측: 주소 입력 */}
          <div className={styles.addressColumnLeft}>
            {/* 주소 입력 그룹 */}
            <div
              className={styles.addressInputGroup}
              data-testid="address-input-group"
            >
              <label className={styles.label}>
                주소
                <span className={styles.labelRequired}>*</span>
              </label>

              <div
                className={styles.addressWithButton}
                data-testid="postcode-input-group"
              >
                <input
                  type="text"
                  placeholder="01234"
                  className={`${styles.addressInput} ${
                    errors.postalCode ? styles.inputError : ""
                  }`}
                  data-testid="input-postcode"
                  disabled
                  {...register("postalCode")}
                />
                <button
                  className={styles.postcodeButton}
                  data-testid="btn-postcode-search"
                  type="button"
                  onClick={handlePostcodeSearch}
                >
                  우편번호 검색
                </button>
              </div>

              {errors.postalCode && (
                <span className={styles.errorMessage}>
                  {errors.postalCode.message}
                </span>
              )}
            </div>

            {/* 상세주소 입력 */}
            <div
              className={styles.inputWrapper}
              data-testid="detailed-address-input-group"
            >
              <input
                type="text"
                placeholder="상세주소를 입력해 주세요."
                className={`${styles.detailedAddressInput} ${
                  errors.detailedAddress ? styles.inputError : ""
                }`}
                data-testid="input-detailed-address"
                {...register("detailedAddress")}
              />
              {errors.detailedAddress && (
                <span className={styles.errorMessage}>
                  {errors.detailedAddress.message}
                </span>
              )}
            </div>

            {/* 좌표 입력 (위도/경도) */}
            <div
              className={styles.coordinatesGroup}
              data-testid="coordinates-section"
            >
              <div className={styles.inputWrapper}>
                <label className={styles.label} htmlFor="latitude">
                  위도(LAT)
                </label>
                <input
                  id="latitude"
                  type="text"
                  placeholder="주소를 먼저 입력해 주세요."
                  className={styles.coordinateInput}
                  data-testid="input-latitude"
                  disabled
                  {...register("latitude")}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label} htmlFor="longitude">
                  경도(LNG)
                </label>
                <input
                  id="longitude"
                  type="text"
                  placeholder="주소를 먼저 입력해 주세요."
                  className={styles.coordinateInput}
                  data-testid="input-longitude"
                  disabled
                  {...register("longitude")}
                />
              </div>
            </div>
          </div>

          {/* 우측: 지도 */}
          <div className={styles.mapColumnRight} data-testid="map-section">
            <h3 className={styles.mapSectionTitle} data-testid="map-title">
              거래 위치
            </h3>

            <div className={styles.mapContainer} data-testid="map-placeholder">
              주소를 먼저 입력해 주세요.
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 중고폰 이미지 첨부 */}
        <div className={styles.imageSection} data-testid="image-section">
          <label className={styles.imageSectionTitle}>
            사진 첨부
            <span className={styles.labelRequired}>*</span>
          </label>

          {/* 미리보기 */}
          {imageFiles.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {imageFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "160px",
                    height: "160px",
                    borderRadius: "8px",
                    border: "1px solid #e4e4e4",
                    overflow: "hidden",
                    backgroundColor: "#f2f2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {file.type.startsWith("image/") ? (
                    <>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          lineHeight: "24px",
                          padding: "0",
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px" }}>📄</div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        {file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 업로드 버튼 */}
          {imageFiles.length < 2 && (
            <button
              className={styles.imageUploadBox}
              data-testid="btn-upload-image"
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "image/*";
                input.onchange = (e) => {
                  handleImageChange(
                    e as unknown as React.ChangeEvent<HTMLInputElement>
                  );
                };
                input.click();
              }}
            >
              <div className={styles.imageUploadContent}>
                <div className={styles.imageUploadIcon}>+</div>
                <p className={styles.imageUploadText}>
                  클릭해서 사진 업로드
                </p>
              </div>
            </button>
          )}

          {errors.images && (
            <span className={styles.errorMessage}>{errors.images.message}</span>
          )}
        </div>
      </form>

      {/* 버튼 섹션 */}
      <div className={styles.buttonSection} data-testid="button-section">
        <button
          className={styles.cancelButton}
          data-testid="btn-cancel"
          type="button"
          onClick={handleCancel}
        >
          취소
        </button>
        <button
          className={`${styles.submitButton} ${
            isSubmitEnabled ? styles.active : ""
          }`}
          data-testid="btn-submit"
          type="submit"
          disabled={!isSubmitEnabled || isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading
            ? "처리 중..."
            : isEdit
            ? "수정하기"
            : "등록하기"}
        </button>
      </div>
    </div>
  );
}
