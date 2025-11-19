'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// 상수 정의
const KAKAO_MAPS_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';
const DEFAULT_ZOOM_LEVEL = 5;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

const ERROR_MESSAGES = {
  API_LOAD_FAILED: 'Kakao Maps API를 불러오는데 실패했습니다.',
  SCRIPT_LOAD_FAILED: 'Kakao Maps 스크립트 로드에 실패했습니다.',
  NO_API_KEY: 'Kakao Maps API 키가 설정되지 않았습니다.',
  MAP_INIT_FAILED: '지도를 표시하는 중 오류가 발생했습니다.',
} as const;

/**
 * Kakao Maps 스크립트 로드 상태 관리
 * 
 * @description
 * 모듈 레벨 변수로 스크립트 중복 로드를 방지합니다.
 * 여러 컴포넌트에서 동시에 Hook을 호출해도 스크립트는 한 번만 로드됩니다.
 */

/**
 * 스크립트 로드 완료 여부
 * @type {boolean}
 */
let kakaoMapScriptLoaded = false;

/**
 * 스크립트 로딩 중 여부
 * @type {boolean}
 */
let kakaoMapScriptLoading = false;

/**
 * 로딩 완료 대기 중인 콜백 함수 배열
 * @type {Array<() => void>}
 * @description 스크립트 로딩 중에 추가로 Hook이 호출되면 콜백을 등록하여 로드 완료 시 일괄 실행
 */
const scriptLoadCallbacks: (() => void)[] = [];

/**
 * 좌표 정보 인터페이스
 */
export interface MapCoordinates {
  /** 위도 (-90 ~ 90, null 허용) */
  latitude: number | null;
  /** 경도 (-180 ~ 180, null 허용) */
  longitude: number | null;
  /** 기본 주소 */
  address: string;
  /** 상세 주소 */
  addressDetail: string;
}

/**
 * Hook 반환 타입
 */
export interface UseKakaoMapReturn {
  /** 지도 컨테이너 DOM 참조 */
  mapContainerRef: React.RefObject<HTMLDivElement>;
  /** 지도 로드 완료 여부 */
  isMapLoaded: boolean;
  /** 에러 메시지 (없으면 null) */
  mapError: string | null;
  /** 좌표 유효성 검사 결과 */
  isValidCoordinates: boolean;
  /** 마커 객체 참조 (추가 기능 구현 시 사용) - Kakao Maps API 타입 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markerRef: React.RefObject<any>;
  /** InfoWindow 객체 참조 - Kakao Maps API 타입 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infoWindowRef: React.RefObject<any>;
}

/**
 * Kakao Maps API 스크립트를 동적으로 로드하는 함수
 * 
 * @description
 * 중복 로드를 방지하고, 이미 로드 중이면 콜백으로 처리합니다.
 * 
 * 동작 과정:
 * 1. 이미 로드 완료된 경우: 즉시 resolve
 * 2. 로딩 중인 경우: 콜백 큐에 등록 후 대기
 * 3. 새로 로드하는 경우: script 태그 생성 및 head에 추가
 * 4. 로드 완료 시: 대기 중인 모든 콜백 실행
 * 
 * @param apiKey - Kakao Maps API 키 (환경변수에서 로드)
 * @returns Promise<void> - 스크립트 로드 완료 또는 실패
 * @throws {Error} Kakao Maps API 로드 실패 시
 */
const loadKakaoMapScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (kakaoMapScriptLoaded && window.kakao?.maps) {
      resolve();
      return;
    }

    // 로딩 중인 경우 콜백 등록
    if (kakaoMapScriptLoading) {
      scriptLoadCallbacks.push(() => resolve());
      return;
    }

