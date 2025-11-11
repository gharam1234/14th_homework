/**
 * useAddressSearch 훅
 *
 * 주소 검색 기능을 관리하는 커스텀 훅
 * react-daum-postcode를 사용하여 우편번호 검색 및 좌표 자동 계산
 */

import { useState, useCallback } from 'react';

/** Daum Postcode API 결과 타입 */
export interface IDaumPostcodeData {
  zonecode: string;
  address: string;
  addressType: string;
  roadAddress?: string;
  latitude?: number;
  longitude?: number;
}

/** 주소 검색 훅 반환 타입 */
export interface IUseAddressSearchReturn {
  isAddressModalOpen: boolean;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  handleAddressSelect: (data: IDaumPostcodeData) => {
    postalCode: string;
    address: string;
    latitude: string;
    longitude: string;
  };
}

/**
 * 주소 검색 훅
 *
 * @returns {IUseAddressSearchReturn} 주소 검색 상태 및 핸들러
 */
export const useAddressSearch = (): IUseAddressSearchReturn => {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  /**
   * 주소 검색 모달 열기
   */
  const openAddressModal = useCallback(() => {
    setIsAddressModalOpen(true);
  }, []);

  /**
   * 주소 검색 모달 닫기
   */
  const closeAddressModal = useCallback(() => {
    setIsAddressModalOpen(false);
  }, []);

  /**
   * 주소 선택 완료 핸들러
   *
   * @param {IDaumPostcodeData} data - Daum Postcode API 결과
   * @returns {Object} postalCode, address, latitude, longitude
   */
  const handleAddressSelect = useCallback(
    (data: IDaumPostcodeData) => {
      try {
        // 우편번호에서 숫자만 추출 (형식: 12345)
        const postalCode = data.zonecode;

        // 기본 주소
        const address = data.address || '';

        // 좌표 설정 (Daum API에서 제공되는 값)
        const latitude = data.latitude?.toString() || '';
        const longitude = data.longitude?.toString() || '';

        // 좌표가 없으면 에러 처리
        if (!latitude || !longitude) {
          console.warn('좌표 정보 없음:', { latitude, longitude });
          alert('좌표 계산에 실패했습니다.');
          closeAddressModal();
          return {
            postalCode: '',
            address: '',
            latitude: '',
            longitude: '',
          };
        }

        // 모달 닫기
        closeAddressModal();

        return {
          postalCode,
          address,
          latitude,
          longitude,
        };
      } catch (error) {
        console.error('주소 선택 처리 중 오류:', error);
        alert('주소 검색에 실패했습니다.');
        return {
          postalCode: '',
          address: '',
          latitude: '',
          longitude: '',
        };
      }
    },
    [closeAddressModal]
  );

  return {
    isAddressModalOpen,
    openAddressModal,
    closeAddressModal,
    handleAddressSelect,
  };
};
