'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TouchEvent } from 'react';

interface UseImageGalleryOptions {
  mainImageUrl?: string;
  imageUrls?: string[];
}

interface UseImageGalleryResult {
  galleryImages: string[];
  currentMainImage: string;
  mainImageKey: number;
  selectedThumbnailIndex: number;
  isZoomModalOpen: boolean;
  zoomLevel: number;
  isImageLoading: boolean;
  imageError: string | null;
  thumbnailScrollPosition: number;
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
  handleTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: (e: TouchEvent<HTMLDivElement>) => void;
  resetGallery: () => void;
}

export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="480"%3E%3Crect fill="%23e0e0e0" width="640" height="480"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23999"%3E이미지 없음%3C/text%3E%3C/svg%3E';
const THUMBNAIL_VISIBLE_COUNT = 4;
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.5;
export const SWIPE_THRESHOLD_PX = 40;

/**
 * 이미지 갤러리 상태 관리 훅
 * - 메인 이미지 표시 및 로딩/에러 처리
 * - 썸네일 슬라이더 네비게이션
 * - 이미지 줌 기능
 * - 터치/스와이프 이벤트 처리
 * @param options - 메인 이미지 URL, 이미지 배열, 플레이스홀더
 * @returns 갤러리 상태 및 핸들러
 */
export function useImageGallery(options: UseImageGalleryOptions = {}): UseImageGalleryResult {
  const { mainImageUrl, imageUrls } = options;

  // 상태
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevelState] = useState(ZOOM_MIN);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mainImageKey, setMainImageKey] = useState(0);

  const galleryImages = useMemo(() => {
    const normalizedImages = Array.isArray(imageUrls) ? imageUrls : [];
    const merged: string[] = [];

    if (mainImageUrl) {
      merged.push(mainImageUrl);
    }

    if (normalizedImages.length > 0) {
      merged.push(...normalizedImages);
    }

    return merged.length > 0 ? merged : [PLACEHOLDER_IMAGE];
  }, [mainImageUrl, imageUrls]);

  // 현재 메인 이미지
  const currentMainImage = useMemo(() => {
    return galleryImages[selectedThumbnailIndex] || PLACEHOLDER_IMAGE;
  }, [galleryImages, selectedThumbnailIndex]);

  const resetGallery = useCallback(() => {
    setIsImageLoading(true);
    setImageError(null);
    setMainImageKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    setSelectedThumbnailIndex(0);
    setThumbnailScrollPosition(0);
    setIsZoomModalOpen(false);
    setZoomLevelState(ZOOM_MIN);
    resetGallery();
  }, [galleryImages, resetGallery]);

  const updateThumbnailScrollPosition = useCallback((index: number) => {
    const scrollLeft = Math.max(0, index - Math.floor(THUMBNAIL_VISIBLE_COUNT / 2));
    setThumbnailScrollPosition(scrollLeft * 100);
  }, []);

  /**
   * 특정 썸네일 선택
   */
  const selectThumbnail = useCallback((index: number) => {
    if (galleryImages.length === 0) return;

    const safeIndex = Math.min(Math.max(index, 0), galleryImages.length - 1);

    if (safeIndex === selectedThumbnailIndex) {
      resetGallery();
      return;
    }

    setSelectedThumbnailIndex(safeIndex);
    setIsImageLoading(true);
    setImageError(null);
    updateThumbnailScrollPosition(safeIndex);
  }, [galleryImages.length, resetGallery, selectedThumbnailIndex, updateThumbnailScrollPosition]);

  /**
   * 다음 썸네일로 이동
   */
  const nextThumbnail = useCallback(() => {
    selectThumbnail(selectedThumbnailIndex + 1);
  }, [selectThumbnail, selectedThumbnailIndex]);

  /**
   * 이전 썸네일로 이동
   */
  const prevThumbnail = useCallback(() => {
    selectThumbnail(selectedThumbnailIndex - 1);
  }, [selectThumbnail, selectedThumbnailIndex]);

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
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  }, []);

  /**
   * 터치 종료 (스와이프)
   */
  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || e.changedTouches.length === 0) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) >= SWIPE_THRESHOLD_PX) {
      if (diffX > 0) {
        nextThumbnail();
      } else {
        prevThumbnail();
      }
    }

    setTouchStartX(null);
  }, [touchStartX, nextThumbnail, prevThumbnail]);

  /**
   * 갤러리 초기화
   */
  return {
    galleryImages,
    currentMainImage,
    mainImageKey,
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
