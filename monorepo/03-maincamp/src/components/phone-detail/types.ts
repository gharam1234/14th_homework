/**
 * Supabase 데이터 타입 정의
 */

/**
 * Supabase phones 테이블 스키마
 */
export interface Phone {
  id: string;
  model_name: string;
  condition: '미개봉' | '새것' | '중고';
  price: number;
  original_price: number;
  main_image_url?: string;
  images_urls: string[];
  battery_health: number;
  seller_id: string;
}

/**
 * Supabase sellers 테이블 스키마
 */
export interface Seller {
  id: string;
  nickname: string;
}

/**
 * Phone + Seller 조인 결과
 */
export interface PhoneWithSeller extends Phone {
  seller: Seller;
}

/**
 * 데이터 페칭 훅 반환 타입
 */
export interface UseFetchPhoneDetailResult {
  phone: PhoneWithSeller | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 문의 컴포넌트 타입 정의
 */

/**
 * 문의 항목
 */
export interface InquiryItem {
  id: string;
  profileName: string;
  profileImage?: string;
  content: string;
  createdAt: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 문의하기 컴포넌트 Props
 */
export interface PhonesInquiryProps {
  inquiries?: InquiryItem[];
  onSubmit?: (content: string) => void;
  placeholderText?: string;
  maxLength?: number;
}
