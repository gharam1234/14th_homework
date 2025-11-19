import { useCallback, useMemo } from 'react';

/**
 * useMapLink Hook
 * 
 * @description Kakao Maps 길찾기 링크를 생성하고 새 창으로 여는 Hook
 * 
 * @param latitude - 위도 (필수, -90 ~ 90)
 * @param longitude - 경도 (필수, -180 ~ 180)
 * @param address - 기본 주소 (필수)
 * @param addressDetail - 상세 주소 (선택)
 * 
 * @returns {Object} - Hook 반환값
 * @returns {Function} getMapUrl - Kakao Maps URL을 반환하는 함수
 * @returns {Function} openMapLink - 새 창으로 Kakao Maps를 여는 함수
 * @returns {boolean} isValidCoordinates - 좌표 유효성 검사 결과
 */
export function useMapLink({
  latitude,
  longitude,
  address,
  addressDetail,
}: {
  latitude: number;
  longitude: number;
  address: string;
  addressDetail?: string;
}) {
  /**
   * 좌표 유효성 검사
   * - latitude: -90 ~ 90
   * - longitude: -180 ~ 180
   * - address: 빈 문자열이 아님
   */
  const isValidCoordinates = useMemo(() => {
    const isValidLatitude = latitude >= -90 && latitude <= 90;
    const isValidLongitude = longitude >= -180 && longitude <= 180;
    const isValidAddress = address && address.trim().length > 0;

    return isValidLatitude && isValidLongitude && isValidAddress;
  }, [latitude, longitude, address]);

  /**
   * Kakao Maps URL 생성
   * 형식: https://map.kakao.com/link/map/[address],[latitude],[longitude]
   */
  const getMapUrl = useCallback(() => {
    // 전체 주소 생성 (addressDetail이 있으면 결합)
    const fullAddress = addressDetail 
      ? `${address} ${addressDetail}` 
      : address;

    // 주소 인코딩 (보안 처리)
    const encodedAddress = encodeURIComponent(fullAddress);

    // Kakao Maps URL 생성
    return `https://map.kakao.com/link/map/${encodedAddress},${latitude},${longitude}`;
  }, [latitude, longitude, address, addressDetail]);

  /**
   * 지도 링크를 새 창으로 열기
   * - 좌표가 유효하지 않으면 경고 메시지 표시
   * - 유효하면 window.open으로 새 창 열기
   */
  const openMapLink = useCallback(() => {
    // 좌표 검증
    if (!isValidCoordinates) {
      alert('유효한 위치 정보가 없습니다.');
      return;
    }

    // Kakao Maps 링크 열기
    const url = getMapUrl();
    window.open(url, '_blank');
  }, [isValidCoordinates, getMapUrl]);

  return {
    getMapUrl,
    openMapLink,
    isValidCoordinates,
  };
}

