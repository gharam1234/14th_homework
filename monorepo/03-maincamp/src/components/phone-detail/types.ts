/**
 * Supabase 데이터 타입 정의
 */

export type PhoneCondition = '미개봉' | '새것' | '중고';

/**
 * Supabase phones 테이블 스키마
 */
export interface Phone {
  id: string;
  model_name: string;
  title?: string | null;
  description?: string | null;
  hashtags?: string[] | null;
  condition: PhoneCondition;
  price: number;
  original_price?: number | null;
  main_image_url?: string | null;
  images_urls: string[];
  battery_health?: number | null;
  seller_id: string;
  bookmark_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  manufacturer?: string | null;
  release_year?: number | null;
  ram?: string | null;
  storage?: string | null;
  color?: string | null;
}

/**
 * Supabase sellers 테이블 스키마
 */
export interface Seller {
  id: string;
  nickname: string;
  location?: string | null;
  profile_image_url?: string | null;
}

/**
 * Phone + Seller 조인 결과
 */
export interface PhoneWithSeller extends Phone {
  seller: Seller | null;
}

/**
 * 스토리북 및 로컬 더미 데이터 타입
 */
export interface PhoneDetail {
  id: string;
  title: string;
  model_name?: string;
  description: string;
  category?: string;
  subcategory?: string;
  hashtags?: string[];
  condition?: PhoneCondition;
  batteryHealth?: number | null;
  price: number;
  originalPrice?: number | null;
  seller: {
    id: string;
    name?: string;
    nickname?: string;
    location?: string;
  };
  images: string[];
  mainImage?: string;
  likes?: number;
}

/**
 * PhoneDetail 컴포넌트 Props
 */
export interface PhoneDetailProps {
  data?: PhoneWithSeller | PhoneDetail | null;
  isLoading?: boolean;
  onShare?: () => Promise<void> | void;
  onBookmark?: (payload: { isBookmarked: boolean; bookmarkCount: number }) => void;
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
