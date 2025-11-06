/**
 * 중고폰 신규/수정 페이지 라우팅 hook
 * @description 중고폰 등록 또는 수정 후 라우팅 기능을 제공합니다.
 */

'use client';

import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

interface IUsePhoneNewRoutingProps {
  isEdit?: boolean;
  phoneId?: string | number;
}

/**
 * 중고폰 신규/수정 페이지 라우팅 hook
 * @param isEdit 수정 모드 여부 (기본값: false)
 * @param phoneId 수정 대상 기기 ID (수정 모드일 때 필수)
 * @returns {Object} 라우팅 핸들러 객체
 *   - handleCancel: () => void - 취소 시 라우팅 (등록/수정 모드에 따라 다름)
 *   - navigateAfterSubmit: () => void - 등록/수정 완료 후 라우팅
 */
export const usePhoneNewRouting = ({
  isEdit = false,
  phoneId,
}: IUsePhoneNewRoutingProps = {}) => {
  const router = useRouter();

  /**
   * 취소 버튼 클릭 핸들러
   * - 신규등록 모드: /phones (목록 페이지)로 이동
   * - 수정 모드: /phones/[id] (상세 페이지)로 이동
   */
  const handleCancel = () => {
    if (isEdit && phoneId) {
      // 수정 모드: 상세 페이지로 이동
      const path = getPath('PHONE_DETAIL', { id: phoneId });
      router.push(path);
    } else {
      // 신규등록 모드: 목록 페이지로 이동
      const path = getPath('PHONES_LIST');
      router.push(path);
    }
  };

  /**
   * 등록/수정 완료 후 라우팅
   * - 신규등록 모드: /phones (목록 페이지)로 이동
   * - 수정 모드: /phones/[id] (상세 페이지)로 이동
   */
  const navigateAfterSubmit = () => {
    if (isEdit && phoneId) {
      // 수정 모드: 상세 페이지로 이동
      const path = getPath('PHONE_DETAIL', { id: phoneId });
      router.push(path);
    } else {
      // 신규등록 모드: 목록 페이지로 이동
      const path = getPath('PHONES_LIST');
      router.push(path);
    }
  };

  return {
    handleCancel,
    navigateAfterSubmit,
  };
};
