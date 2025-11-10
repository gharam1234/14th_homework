'use client';

import { useCallback, useMemo, useState } from 'react';

interface UseImageGalleryOptions {
  mainImageUrl?: string;
  imageUrls: string[];
  placeholderUrl?: string;
}

interface UseImageGalleryResult {
  // 상태
  currentImageIndex: number;
  currentMainImage: string;
  selectedThumbnailIndex: number;
  isZoomModalOpen: boolean;
  zoomLevel: number;
  isImageLoading: boolean;
  imageError: string | null;

  // 썸네일 슬라이더 상태
  thumbnailScrollPosition: number;

  // 핸들러
  selectThumbnail: (index: number) => void;
  nextThumbnail: () => void;
  prevThumbnail: () => void;
  openZoomModal: () => void;
  closeZoomModal: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomLevel: (level: number) => void;
  handleImageLoad: () => void;
  handleImageError: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  resetGallery: () => void;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="480"%3E%3Crect fill="%23e0e0e0" width="640" height="480"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23999"%3E이미지 없음%3C/text%3E%3C/svg%3E';
const THUMBNAIL_VISIBLE_COUNT = 4;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

/**
 * 이미지 갤러리 상태 관리 훅
 * - 메인 이미지 표시 및 로딩/에러 처리
 * - 썸네일 슬라이더 네비게이션
 * - 이미지 줌 기능
 * - 터치/스와이프 이벤트 처리
 * @param options - 메인 이미지 URL, 이미지 배열, 플레이스홀더
 * @returns 갤러리 상태 및 핸들러
 */
export function useImageGallery(options: UseImageGalleryOptions): UseImageGalleryResult {
  const { mainImageUrl, imageUrls, placeholderUrl = PLACEHOLDER_IMAGE } = options;

  // 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevelState] = useState(ZOOM_MIN);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // 전체 이미지 배열 (메인 이미지 + 썸네일들)
  const allImages = useMemo(() => {
    const images: string[] = [];
    if (mainImageUrl) {
      images.push(mainImageUrl);
    }
    if (imageUrls && imageUrls.length > 0) {
      images.push(...imageUrls);
    }
    return images.length > 0 ? images : [placeholderUrl];
  }, [mainImageUrl, imageUrls, placeholderUrl]);

  // 현재 메인 이미지
  const currentMainImage = useMemo(() => {
    return allImages[selectedThumbnailIndex] || placeholderUrl;
  }, [allImages, selectedThumbnailIndex, placeholderUrl]);

  // 썸네일 배열 (메인 이미지 제외)
  const thumbnailImages = useMemo(() => {
    if (mainImageUrl && imageUrls?.length > 0) {
      return imageUrls;
    }
    return allImages.slice(1);
  }, [mainImageUrl, imageUrls, allImages]);

  /**
   * 특정 썸네일 선택
   */
  const selectThumbnail = useCallback((index: number) => {
    if (index >= 0 && index < thumbnailImages.length) {
      setSelectedThumbnailIndex(index);
      setIsImageLoading(true);
      setImageError(null);

      // 슬라이더 자동 스크롤
      const scrollLeft = Math.max(0, index - Math.floor(THUMBNAIL_VISIBLE_COUNT / 2));
      setThumbnailScrollPosition(scrollLeft * 100); // 대략적인 스크롤 위치 계산
    }
  }, [thumbnailImages.length]);

  /**
   * 다음 썸네일로 이동
   */
  const nextThumbnail = useCallback(() => {
    setSelectedThumbnailIndex((prev) => {
      const next = Math.min(prev + 1, thumbnailImages.length - 1);
      setThumbnailScrollPosition((next - Math.floor(THUMBNAIL_VISIBLE_COUNT / 2)) * 100);
      return next;
    });
    setIsImageLoading(true);
    setImageError(null);
  }, [thumbnailImages.length]);

  /**
   * 이전 썸네일로 이동
   */
  const prevThumbnail = useCallback(() => {
    setSelectedThumbnailIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      setThumbnailScrollPosition(Math.max(0, (next - Math.floor(THUMBNAIL_VISIBLE_COUNT / 2)) * 100));
      return next;
    });
    setIsImageLoading(true);
    setImageError(null);
  }, []);

  /**
   * 줌 모달 열기
   */
  const openZoomModal = useCallback(() => {
    setIsZoomModalOpen(true);
    setZoomLevelState(ZOOM_MIN);
  }, []);

  /**
   * 줌 모달 닫기
   */
  const closeZoomModal = useCallback(() => {
    setIsZoomModalOpen(false);
    setZoomLevelState(ZOOM_MIN);
  }, []);

  /**
   * 줌 인
   */
  const zoomIn = useCallback(() => {
    setZoomLevelState((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  }, []);

  /**
   * 줌 아웃
   */
  const zoomOut = useCallback(() => {
    setZoomLevelState((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
  }, []);

  /**
   * 줌 레벨 설정
   */
  const setZoomLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(ZOOM_MIN, Math.min(level, ZOOM_MAX));
    setZoomLevelState(clampedLevel);
  }, []);

  /**
   * 이미지 로드 완료
   */
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
    setImageError(null);
  }, []);

  /**
   * 이미지 로드 실패
   */
  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageError('이미지를 불러올 수 없습니다.');
  }, []);

  /**
   * 터치 시작
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  /**
   * 터치 종료 (스와이프)
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // 왼쪽에서 오른쪽으로 스와이프 = 다음 이미지
        nextThumbnail();
      } else {
        // 오른쪽에서 왼쪽으로 스와이프 = 이전 이미지
        prevThumbnail();
      }
    }
  }, [touchStartX, nextThumbnail, prevThumbnail]);

  /**
   * 갤러리 초기화
   */
  const resetGallery = useCallback(() => {
    setCurrentImageIndex(0);
    setSelectedThumbnailIndex(0);
    setIsZoomModalOpen(false);
    setZoomLevelState(ZOOM_MIN);
    setIsImageLoading(true);
    setImageError(null);
    setThumbnailScrollPosition(0);
  }, []);

  return {
    currentImageIndex,
    currentMainImage,
    selectedThumbnailIndex,
    isZoomModalOpen,
    zoomLevel,
    isImageLoading,
    imageError,
    thumbnailScrollPosition,
    selectThumbnail,
    nextThumbnail,
    prevThumbnail,
    openZoomModal,
    closeZoomModal,
    zoomIn,
    zoomOut,
    setZoomLevel,
    handleImageLoad,
    handleImageError,
    handleTouchStart,
    handleTouchEnd,
    resetGallery,
  };
}
