'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import styles from './styles.module.css';
import { PhoneCondition, PhoneDetail as PhoneDetailType, PhoneDetailProps, PhoneWithSeller } from './types';
import { useImageGallery, ZOOM_MAX, ZOOM_MIN } from './hooks/index.gallery.hook';
import { useBookmarkHook } from './hooks/index.bookmark.hook';
import { usePhoneDetailModalHook } from './hooks/index.modal.hook';
import { usePhoneSpecs } from './hooks/index.specs.hook';

/**
 * 할인율 계산
 */
const calculateDiscountRate = (price: number, originalPrice?: number | null): number => {
  if (typeof originalPrice !== 'number' || originalPrice <= 0 || originalPrice <= price) {
    return 0;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const formatPrice = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '가격 정보 없음';
  }
  return `${value.toLocaleString('ko-KR')}원`;
};

/**
 * 조건별 해시태그 생성
 */
const generateHashtags = (condition?: PhoneCondition, batteryHealth?: number | null): string[] => {
  const hashtags: string[] = [];

  switch (condition) {
    case '미개봉':
      hashtags.push('#미개봉');
      break;
    case '새것':
      hashtags.push('#새제품');
      break;
    case '중고':
      hashtags.push('#중고');
      break;
    default:
      break;
  }

  if (typeof batteryHealth === 'number') {
    if (batteryHealth >= 80) {
      hashtags.push('#배터리 좋음');
    } else if (batteryHealth < 50) {
      hashtags.push('#배터리 나쁨');
    }
  }

  return hashtags;
};

interface NormalizedPhoneDetail {
  id: string;
  title: string;
  modelName: string;
  description: string;
  condition: PhoneCondition;
  price: number;
  originalPrice?: number | null;
  mainImageUrl?: string;
  imageUrls: string[];
  batteryHealth?: number | null;
  sellerNickname?: string;
  sellerId?: string;
  hashtags: string[];
  bookmarkCount: number;
}

const isSupabasePhone = (phone?: PhoneDetailProps['data']): phone is PhoneWithSeller => {
  return Boolean(phone && 'model_name' in phone && 'seller_id' in phone);
};

const normalizePhoneData = (raw?: PhoneDetailProps['data']): NormalizedPhoneDetail | null => {
  if (!raw) return null;

  if (isSupabasePhone(raw)) {
    const hashtags = generateHashtags(raw.condition, raw.battery_health);
    return {
      id: raw.id,
      title: raw.title ?? raw.model_name,
      modelName: raw.model_name,
      description: raw.description ?? '',
      condition: raw.condition,
      price: raw.price,
      originalPrice: raw.original_price ?? null,
      mainImageUrl: raw.main_image_url ?? raw.images_urls?.[0],
      imageUrls: raw.images_urls ?? [],
      batteryHealth: raw.battery_health ?? null,
      sellerNickname: raw.seller?.nickname ?? undefined,
      sellerId: raw.seller?.id,
      hashtags,
      bookmarkCount: typeof raw.bookmark_count === 'number' ? raw.bookmark_count : 0,
    };
  }

  const legacy = raw as PhoneDetailType;
  const legacyCondition: PhoneCondition = legacy.condition ?? '중고';
  const legacyBattery = typeof legacy.batteryHealth === 'number' ? legacy.batteryHealth : null;
  const fallbackHashtags = legacy.hashtags && legacy.hashtags.length > 0
    ? legacy.hashtags
    : generateHashtags(legacyCondition, legacyBattery);

  return {
    id: legacy.id,
    title: legacy.title,
    modelName: legacy.model_name ?? legacy.title,
    description: legacy.description,
    condition: legacyCondition,
    price: legacy.price,
    originalPrice: legacy.originalPrice ?? null,
    mainImageUrl: legacy.mainImage ?? legacy.images?.[0],
    imageUrls: legacy.images ?? [],
    batteryHealth: legacyBattery ?? undefined,
    sellerNickname: legacy.seller?.nickname ?? legacy.seller?.name,
    sellerId: legacy.seller?.id,
    hashtags: fallbackHashtags,
    bookmarkCount: legacy.likes ?? 0,
  };
};

/**
 * PhoneDetail - Figma 디자인 기반 프레젠테이션 컴포넌트
 *
 * @description 중고폰 상세 페이지를 표시하는 UI 컴포넌트입니다.
 * Props로 데이터만 받아서 표시하며, 기능은 부모 컴포넌트에서 구현합니다.
 * @param props - 컴포넌트 속성 (data: 중고폰 정보)
 */

