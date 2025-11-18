/**
 * 주소 데이터 인터페이스
 */
export interface AddressData {
  zipCode: string; // 우편번호
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  address: string; // 기본 주소
  detailAddress?: string; // 상세 주소 (선택)
}

/**
 * 좌표 데이터 인터페이스
 */
export interface Coordinates {
  latitude: number; // 위도
  longitude: number; // 경도
}

/**
 * 주소 스토어 인터페이스
 */
export interface AddressStore {
  address: AddressData | null;
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  setAddress: (address: AddressData) => void;
  setCoordinates: (coords: Coordinates) => void;
  clearAddress: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Daum 주소 검색 방식
 */
export type AddressSearchMode = 'popup' | 'embed';

/**
 * Daum 우편번호 검색 옵션
 */
export interface AddressSearchOptions {
  mode?: AddressSearchMode;
  embedElement?: HTMLElement | null;
  embedStyle?: {
    width?: string;
    height?: string;
  };
}

/**
 * Daum 우편번호 API 응답 타입
 */
export interface DaumAddressData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  address: string;
  addressEnglish?: string;
  addressType?: string;
  userSelectedType?: string;
  noSelected?: string;
  userLanguageType?: string;
  roadAddressEnglish?: string;
  jibunAddressEnglish?: string;
  autoRoadAddress?: string;
  autoJibunAddress?: string;
  buildingCode?: string;
  buildingName?: string;
  apartment?: string;
}

/**
 * 카카오 주소 검색 API 응답 타입
 */
export interface KakaoAddressResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: Array<{
    address_name: string;
    address_type: string;
    x: string; // 경도
    y: string; // 위도
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      mountain_yn: string;
      main_address_no: string;
      sub_address_no: string;
      zip_code: string;
    };
    road_address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: string;
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
    } | null;
  }>;
}

/**
 * 카카오 역지오코딩 API 응답 타입
 */
export interface KakaoReverseGeocodeResponse {
  meta: {
    total_count: number;
  };
  documents: Array<{
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      mountain_yn: string;
      main_address_no: string;
      sub_address_no: string;
      zip_code: string;
    };
    road_address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: string;
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
    } | null;
  }>;
}
