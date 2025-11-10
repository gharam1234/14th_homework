/**
 * 중고폰 마켓플레이스 공용 타입 정의
 */

/**
 * 특별 프로모션 배너 데이터 구조
 */
export interface PromotionalBanner {
  id: string;
  phoneModel: string;            // "iPhone 14 Pro"
  condition: "새것" | "중고" | "미개봉";
  originalPrice: number;         // 1500000
  salePrice: number;             // 1180000
  backgroundImageUrl: string;    // 배너 배경 이미지
  badges: string[];              // ["안전거래 인증", "A급 조건", "즉시 구매 가능"]
  description?: string;          // "당장 가고 싶은 숙소" 스타일
}

/**
 * 중고폰 카드 데이터 구조
 */
export interface IPhoneCard {
  title: string;
  description: string;
  tags: string;
  price: string;
  sellerName: string;
  imageUrl?: string;
  likeCount?: number;
}

/**
 * 라우팅 정보를 포함한 중고폰 카드
 */
export interface IPhoneCardWithRouting extends IPhoneCard {
  phoneId?: string | number;
  onCardClick?: (phoneId: string | number) => void;
}
