import { useCallback } from 'react';

/**
 * useImageError 커스텀 훅
 *
 * @description 이미지 로드 실패를 감지하고 기본 이미지로 대체하는 훅
 * @param defaultImagePath 기본 이미지 경로
 * @returns handleImageError 이미지 에러 핸들러
 */
export function useImageError(defaultImagePath: string) {
  /**
   * 이미지 로드 실패 시 호출되는 핸들러
   * - 기본 이미지로 대체
   * - 무한 루프 방지: 이미 기본 이미지인 경우 재시도 안 함
   * - 에러 로그 기록
   */
  const handleImageError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const imgElement = event.currentTarget;
      const originalSrc = imgElement.src;

      // 무한 루프 방지: 이미 기본 이미지인 경우 재시도하지 않음
      if (originalSrc.includes(defaultImagePath)) {
        return;
      }

      // 에러 로그 기록
      console.error(`이미지 로드 실패: ${originalSrc}`);
      console.error(`기본 이미지로 대체: ${defaultImagePath}`);

      // 기본 이미지로 대체
      imgElement.src = defaultImagePath;
    },
    [defaultImagePath]
  );

  return {
    handleImageError,
  };
}
