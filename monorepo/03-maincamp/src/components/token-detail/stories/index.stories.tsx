import type { Meta, StoryObj } from '@storybook/react';
import TokenDetail from '../index';
import { TokenDetail as TokenDetailType } from '../types';

const meta = {
  title: 'Components/TokenDetail',
  component: TokenDetail,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TokenDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 토큰 상세 페이지
 */
export const Default: Story = {
  args: {},
};

/**
 * 커스텀 데이터로 표시한 토큰 상세 페이지
 */
export const WithCustomData: Story = {
  args: {
    data: {
      id: 'token-002',
      title: 'Premium Claude Code Token - Pro Edition',
      price: 89000,
      originalPrice: 120000,
      description: `이것은 프리미엄 버전의 클로드 코드 토큰입니다.

더 빠른 응답 속도와 향상된 기능이 포함되어 있습니다.

주요 개선 사항:
• 50% 더 빠른 응답 속도
• 고급 분석 기능
• 우선 지원
• 무제한 사용`,
      category: '클로드코드',
      subcategory: '개발 도구',
      hashtags: ['#프리미엄', '#빠른속도', '#강력함'],
      seller: {
        id: 'seller-002',
        name: '프리미엄 판매자',
        rating: 4.9,
        totalSales: 567,
        responseRate: 99,
        location: '서울시 강남구 압구정로',
        latitude: 37.5265,
        longitude: 127.0321,
        profileImage: '/images/프로필아이콘.png',
      },
      images: [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
      ],
      mainImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop',
      status: 'available',
      views: 5234,
      likes: 342,
      createdAt: '2025-11-04T10:30:00Z',
      updatedAt: '2025-11-04T10:30:00Z',
    } as TokenDetailType,
  },
};

/**
 * 인기 토큰
 */
export const PopularToken: Story = {
  args: {
    data: {
      id: 'token-003',
      title: 'Bestseller Token - Cursor Integration',
      price: 35000,
      description: `가장 인기 있는 토큰입니다!

수천 명의 개발자들이 이미 사용 중이며, 매우 높은 만족도를 얻고 있습니다.

이 토큰의 특징:
• 검증된 품질
• 커뮤니티 지원
• 정기적인 업데이트
• 최고의 가성비`,
      category: '클로드코드',
      subcategory: '개발 도구',
      hashtags: ['#베스트셀러', '#인기', '#추천'],
      seller: {
        id: 'seller-003',
        name: '최고 평점 판매자',
        rating: 4.95,
        totalSales: 1234,
        responseRate: 100,
        location: '서울시 서초구 테헤란로',
        latitude: 37.4859,
        longitude: 127.0181,
        profileImage: '/images/프로필아이콘.png',
      },
      images: [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
      ],
      mainImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop',
      status: 'available',
      views: 12450,
      likes: 856,
      createdAt: '2025-11-04T10:30:00Z',
      updatedAt: '2025-11-04T10:30:00Z',
    } as TokenDetailType,
  },
};
