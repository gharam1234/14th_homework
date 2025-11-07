import type { Meta, StoryObj } from '@storybook/react';
import PhoneDetail from '../index';
import { PhoneDetail as PhoneDetailType } from '../types';

const meta = {
  title: 'Components/UsedPhoneDetail',
  component: PhoneDetail,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PhoneDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 중고폰 상세 페이지
 */
export const Default: Story = {
  args: {},
};

/**
 * 커스텀 데이터로 표시한 중고폰 상세 페이지
 */
export const WithCustomData: Story = {
  args: {
    data: {
      id: 'listing-002',
      title: '갤럭시 S23 울트라 512GB - 미스틱 블랙',
      price: 1090000,
      originalPrice: 1450000,
      description: `1년 미만 사용한 자급제 갤럭시 S23 울트라 512GB 모델입니다.

배터리 성능 93% 유지 중이며, 카메라/펜 모두 정상 작동합니다.

구성품:
• 구매 시 받았던 정품 박스 및 미사용 케이블
• 정품 S펜 추가 1개
• 강화유리 필름 2매 동봉

특이사항:
• 항상 케이스/필름 장착 후 사용하여 외관 흠집 거의 없음
• 삼성 케어 플러스 잔여 5개월
• 서울 전 지역 직거래 가능, 택배 거래 시 안전거래 필수`,
      category: '스마트폰',
      subcategory: '삼성',
      hashtags: ['#최신모델', '#A급중고', '#삼성케어'],
      seller: {
        id: 'seller-002',
        name: '삼성전문중고',
        rating: 4.9,
        totalSales: 567,
        responseRate: 99,
        location: '서울시 송파구 잠실동',
        latitude: 37.5112,
        longitude: 127.098,
        profileImage: '/images/프로필아이콘.png',
      },
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=640&h=480&fit=crop',
        'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1610945268337-9a1cdc0b1995?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1610945268385-5c85d5bdb0de?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1610945268396-113fa5bdbddf?w=180&h=136&fit=crop',
      ],
      mainImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=640&h=480&fit=crop',
      status: 'available',
      views: 5234,
      likes: 342,
      createdAt: '2025-11-04T10:30:00Z',
      updatedAt: '2025-11-04T10:30:00Z',
    } as PhoneDetailType,
  },
};

/**
 * 인기 중고폰
 */
export const PopularListing: Story = {
  args: {
    data: {
      id: 'listing-003',
      title: '아이폰 13 미니 128GB - 스칼렛',
      price: 520000,
      description: `컴팩트한 사이즈를 선호하시는 분께 추천드리는 아이폰 13 미니입니다.

배터리 90%, 전체적으로 생활 스크래치 정도만 있는 준수한 상태입니다.

판매 포인트:
• 자급제 모델, 통신사 락 없음
• 애플케어 만료, 사설 수리 이력 없음
• 서초/강남 직거래 가능, 지방 택배 거래 시 에스크로 진행`,
      category: '스마트폰',
      subcategory: '애플',
      hashtags: ['#작고가벼움', '#자급제', '#안전거래'],
      seller: {
        id: 'seller-003',
        name: '스마트폰덕후',
        rating: 4.95,
        totalSales: 1234,
        responseRate: 100,
        location: '서울시 서초구 서초동',
        latitude: 37.4836,
        longitude: 127.0327,
        profileImage: '/images/프로필아이콘.png',
      },
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&h=480&fit=crop',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1526045478516-99145907023c?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1533222535026-754c5015694b?w=180&h=136&fit=crop',
      ],
      mainImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&h=480&fit=crop',
      status: 'available',
      views: 12450,
      likes: 856,
      createdAt: '2025-11-04T10:30:00Z',
      updatedAt: '2025-11-04T10:30:00Z',
    } as PhoneDetailType,
  },
};
