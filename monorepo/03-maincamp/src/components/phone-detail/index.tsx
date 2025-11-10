'use client';

import { useEffect } from 'react';
import styles from './styles.module.css';
import { PhoneDetail as PhoneDetailType, PhoneDetailProps, PhoneWithSeller } from './types';
import { useImageGallery } from './hooks/index.gallery.hook';

/**
 * 할인율 계산
 */
const calculateDiscountRate = (price: number, originalPrice: number): number => {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

/**
 * 조건별 해시태그 생성
 */
const generateHashtags = (phone: PhoneWithSeller): string[] => {
  const hashtags: string[] = [];

  // condition 기반 해시태그
  switch (phone.condition) {
    case '미개봉':
      hashtags.push('#미개봉');
      break;
    case '새것':
      hashtags.push('#새제품');
      break;
    case '중고':
      hashtags.push('#중고');
      break;
  }

  // battery_health 기반 해시태그
  if (phone.battery_health >= 80) {
    hashtags.push('#배터리 좋음');
  } else if (phone.battery_health < 50) {
    hashtags.push('#배터리 나쁨');
  }

  return hashtags;
};

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
 * @param data - 폰 데이터 (PhoneWithSeller 타입, 기본값: DUMMY_PHONE_DATA)
 * @param onShare - 공유 버튼 클릭 핸들러
 */
export default function PhoneDetail({ data = DUMMY_PHONE_DATA, onShare }: PhoneDetailProps & { data?: PhoneWithSeller }) {
  const phoneData = data || DUMMY_PHONE_DATA;
  const discountRate = calculateDiscountRate(phoneData.price, phoneData.original_price);
  const hashtags = phoneData && 'battery_health' in phoneData ? generateHashtags(phoneData as PhoneWithSeller) : [];

  // 이미지 갤러리 훅
  const {
    currentMainImage,
    selectedThumbnailIndex,
    isZoomModalOpen,
    zoomLevel,
    isImageLoading,
    imageError,
    selectThumbnail,
    nextThumbnail,
    prevThumbnail,
    openZoomModal,
    closeZoomModal,
    zoomIn,
    zoomOut,
    handleImageLoad,
    handleImageError,
    handleTouchStart,
    handleTouchEnd,
  } = useImageGallery({
    mainImageUrl: phoneData.mainImage || phoneData.images?.[0],
    imageUrls: phoneData.images || [],
  });

  // ESC 키 처리
  useEffect(() => {
    if (!isZoomModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeZoomModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomModalOpen, closeZoomModal]);

  return (
    <div className={styles.body} data-testid="phone-detail-body">
      <div className={styles.container} data-testid="phone-detail-container">
        {/* === 헤더 섹션 === */}
        <section className={styles.headerSection} data-testid="header-section">
          {/* 제목 및 액션 버튼 */}
          <div className={styles.titleArea} data-testid="title-area">
            <div className={styles.titleHeader}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{phoneData.title}</h1>
                <div className={styles.actionButtons} data-testid="action-buttons">
                  {/* 삭제 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="삭제"
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
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M17 3H5c-1.11 0-2 .9-2 2v16l7-3 7 3V5c0-1.1.89-2 2-2z"
                          fill="none"
                          stroke="#ffffff"
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
            <div
              className={styles.imageGallery}
              data-testid="image-gallery"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* 메인 이미지 */}
              <div
                className={styles.mainImageWrapper}
                data-testid="gallery-main-image"
                onClick={openZoomModal}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {isImageLoading && (
                  <div
                    data-testid="image-loading"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                  >
                    <div style={{ animation: 'spin 1s linear infinite', width: '40px', height: '40px' }}>
                      ⏳
                    </div>
                  </div>
                )}
                {imageError && (
                  <div
                    data-testid="image-error"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#999',
                      fontSize: '14px',
                      zIndex: 10,
                    }}
                  >
                    {imageError}
                  </div>
                )}
                <img
                  src={currentMainImage}
                  alt="메인 이미지"
                  className={styles.mainImage}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  data-testid="main-image-img"
                />
              </div>

              {/* 썸네일 슬라이더 */}
              <div className={styles.thumbnailWrapper} data-testid="thumbnail-wrapper">
                {/* 좌측 화살표 */}
                <button
                  className={styles.navButton}
                  onClick={prevThumbnail}
                  disabled={selectedThumbnailIndex === 0}
                  data-testid="thumbnail-prev-btn"
                  title="이전 이미지"
                  style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
                >
                  ◀
                </button>

                {/* 썸네일 컨테이너 */}
                <div
                  className={styles.thumbnailContainer}
                  data-testid="thumbnail-container"
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '8px',
                    padding: '0 40px',
                    scrollBehavior: 'smooth',
                  }}
                >
                  {phoneData.images.map((image, index) => (
                    <button
                      key={index}
                      className={`${styles.thumbnail} ${selectedThumbnailIndex === index ? styles.thumbnailActive : ''}`}
                      onClick={() => selectThumbnail(index)}
                      data-testid={`thumbnail-item-${index}`}
                      style={{
                        minWidth: '80px',
                        height: '80px',
                        border: selectedThumbnailIndex === index ? '2px solid #333' : '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={image}
                        alt={`썸네일 ${index + 1}`}
                        className={styles.thumbnailImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>

                {/* 우측 화살표 */}
                <button
                  className={styles.navButton}
                  onClick={nextThumbnail}
                  disabled={selectedThumbnailIndex === phoneData.images.length - 1}
                  data-testid="thumbnail-next-btn"
                  title="다음 이미지"
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                >
                  ▶
                </button>

                <div className={styles.thumbnailGradient} />
              </div>

              {/* 줌 모달 */}
              {isZoomModalOpen && (
                <div
                  className={styles.zoomModal}
                  data-testid="zoom-modal"
                  onClick={closeZoomModal}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                  }}
                >
                  {/* 줌 이미지 */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'relative',
                      width: '80%',
                      height: '80%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'auto',
                    }}
                  >
                    <img
                      src={currentMainImage}
                      alt="줌 이미지"
                      data-testid="zoom-image"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.2s ease-out',
                        cursor: 'move',
                      }}
                    />
                  </div>

                  {/* 줌 컨트롤 */}
                  <div
                    className={styles.zoomControls}
                    data-testid="zoom-controls"
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: '10px 20px',
                      borderRadius: '4px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={zoomOut}
                      disabled={zoomLevel <= 1}
                      data-testid="zoom-out-btn"
                      style={{
                        padding: '8px 12px',
                        cursor: zoomLevel > 1 ? 'pointer' : 'not-allowed',
                        opacity: zoomLevel > 1 ? 1 : 0.5,
                      }}
                    >
                      −
                    </button>
                    <span
                      data-testid="zoom-level"
                      style={{ color: '#fff', padding: '8px 12px', minWidth: '60px', textAlign: 'center' }}
                    >
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      disabled={zoomLevel >= 3}
                      data-testid="zoom-in-btn"
                      style={{
                        padding: '8px 12px',
                        cursor: zoomLevel < 3 ? 'pointer' : 'not-allowed',
                        opacity: zoomLevel < 3 ? 1 : 0.5,
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* 닫기 버튼 */}
                  <button
                    onClick={closeZoomModal}
                    data-testid="zoom-close-btn"
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      padding: '10px 15px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 기본 정보 섹션 === */}
        <section className={styles.basicInfoSection} data-testid="basic-info-section">
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.basicInfoContent}>
            {/* 모델명 */}
            <div className={styles.basicInfoItem}>
              <p className={styles.basicInfoLabel}>모델명</p>
              <p className={styles.modelName} data-testid="model-name">
                {phoneData.model_name}
              </p>
            </div>

            {/* 상태 및 가격 행 */}
            <div className={styles.basicInfoRow}>
              {/* 상태 */}
              <div className={styles.basicInfoItem}>
                <p className={styles.basicInfoLabel}>상태</p>
                <div className={styles.condition}>{phoneData.condition}</div>
              </div>

              {/* 가격 정보 */}
              <div className={styles.basicInfoItem}>
                <p className={styles.basicInfoLabel}>판매가</p>
                <div className={styles.priceInfo}>
                  <p className={styles.price} data-testid="price-display">
                    {phoneData.price?.toLocaleString()}원
                  </p>
                  <div className={styles.priceRow}>
                    <span className={styles.originalPrice}>
                      {phoneData.original_price?.toLocaleString()}원
                    </span>
                    <span className={styles.discountRate} data-testid="discount-rate">
                      {discountRate}% 할인
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            <div>
              <p className={styles.basicInfoLabel}>사양</p>
              <div className={styles.basicInfoHashtags} data-testid="basic-info-hashtags">
                {hashtags.map((tag, index) => (
                  <span key={index} className={styles.hashtag} data-testid={`hashtag-${index}`}>
                    {tag}
                  </span>
                ))}
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
    </div>
  );
}