    // 새로 로드 시작
    kakaoMapScriptLoading = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `${KAKAO_MAPS_SDK_URL}?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => {
          kakaoMapScriptLoaded = true;
          kakaoMapScriptLoading = false;
          resolve();
          // 대기 중인 콜백 실행
          scriptLoadCallbacks.forEach((callback) => callback());
          scriptLoadCallbacks.length = 0;
        });
      } else {
        kakaoMapScriptLoading = false;
        reject(new Error(ERROR_MESSAGES.API_LOAD_FAILED));
      }
    };

    script.onerror = () => {
      kakaoMapScriptLoading = false;
      reject(new Error(ERROR_MESSAGES.SCRIPT_LOAD_FAILED));
    };

    document.head.appendChild(script);
  });
};

/**
 * 좌표가 유효한지 검증하는 함수
 * 
 * @description
 * 위도와 경도의 유효성을 검사합니다.
 * - latitude: -90 ~ 90 범위
 * - longitude: -180 ~ 180 범위
 * - null, NaN, 타입 오류 검증
 * 
 * @param latitude - 위도 (null 허용)
 * @param longitude - 경도 (null 허용)
 * @returns 유효한 좌표이면 true, 그렇지 않으면 false
 */
export const validateCoordinates = (
  latitude: number | null,
  longitude: number | null
): boolean => {
  if (latitude === null || longitude === null) return false;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  
  // 위도는 -90 ~ 90, 경도는 -180 ~ 180 범위
  if (latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) return false;
  if (longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) return false;
  
  return true;
};

/**
 * Kakao Maps를 초기화하고 관리하는 커스텀 훅
 * 
 * @description
 * 좌표 정보를 받아 Kakao Maps를 렌더링하고 마커를 표시합니다.
 * 
 * 주요 기능:
 * 1. 좌표 유효성 검증 (위도: -90~90, 경도: -180~180)
 * 2. Kakao Maps API 스크립트 동적 로드 (중복 방지)
 * 3. 지도 초기화 및 중심 좌표 설정
 * 4. 마커 생성 및 표시
 * 5. InfoWindow 생성 (주소 정보 표시)
 * 6. 마커 클릭 시 InfoWindow 토글 기능
 * 7. Cleanup 로직으로 메모리 누수 방지
 * 
 * @param coordinates - 좌표 및 주소 정보
 * @param coordinates.latitude - 위도 (null 가능)
 * @param coordinates.longitude - 경도 (null 가능)
 * @param coordinates.address - 기본 주소
 * @param coordinates.addressDetail - 상세 주소
 * 
 * @returns Hook 반환 객체
 * @returns mapContainerRef - 지도 컨테이너 DOM 참조
 * @returns isMapLoaded - 지도 로드 완료 여부
 * @returns mapError - 에러 메시지 (없으면 null)
 * @returns isValidCoordinates - 좌표 유효성 검사 결과
 * @returns markerRef - 마커 객체 참조 (추가 기능 구현 시 사용)
 * @returns infoWindowRef - InfoWindow 객체 참조
 * 
 * @example
 * ```tsx
 * const {
 *   mapContainerRef,
 *   isMapLoaded,
 *   mapError,
 *   isValidCoordinates,
 * } = useKakaoMap({
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 *   address: '서울시 중구',
 *   addressDetail: '태평로1가',
 * });
 * 
 * return (
 *   <div>
 *     {isValidCoordinates && (
 *       <div ref={mapContainerRef} id="kakaoMap" />
 *     )}
 *     {mapError && <p>{mapError}</p>}
 *   </div>
 * );
 * ```
 */
export function useKakaoMap(coordinates: MapCoordinates): UseKakaoMapReturn {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Kakao Maps API 객체는 외부 라이브러리로 타입 정의가 불완전하여 any 사용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoWindowRef = useRef<any>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { latitude, longitude, address, addressDetail } = coordinates;
  const isValidCoordinates = validateCoordinates(latitude, longitude);

  /**
   * 지도 초기화 함수
   * 
   * @description
   * Kakao Maps API를 사용하여 지도, 마커, InfoWindow를 초기화합니다.
   * 
   * 동작 과정:
   * 1. 좌표 유효성 및 DOM 참조 확인
   * 2. Kakao Maps API 로드 확인
   * 3. 지도 옵션 설정 (중심 좌표, 줌 레벨)
   * 4. 지도 객체 생성
   * 5. 마커 생성 및 지도에 추가
   * 6. InfoWindow 생성 (주소 정보)
   * 7. 마커 클릭 이벤트 리스너 등록
   * 8. 로드 완료 상태 업데이트
   * 9. 에러 발생 시 에러 상태 업데이트
   */
  const initializeMap = useCallback(() => {
    if (!isValidCoordinates || !mapContainerRef.current) return;
    if (!window.kakao?.maps) return;

    try {
      const { kakao } = window;
      
      // 지도 옵션 설정
      const options = {
        center: new kakao.maps.LatLng(latitude!, longitude!),
        level: DEFAULT_ZOOM_LEVEL, // 줌 레벨 (1~14, 작을수록 확대)
      };

      // 지도 생성
      const map = new kakao.maps.Map(mapContainerRef.current, options);
      mapInstanceRef.current = map;

      // 마커 생성
      const markerPosition = new kakao.maps.LatLng(latitude!, longitude!);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
      });
      markerRef.current = marker;

      // InfoWindow 생성 (주소 정보 표시)
      const fullAddress = addressDetail 
        ? `${address} ${addressDetail}` 
        : address;
      
      const infoWindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:8px 12px;font-size:14px;white-space:nowrap;">${fullAddress}</div>`,
        removable: false,
      });
      infoWindowRef.current = infoWindow;

      // 마커 클릭 이벤트 - InfoWindow 표시/숨김 토글
      let isInfoWindowOpen = false;
      kakao.maps.event.addListener(marker, 'click', () => {
        if (isInfoWindowOpen) {
          infoWindow.close();
          isInfoWindowOpen = false;
        } else {
          infoWindow.open(map, marker);
          isInfoWindowOpen = true;
        }
      });

      setIsMapLoaded(true);
      setMapError(null);
    } catch (error) {
      console.error('지도 초기화 중 오류:', error);
      setMapError(ERROR_MESSAGES.MAP_INIT_FAILED);
      setIsMapLoaded(false);
    }
  }, [isValidCoordinates, latitude, longitude, address, addressDetail]);

  /**
   * Kakao Maps API 로드 및 지도 초기화
   */
  useEffect(() => {
    if (!isValidCoordinates) {
      setIsMapLoaded(false);
      setMapError(null);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!apiKey) {
      setMapError(ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    // 스크립트 로드 및 지도 초기화
    loadKakaoMapScript(apiKey)
      .then(() => {
        initializeMap();
      })
      .catch((error) => {
        console.error('Kakao Maps 로드 실패:', error);
        setMapError(error.message || ERROR_MESSAGES.API_LOAD_FAILED);
        setIsMapLoaded(false);
      });

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [isValidCoordinates, initializeMap]);

  return {
    mapContainerRef,
    isMapLoaded,
    mapError,
    isValidCoordinates,
    markerRef,
    infoWindowRef,
  };
}

/**
 * 글로벌 타입 확장 (window.kakao)
 * 
 * @description
 * Kakao Maps API는 타입 정의가 제공되지 않는 외부 라이브러리입니다.
 * 최소한의 타입 정의만 제공하며, 복잡한 객체는 any로 처리합니다.
 */
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LatLng: new (lat: number, lng: number) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Map: new (container: HTMLElement, options: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Marker: new (options: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        InfoWindow: new (options: any) => any;
        event: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addListener: (target: any, type: string, callback: () => void) => void;
        };
      };
    };
  }
}

