import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

/**
 * 중고폰 리스트 라우팅 훅
 * @description 중고폰 상세 페이지 및 새 중고폰 등록 페이지로의 라우팅 기능을 제공합니다.
 */

/**
 * 중고폰 리스트 라우팅 훅 반환 타입
 */
export interface UsePhonesListRoutingReturn {
  /**
   * 중고폰 상세 페이지로 이동
   * @param phoneId 기기 ID
   */
  navigateToPhoneDetail: (phoneId: string | number) => void;

  /**
   * 중고폰 새 등록 페이지로 이동 (중고폰 판매 등록 버튼)
   */
  navigateToPhoneCreate: () => void;
}

/**
 * 중고폰 리스트 라우팅 훅
 * @returns {UsePhonesListRoutingReturn} 라우팅 핸들러 객체
 */
export function usePhonesListRouting(): UsePhonesListRoutingReturn {
  const router = useRouter();

  /**
   * 중고폰 상세 페이지로 이동
   * @param phoneId 기기 ID
   */
  const navigateToPhoneDetail = (phoneId: string | number): void => {
    const path = getPath('PHONE_DETAIL', { id: phoneId });
    router.push(path);
  };

  /**
   * 중고폰 새 등록 페이지로 이동 (중고폰 판매 등록 버튼)
   */
  const navigateToPhoneCreate = (): void => {
    const path = getPath('PHONE_CREATE');
    router.push(path);
  };

  return {
    navigateToPhoneDetail,
    navigateToPhoneCreate,
  };
}
