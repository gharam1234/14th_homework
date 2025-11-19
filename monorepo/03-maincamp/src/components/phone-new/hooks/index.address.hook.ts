import { useEffect, useCallback } from 'react';
import { useAddressStore } from '../stores/address.store';
import type {
  AddressData,
  AddressSearchOptions,
  DaumAddressData,
  KakaoAddressResponse,
  KakaoReverseGeocodeResponse,
  Coordinates,
} from '../types/address.types';
import { isTestEnv } from '@/commons/utils/is-test-env';

const KAKAO_REST_API_KEY =
  process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || '';
const DAUM_POSTCODE_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const getTestAddressOverrides = () => {
  if (typeof window === 'undefined') return undefined;
  return window.__TEST_ADDRESS_OVERRIDES__;
};

function ensureKakaoApiKey() {
  if (!KAKAO_REST_API_KEY) {
    throw new Error('Kakao REST API 키가 설정되지 않았습니다.');
  }
  return KAKAO_REST_API_KEY;
}

function buildKakaoHeaders() {
  const key = ensureKakaoApiKey();
  return {
    Authorization: `KakaoAK ${key}`,
  };
}

function applyEmbedStyle(element: HTMLElement, style?: { width?: string; height?: string }) {
  if (!style) return;
  if (style.width) {
    element.style.width = style.width;
  }
  if (style.height) {
    element.style.height = style.height;
  }
}

/**
 * Daum 우편번호 스크립트 로드
 */
function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).daum?.Postcode) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = DAUM_POSTCODE_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Daum Postcode 스크립트 로드 실패'));
    document.head.appendChild(script);
  });
}

/**
 * Daum 주소 데이터를 AddressData 타입으로 변환
 */
function convertDaumAddressToAddressData(data: DaumAddressData): AddressData {
  return {
    zipCode: data.zonecode,
    roadAddress: data.roadAddress,
    jibunAddress: data.jibunAddress,
    address: data.address || data.roadAddress,
    detailAddress: '',
  };
}

/**
 * 주소 → 좌표 변환 (지오코딩)
 */
async function geocodeAddress(address: string): Promise<Coordinates> {
  if (isTestEnv()) {
    const overrides = getTestAddressOverrides();
    const match = overrides?.geocode?.[address];
    if (match) {
      return match;
    }
    throw new Error(overrides?.geocodeError ?? '주소를 찾을 수 없습니다');
  }

  const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
  url.searchParams.set('query', address);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url.toString(), {
      headers: buildKakaoHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('지오코딩 API 호출 실패');
    }

    const data: KakaoAddressResponse = await response.json();

    if (data.documents.length === 0) {
      throw new Error('주소를 찾을 수 없습니다');
    }

    const doc = data.documents[0];
    return {
      latitude: parseFloat(doc.y),
      longitude: parseFloat(doc.x),
    };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('네트워크 연결을 확인해주세요');
    }
    throw error;
  }
}

/**
 * 좌표 → 주소 변환 (역지오코딩)
 */
async function reverseGeocode(latitude: number, longitude: number): Promise<AddressData> {
  if (isTestEnv()) {
    const overrides = getTestAddressOverrides();
    const key = `${latitude},${longitude}`;
    const match = overrides?.reverse?.[key];
    if (match) {
      return match;
    }
    throw new Error(overrides?.reverseError ?? '좌표에 해당하는 주소를 찾을 수 없습니다');
  }

  const url = new URL('https://dapi.kakao.com/v2/local/geo/coord2address.json');
  url.searchParams.set('x', longitude.toString());
  url.searchParams.set('y', latitude.toString());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url.toString(), {
      headers: buildKakaoHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('역지오코딩 API 호출 실패');
    }

    const data: KakaoReverseGeocodeResponse = await response.json();

    if (data.documents.length === 0) {
      throw new Error('좌표에 해당하는 주소를 찾을 수 없습니다');
    }

    const doc = data.documents[0];
    const roadAddress = doc.road_address?.address_name || '';
    const jibunAddress = doc.address.address_name;

    return {
      zipCode: doc.road_address?.zone_no || doc.address.zip_code || '',
      roadAddress,
      jibunAddress,
      address: roadAddress || jibunAddress,
      detailAddress: '',
    };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('네트워크 연결을 확인해주세요');
    }
    throw error;
  }
}

/**
 * 주소 검색과 지오코딩을 통합한 훅
 */
export function useAddressGeocoding() {
  const {
    address,
    coordinates,
    isLoading,
    error,
    setAddress,
    setCoordinates,
    clearAddress,
    setLoading,
    setError,
  } = useAddressStore();

  /**
   * 주소 검색 팝업 또는 임베드 열기
   */
  const openAddressSearch = useCallback(
    async (options?: AddressSearchOptions) => {
      try {
        setLoading(true);
        setError(null);

        // Daum Postcode 스크립트 로드
        await loadDaumPostcodeScript();

        const postcode = new (window as any).daum.Postcode({
          oncomplete: async (data: DaumAddressData) => {
            try {
              const addressData = convertDaumAddressToAddressData(data);
              setAddress(addressData);

              const coords = await geocodeAddress(addressData.roadAddress);
              setCoordinates(coords);

              setLoading(false);
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : '주소를 찾을 수 없습니다';
              setError(errorMessage);
            }
          },
          onclose: () => {
            setLoading(false);
          },
        });

        if (options?.mode === 'embed') {
          const container = options.embedElement;
          if (!container) {
            throw new Error('Daum 우편번호 임베드를 위한 DOM 요소가 필요합니다.');
          }
          applyEmbedStyle(container, options.embedStyle);
          postcode.embed({
            element: container,
          });
          setLoading(false);
          return;
        }

        postcode.open();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '주소 검색 팝업을 열 수 없습니다';
        setError(errorMessage);
      }
    },
    [setAddress, setCoordinates, setLoading, setError]
  );

  /**
   * 좌표 수정 후 역지오코딩
   */
  const updateCoordinates = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoading(true);
        setError(null);

        // 좌표 먼저 저장
        const coords: Coordinates = { latitude: lat, longitude: lng };
        setCoordinates(coords);

        // 역지오코딩 실행
        const addressData = await reverseGeocode(lat, lng);
        setAddress(addressData);

        setLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '좌표 변환에 실패했습니다';
        setError(errorMessage);
      }
    },
    [setAddress, setCoordinates, setLoading, setError]
  );

  /**
   * 모든 상태 초기화
   */
  const clearAll = useCallback(() => {
    clearAddress();
  }, [clearAddress]);

  return {
    address,
    coordinates,
    isLoading,
    error,
    openAddressSearch,
    updateCoordinates,
    clearAll,
  };
}
