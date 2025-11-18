'use client';

import { useCallback } from 'react';
import { message } from 'antd';

/**
 * 지도 URL 타입
 */
type MapProvider = 'kakao' | 'naver';

/**
 * 거래 지역 정보 타입
 */
interface LocationInfo {
  address?: string | null;
  address_detail?: string | null;
  zipcode?: string | null;
}

/**
 * 위치 기능 훅
 * @description 거래 지역을 외부 지도 서비스로 여는 기능을 제공합니다.
 * 카카오맵 또는 네이버 지도로 새 창을 열며,
 * 거래 지역 정보가 없는 경우 경고 메시지를 표시합니다.
 * @param locationInfo - 거래 지역 정보 (address, address_detail, zipcode)
 * @param mapProvider - 지도 서비스 제공자 (기본값: 'kakao')
 * @returns { openMap } - 지도 열기 함수
 */
export function useLocation(
  locationInfo?: LocationInfo | null,
  mapProvider: MapProvider = 'kakao'
) {
  /**
   * 거래 지역 정보가 있는지 확인
   * @description address, address_detail, zipcode 모두 비어있거나 null이면 false 반환
   * 하나라도 값이 있으면 true 반환
   */
  const hasLocationInfo = useCallback((): boolean => {
    if (!locationInfo) return false;

    const { address, address_detail, zipcode } = locationInfo;

    // 각 필드가 비어있거나 null인지 확인
    const isAddressEmpty = !address || address.trim() === '';
    const isAddressDetailEmpty = !address_detail || address_detail.trim() === '';
    const isZipcodeEmpty = !zipcode || zipcode.trim() === '';

    // 모두 비어있으면 false, 하나라도 있으면 true
    return !(isAddressEmpty && isAddressDetailEmpty && isZipcodeEmpty);
  }, [locationInfo]);

  /**
   * 검색어 생성
   * @description address, address_detail, zipcode를 조합하여 검색어 생성
   * 비어있는 필드는 제외하고 조합
   */
  const buildSearchQuery = useCallback((): string => {
    if (!locationInfo) return '';

    const { address, address_detail, zipcode } = locationInfo;
    const parts: string[] = [];

    if (address && address.trim() !== '') {
      parts.push(address.trim());
    }

    if (address_detail && address_detail.trim() !== '') {
      parts.push(address_detail.trim());
    }

    if (zipcode && zipcode.trim() !== '') {
      parts.push(zipcode.trim());
    }

    return parts.join(' ');
  }, [locationInfo]);

  /**
   * 지도 URL 생성
   * @description 지도 서비스별 URL 생성
   * - 카카오맵: https://map.kakao.com/link/search/{검색어}
   * - 네이버 지도: https://map.naver.com/v5/search/{검색어}
   * - 검색어는 encodeURIComponent()로 인코딩
   */
  const buildMapUrl = useCallback(
    (searchQuery: string): string => {
      const encodedQuery = encodeURIComponent(searchQuery);

      if (mapProvider === 'naver') {
        return `https://map.naver.com/v5/search/${encodedQuery}`;
      }

      // 기본값: 카카오맵
      return `https://map.kakao.com/link/search/${encodedQuery}`;
    },
    [mapProvider]
  );

  /**
   * 지도 열기
   * @description
   * 1. 거래 지역 정보가 있는지 확인
   * 2. 없으면 경고 메시지 표시 및 종료
   * 3. 있으면 검색어 생성
   * 4. 지도 URL 생성
   * 5. window.open()으로 새 창에서 열기
   */
  const openMap = useCallback(() => {
    try {
      // 브라우저 환경 확인
      if (typeof window === 'undefined') {
        return;
      }

      // 거래 지역 정보 확인
      if (!hasLocationInfo()) {
        message.warning('거래 지역 정보가 없습니다.');
        return;
      }

      // 검색어 생성
      const searchQuery = buildSearchQuery();
      if (!searchQuery || searchQuery.trim() === '') {
        message.warning('거래 지역 정보가 없습니다.');
        return;
      }

      // 지도 URL 생성
      const mapUrl = buildMapUrl(searchQuery);

      // 새 창으로 열기
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('지도 열기 실패:', error);
      message.error('지도를 열 수 없습니다. 다시 시도해주세요.');
    }
  }, [hasLocationInfo, buildSearchQuery, buildMapUrl]);

  return {
    openMap,
  };
}