/**
 * 중고폰 상세 페이지 컴포넌트
 * @param data - 폰 데이터 (PhoneWithSeller 타입, 기본값: DUMMY_PHONE_DATA)
 * @param onShare - 공유 버튼 클릭 핸들러
 */
export default function PhoneDetail({ data = null, isLoading = false, onShare, onBookmark }: PhoneDetailProps) {
  const phoneData = useMemo(() => normalizePhoneData(data), [data]);
  const locationSectionRef = useRef<HTMLElement | null>(null);

  const {
    galleryImages,
    currentMainImage,
    mainImageKey,
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
    resetGallery,
  } = useImageGallery({
    mainImageUrl: phoneData?.mainImageUrl,
    imageUrls: phoneData?.imageUrls ?? [],
  });

  const lastThumbnailIndex = Math.max(galleryImages.length - 1, 0);

  const handleThumbnailSelect = useCallback((index: number) => {
    if (index === selectedThumbnailIndex) {
      resetGallery();
      return;
    }

    selectThumbnail(index);
  }, [resetGallery, selectThumbnail, selectedThumbnailIndex]);

  const {
    isBookmarked,
    bookmarkCount,
    isLoading: isBookmarkLoading,
    error: bookmarkError,
    toggleBookmark,
  } = useBookmarkHook({
    phoneId: phoneData?.id ?? '',
    userId: phoneData?.sellerId ?? 'local-user',
    initialBookmarkCount: phoneData?.bookmarkCount ?? 0,
    mockDelayMs: 0,
  });

  const { openPurchaseGuideModal } = usePhoneDetailModalHook({
    phoneId: phoneData?.id,
    phonePrice: phoneData?.price,
  });

  const specs = usePhoneSpecs(isSupabasePhone(data) ? (data as PhoneWithSeller) : undefined);

  const handleShare = useCallback(async () => {
    if (onShare) {
      await Promise.resolve(onShare());
      return;
    }

    if (typeof window === 'undefined') return;
    const currentUrl = window.location?.href ?? '';

    if (!currentUrl) {
      window.alert?.('공유할 링크가 없습니다.');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      window.alert?.('이 브라우저에서는 링크 복사가 지원되지 않습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      window.alert?.('상품 링크가 복사되었습니다.');
    } catch (error) {
      console.error(error);
      window.alert?.('공유 링크 복사에 실패했습니다.');
    }
  }, [onShare]);

  const handleScrollToLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    const target = locationSectionRef.current ?? (document.querySelector('[data-testid="location-section"]') as HTMLElement | null);
    target?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleBookmarkClick = useCallback(async () => {
    if (!phoneData || isBookmarkLoading) return;
    await toggleBookmark();
  }, [isBookmarkLoading, phoneData, toggleBookmark]);

  const handleReportClick = useCallback(() => {
    openPurchaseGuideModal();
  }, [openPurchaseGuideModal]);

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

  useEffect(() => {
    if (!onBookmark || !phoneData) return;
    onBookmark({ isBookmarked, bookmarkCount });
  }, [bookmarkCount, isBookmarked, onBookmark, phoneData]);

  if (!phoneData) {
    return (
      <div className={styles.body} data-testid="phone-detail-placeholder">
        <div className={styles.container} data-testid="phone-detail-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>{isLoading ? '중고폰 정보를 불러오는 중입니다.' : '표시할 중고폰 정보가 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const priceText = formatPrice(phoneData.price);
  const originalPriceText = formatPrice(phoneData.originalPrice);
  const discountRate = calculateDiscountRate(phoneData.price, phoneData.originalPrice);
  const shouldShowOriginalPrice = typeof phoneData.originalPrice === 'number' && phoneData.originalPrice > phoneData.price;
  const sellerLabel = phoneData.sellerNickname ?? '판매자 정보 없음';
  const hashtags = phoneData.hashtags;
  const descriptionLines = phoneData.description ? phoneData.description.split('\n') : ['상세 설명이 준비되지 않았습니다.'];

  return (
    <div className={styles.body} data-testid="phone-detail-body">
      <div className={styles.container} data-testid="phone-detail-container">
        {/* === 헤더 섹션 === */}
        <section className={styles.headerSection} data-testid="header-section">
          {/* 제목 및 액션 버튼 */}
          <div className={styles.titleArea} data-testid="title-area">
            <div className={styles.titleHeader}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{phoneData.modelName}</h1>
                <div className={styles.actionButtons} data-testid="action-buttons">
                  {/* 신고 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="신고"
                    onClick={handleReportClick}
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
                    onClick={handleShare}
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
                    onClick={handleScrollToLocation}
                    data-testid="location-button"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 북마크 배지 */}
                  <div className={styles.bookmarkBadge} data-testid="bookmark-badge" data-state={isBookmarked ? 'bookmarked' : 'idle'}>
                    <button
                      className={styles.iconButton}
                      title="북마크"
                      onClick={handleBookmarkClick}
                      disabled={!phoneData.id || isBookmarkLoading}
                      aria-pressed={isBookmarked}
                      data-testid="bookmark-button"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M17 3H5c-1.11 0-2 .9-2 2v16l7-3 7 3V5c0-1.1.89-2 2-2z"
                          fill="none"
                          stroke={isBookmarked ? '#ffcc00' : '#ffffff'}
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <p className={styles.bookmarkCount} data-testid="bookmark-count">{bookmarkCount.toLocaleString('ko-KR')}</p>
                    {bookmarkError && (
                      <span className={styles.bookmarkError} data-testid="bookmark-error" style={{ color: '#ff6b6b', fontSize: '12px' }}>
                        {bookmarkError}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className={styles.subtitle}>{sellerLabel}</p>
              <p className={styles.hashtags}>{hashtags.length > 0 ? hashtags.join(' ') : '#해시태그 없음'}</p>
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
                  key={mainImageKey}
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
                  role="tablist"
                  aria-label="제품 이미지 썸네일"
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '8px',
                    padding: '0 40px',
                    scrollBehavior: 'smooth',
                  }}
                >
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={selectedThumbnailIndex === index}
                      tabIndex={selectedThumbnailIndex === index ? 0 : -1}
                      className={`${styles.thumbnail} ${selectedThumbnailIndex === index ? styles.thumbnailActive : ''}`}
                      onClick={() => handleThumbnailSelect(index)}
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
                  disabled={selectedThumbnailIndex === lastThumbnailIndex}
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
                      disabled={zoomLevel <= ZOOM_MIN}
                      data-testid="zoom-out-btn"
                      style={{
                        padding: '8px 12px',
                        cursor: zoomLevel > ZOOM_MIN ? 'pointer' : 'not-allowed',
                        opacity: zoomLevel > ZOOM_MIN ? 1 : 0.5,
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
                      disabled={zoomLevel >= ZOOM_MAX}
                      data-testid="zoom-in-btn"
                      style={{
                        padding: '8px 12px',
                        cursor: zoomLevel < ZOOM_MAX ? 'pointer' : 'not-allowed',
                        opacity: zoomLevel < ZOOM_MAX ? 1 : 0.5,
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
                {phoneData.modelName}
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
                    {priceText}
                  </p>
                  {shouldShowOriginalPrice && (
                    <div className={styles.priceRow}>
                      <span className={styles.originalPrice} data-testid="original-price">
                        {originalPriceText}
                      </span>
                      <span className={styles.discountRate} data-testid="discount-rate">
                        {discountRate}% 할인
                      </span>
                    </div>
                  )}
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

        {/* === 스펙 섹션 === */}
        {specs.length > 0 && (
          <section className={styles.specsSection} data-testid="specs-section">
            <h2 className={styles.sectionTitle}>사양 정보</h2>
            <div className={styles.specsGrid}>
              {specs.map((spec, index) => (
                <div key={index} className={styles.specsGridItem} data-testid={`spec-item-${index}`}>
                  <p className={styles.specsLabel}>{spec.label}</p>
                  {spec.progress ? (
                    <div className={styles.batteryProgressContainer}>
                      <div className={styles.batteryProgressBar} data-testid={`battery-progress-bar-${index}`}>
                        <div
                          className={`${styles.batteryProgressFill} ${styles[spec.progress.colorClass]}`}
                          style={{ width: `${spec.progress.percentage}%` }}
                          data-testid={`battery-progress-fill-${index}`}
                          data-color-class={spec.progress.colorClass}
                        />
                      </div>
                      <p className={styles.batteryProgressText} data-testid={`battery-progress-text-${index}`}>
                        {spec.displayText}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className={styles.specsValue} data-testid={`spec-value-${index}`}>{spec.displayText}</p>
                      {spec.supplementText && (
                        <p className={styles.specsSupplementText} data-testid={`spec-supplement-text-${index}`}>
                          {spec.supplementText}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 상세 설명 섹션 === */}
        <section className={styles.descriptionSection} data-testid="description-section">
          <h2 className={styles.sectionTitle}>상세 설명</h2>
          <div className={styles.descriptionContent}>
            {descriptionLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </section>

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 위치 섹션 === */}
        <section className={styles.locationSection} data-testid="location-section" ref={locationSectionRef}>
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
