/**
 * phone-new 컴포넌트 타입 정의
 */

export interface IPhoneMediaMetadata {
  id: string;
  url: string;
  fileName: string;
  isPrimary: boolean;
}

/** 중고폰 폼 입력 필드 (react-hook-form용) */
export interface IPhoneFormInput {
  title: string;
  summary: string;
  description: string;
  price: number;
  tags: string;
  address: string;
  address_detail: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  mediaUrls: string[];
}

/** 중고폰 폼 데이터 구조 (로컬스토리지) */
export interface IPhoneFormData extends IPhoneFormInput {
  phoneId: string;
  mediaMeta: IPhoneMediaMetadata[];
  updatedAt: string;
}

/** 중고폰 폼 Props */
export interface IPhoneNewProps {
  isEdit?: boolean;
  phoneId?: string;
}

/** 우편번호 검색 결과 */
export interface IDaumPostcodeResult {
  address: string;
  zonecode: string;
  roadAddress?: string;
}

/** 판매 상태 */
export type SaleState = 'available' | 'reserved' | 'sold';

/** 제품 상태 모드 */
export type ProductMode = 'draft' | 'completed' | 'edit';

/** 제품 상태 인터페이스 */
export interface ProductState {
  title: string;
  summary: string;
  description: string;
  price: number;
  tags: string[];
  address: string;
  address_detail: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  categories: string[];
  sale_state: SaleState;
  mediaUrls: string[];
}
