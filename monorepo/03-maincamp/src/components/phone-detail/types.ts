/**
 * 중고폰 상세 페이지 타입 정의
 */

/**
 * 판매자 정보
 */
export interface PhoneSeller {
  id: string;
  name: string;
  rating: number;
  totalSales: number;
  responseRate: number;
  location: string;
  latitude: number;
  longitude: number;
  profileImage: string;
}

/**
 * 중고폰 상세 정보
 */
export interface PhoneDetail {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subcategory: string;
  hashtags: string[];
  seller: PhoneSeller;
  images: string[];
  mainImage: string;
  status: 'available' | 'sold' | 'reserved';
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  features?: string[];
  specifications?: Record<string, string>;
}

/**
 * 문의 메시지
 */
export interface InquiryMessage {
  id: string;
  phoneId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

/**
 * 컴포넌트 Props
 */
export interface PhoneDetailProps {
  phoneId?: string;
  data?: PhoneDetail;
  onShare?: () => void;
  userEmail?: string;
}
