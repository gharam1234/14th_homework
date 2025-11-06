/**
 * 중고폰 리스트 라우팅 hook
 * @description 중고폰 상세 페이지 및 새 중고폰 등록 페이지로의 라우팅 기능을 제공합니다.
 */

'use client';

import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

/**
 * 중고폰 리스트 라우팅 hook
 * @returns {Object} 라우팅 핸들러 객체
 *   - navigateToPhoneDetail: (phoneId: string | number) => void - 중고폰 상세 페이지로 이동
 *   - navigateToPhoneCreate: () => void - 중고폰 새 등록 페이지로 이동
 */
export const usePhonesListRouting = () => {
  const router = useRouter();

  /**
   * 중고폰 상세 페이지로 이동
   * @param phoneId 기기 ID
   */
  const navigateToPhoneDetail = (phoneId: string | number) => {
    const path = getPath('PHONE_DETAIL', { id: phoneId });
    router.push(path);
  };

  /**
   * 중고폰 새 등록 페이지로 이동 (중고폰 판매 등록 버튼)
   */
  const navigateToPhoneCreate = () => {
    const path = getPath('PHONE_CREATE');
    router.push(path);
  };

  return {
    navigateToPhoneDetail,
    navigateToPhoneCreate,
  };
};
