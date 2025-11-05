/**
 * 토큰 상세 페이지 타입 정의
 */

/**
 * 판매자 정보
 */
export interface TokenSeller {
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
 * 토큰 상세 정보
 */
export interface TokenDetail {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subcategory: string;
  hashtags: string[];
  seller: TokenSeller;
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
  tokenId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

/**
 * 컴포넌트 Props
 */
export interface TokenDetailProps {
  tokenId?: string;
  data?: TokenDetail;
  onChat?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
}
