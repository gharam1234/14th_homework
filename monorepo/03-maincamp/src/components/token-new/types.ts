/**
 * token-new 컴포넌트 타입 정의
 */

/** 토큰 폼 데이터 구조 (로컬스토리지) */
export interface ITokenFormData {
  tokenId: string;
  title: string;
  summary: string;
  description: string;
  price: string;
  tags: string;
  address: string;
  postalCode: string;
  detailedAddress: string;
  latitude: string;
  longitude: string;
  images: string[];
}

/** 토큰 폼 입력 필드 (react-hook-form용) */
export interface ITokenFormInput {
  title: string;
  summary: string;
  description: string;
  price: string;
  tags: string;
  address: string;
  postalCode: string;
  detailedAddress: string;
  latitude: string;
  longitude: string;
  images: string[];
}

/** 토큰 폼 Props */
export interface ITokenNewProps {
  isEdit?: boolean;
  tokenId?: string;
}

/** 우편번호 검색 결과 */
export interface IDaumPostcodeResult {
  address: string;
  zonecode: string;
  roadAddress?: string;
}
