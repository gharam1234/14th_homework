import { useState, useCallback, ChangeEvent } from "react";

/**
 * 이미지 업로드 훅
 *
 * @description 이미지 파일 선택, 검증, 삭제 기능을 관리하는 커스텀 훅
 * - 최대 2개의 이미지 파일만 허용
 * - 파일 크기 5MB 이하
 * - 지원 형식: jpg, jpeg, png, gif, webp
 *
 * @example
 * ```tsx
 * const { imageFiles, handleImageChange, handleImageDelete } = useImageUpload();
 *
 * <input
 *   type="file"
 *   accept="image/*"
 *   multiple
 *   onChange={handleImageChange}
 * />
 * ```
 */
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 2;

export function useImageUpload() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  /**
   * 파일 크기 검증
   */
  const validateFileSize = useCallback((file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return false;
    }
    return true;
  }, []);

  /**
   * 파일 타입 검증
   */
  const validateFileType = useCallback((file: File): boolean => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      alert("지원하지 않는 파일 형식입니다.");
      return false;
    }
    return true;
  }, []);

  /**
   * 이미지 파일 변경 핸들러
   * - 파일 유효성 검사 수행
   * - imageFiles에 추가
   */
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newFiles: File[] = [];

      // 각 파일 검증
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 파일 타입 검증
        if (!validateFileType(file)) {
          continue;
        }

        // 파일 크기 검증
        if (!validateFileSize(file)) {
          continue;
        }

        // 최대 개수 초과 확인
        if (imageFiles.length + newFiles.length >= MAX_FILES) {
          alert("최대 2개까지만 첨부할 수 있습니다.");
          break;
        }

        newFiles.push(file);
      }

      // 검증된 파일들을 추가
      setImageFiles((prev) => [...prev, ...newFiles]);
    },
    [imageFiles.length, validateFileSize, validateFileType]
  );

  /**
   * 이미지 삭제 핸들러
   * - index 매개변수로 특정 이미지만 제거
   */
  const handleImageDelete = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 모든 이미지 파일 삭제
   */
  const clearAllImages = useCallback(() => {
    setImageFiles([]);
  }, []);

  return {
    imageFiles,
    handleImageChange,
    handleImageDelete,
    clearAllImages,
    canAddMoreImages: imageFiles.length < MAX_FILES,
  };
}
