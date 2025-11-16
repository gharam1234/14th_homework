'use client';

import { useCallback } from 'react';
import styles from './styles.module.css';
import { PhoneDetail as PhoneDetailType, PhoneDetailProps } from './types';
import { useBookmark } from './hooks/index.bookmark.hook';
import { useDelete } from './hooks/index.delete.hook';
import Modal from '@commons/ui/src/modal';

/**
 * PhoneDetail - Figma 디자인 기반 프레젠테이션 컴포넌트
 *
 * @description 중고폰 상세 페이지를 표시하는 UI 컴포넌트입니다.
 * Props로 데이터만 받아서 표시하며, 기능은 부모 컴포넌트에서 구현합니다.
 * @param props - 컴포넌트 속성 (data: 중고폰 정보)
 */

/**
 * 더미 중고폰 데이터
 */
const DUMMY_PHONE_DATA: PhoneDetailType = {
  id: 'listing-001',
  title: '아이폰 14 Pro 256GB 퍼플 - A급 상태',
  price: 1180000,
  originalPrice: 1390000,
  description: `정식 출시 이후 1년간 사용한 아이폰 14 Pro 퍼플 색상 256GB 모델입니다.

생활 기스 거의 없는 A급 상태이며, 보호필름 및 케이스 착용 후 사용했습니다.

포함 구성품:
• 정품 박스 및 미사용 기본 구성품
• 애플 정품 20W 어댑터
• 투명 실리콘 케이스 2개

점검 내용:
• 배터리 성능 91%
• Face ID 및 카메라 모두 정상 작동
• 통신 3사 자급제 모델로 잔여 할부 없음

합정/홍대 부근 직거래 선호하며, 택배 거래 시 안전거래(에스크로)만 진행합니다.`,
  category: '스마트폰',
  subcategory: '애플',
  hashtags: ['#A급', '#중고폰', '#직거래선호'],
  seller: {
    id: 'seller-001',
    name: '믿음직한 중고폰샵',
    rating: 4.8,
    totalSales: 412,
    responseRate: 98,
    location: '서울시 마포구 합정동',
    latitude: 37.5495,
    longitude: 126.9144,
    profileImage: '/images/프로필아이콘.png',
  },
  images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
    'https://images.unsplash.com/photo-1512493017640-c2f999018b72?w=180&h=136&fit=crop',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=180&h=136&fit=crop',
    'https://images.unsplash.com/photo-1519228466311-244566c20b72?w=180&h=136&fit=crop',
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=180&h=136&fit=crop',
  ],
  mainImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop',
  status: 'available',
  views: 3275,
  likes: 188,
  createdAt: '2025-02-18T10:30:00Z',
  updatedAt: '2025-02-20T09:15:00Z',
};

/**
 * 중고폰 상세 페이지 컴포넌트
 */
export default function PhoneDetail({ data = DUMMY_PHONE_DATA, onShare, phoneId }: PhoneDetailProps) {
  const phoneData = data || DUMMY_PHONE_DATA;

  // 북마크 훅 사용
  const { isBookmarked, toggleBookmark } = useBookmark(
    phoneId || phoneData.id,
    false
  );

  // 삭제 훅 사용
  const { isDeleting, deletePhone, showDeleteModal, hideDeleteModal, isModalOpen } = useDelete(
    phoneId || phoneData.id
  );

  return (
    <div className={styles.body} data-testid="phone-detail-body">
      <div className={styles.container} data-testid="phone-detail-container">
        {/* === 헤더 섹션 === */}
        <section className={styles.headerSection} data-testid="header-section">
          {/* 제목 및 액션 버튼 */}
          <div className={styles.titleArea} data-testid="title-area">
            <div className={styles.titleHeader}>
              <div className={styles.titleRow}>
                <h1 className={styles.title} data-testid="phone-detail-title">{phoneData.title}</h1>
                <div className={styles.actionButtons} data-testid="action-buttons">
                  {/* 삭제 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="삭제"
                    onClick={showDeleteModal}
                    data-testid="delete-button"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 공유 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="공유"
                    onClick={onShare}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.15c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.44 9.31 6.77 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.77 0 1.44-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 위치 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="위치"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 북마크 배지 */}
                  <div className={styles.bookmarkBadge} data-testid="bookmark-badge">
                    <button
                      className={styles.iconButton}
                      title="북마크"
                      onClick={toggleBookmark}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M17 3H5c-1.11 0-2 .9-2 2v16l7-3 7 3V5c0-1.1.89-2 2-2z"
                          fill={isBookmarked ? '#ff6b6b' : 'none'}
                          stroke={isBookmarked ? '#ff6b6b' : '#ffffff'}
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <p className={styles.bookmarkCount}>{phoneData.likes}</p>
                  </div>
                </div>
              </div>
              <p className={styles.subtitle}>{phoneData.seller.name}의 믿을 수 있는 중고폰 거래</p>
              <p className={styles.hashtags}>{phoneData.hashtags.join(' ')}</p>
            </div>

            {/* 이미지 갤러리 */}
            <div className={styles.imageGallery} data-testid="image-gallery">
              {/* 메인 이미지 */}
              <div className={styles.mainImageWrapper} data-testid="main-image-wrapper">
                <img
                  src={phoneData.mainImage}
                  alt="메인 이미지"
                  className={styles.mainImage}
                />
              </div>

              {/* 썸네일 */}
              <div className={styles.thumbnailWrapper} data-testid="thumbnail-wrapper">
                {phoneData.images.slice(1).map((image, index) => (
                  <div key={index} className={`${styles.thumbnail} ${index > 0 ? styles.thumbnailInactive : ''}`}>
                    <img
                      src={image}
                      alt={`썸네일 ${index + 1}`}
                      className={styles.thumbnailImage}
                    />
                  </div>
                ))}
                <div className={styles.thumbnailGradient} />
              </div>
            </div>
          </div>
        </section>

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 상세 설명 섹션 === */}
        <section className={styles.descriptionSection} data-testid="description-section">
          <h2 className={styles.sectionTitle}>상세 설명</h2>
          <div className={styles.descriptionContent}>
            {phoneData.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </section>

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 위치 섹션 === */}
        <section className={styles.locationSection} data-testid="location-section">
          <h2 className={styles.sectionTitle}>상세 위치</h2>
          <div className={styles.mapContainer} data-testid="map-container">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=844&h=280&fit=crop"
              alt="판매자 위치"
              className={styles.mapImage}
            />
          </div>
        </section>
      </div>

      {/* 삭제 확인 모달 */}
      {isModalOpen && (
        <Modal
          variant="danger"
          actions="dual"
          title="삭제 확인"
          description="정말로 이 판매 글을 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={deletePhone}
          onCancel={hideDeleteModal}
        />
      )}
    </div>
  );
}
