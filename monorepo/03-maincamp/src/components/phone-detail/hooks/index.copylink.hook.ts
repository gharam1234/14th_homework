'use client';

import { useCallback } from 'react';
import { message } from 'antd';

/**
 * 링크 복사 기능 훅
 * @description 현재 페이지 URL을 클립보드에 복사하는 기능을 제공합니다.
 * navigator.clipboard.writeText() API를 사용하여 복사하며,
 * 성공 시 success 토스트, 실패 시 error 토스트를 표시합니다.
 * @returns { copyLink } - 링크 복사 함수
 */
export function useCopyLink() {
  /**
   * 현재 페이지 URL을 클립보드에 복사
   * @description
   * 1. window.location.href로 현재 페이지 전체 URL 가져오기
   * 2. navigator.clipboard.writeText()로 클립보드에 복사
   * 3. 성공 시 "링크가 복사되었습니다." 메시지 표시
   * 4. 실패 시 "링크 복사에 실패했습니다." 메시지 표시
   */
  const copyLink = useCallback(async () => {
    try {
      // 브라우저 환경 확인
      if (typeof window === 'undefined') {
        message.error('링크 복사에 실패했습니다.');
        return;
      }

      // 클립보드 API 지원 확인
      if (!navigator.clipboard) {
        message.error('링크 복사에 실패했습니다.');
        return;
      }

      // 현재 페이지 URL 가져오기
      const currentUrl = window.location.href;

      // 클립보드에 복사
      await navigator.clipboard.writeText(currentUrl);

      // 성공 메시지 표시
      message.success('링크가 복사되었습니다.');
    } catch (error) {
      // 실패 메시지 표시
      console.error('링크 복사 실패:', error);
      message.error('링크 복사에 실패했습니다.');
    }
  }, []);

  return {
    copyLink,
  };
}
