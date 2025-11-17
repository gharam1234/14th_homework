'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

/**
 * 전화 상세 네비게이션 훅
 * @description 상단 카테고리 탭 및 뒤로가기 버튼 클릭 시 중고폰 리스트로 이동
 */
export const usePhoneDetailNavigation = () => {
  const router = useRouter();

  /**
   * 중고폰 리스트 경로로 라우팅
   */
  const navigateToPhonesList = useCallback(() => {
    router.push(getPath('PHONES_LIST'));
  }, [router]);

  /**
   * 상단 카테고리 탭 클릭 핸들러
   */
  const handleCategoryTabClick = useCallback(() => {
    navigateToPhonesList();
  }, [navigateToPhonesList]);

  /**
   * 뒤로가기 버튼 클릭 핸들러
   */
  const handleBackButtonClick = useCallback(() => {
    navigateToPhonesList();
  }, [navigateToPhonesList]);

  return {
    handleCategoryTabClick,
    handleBackButtonClick,
  };
};
