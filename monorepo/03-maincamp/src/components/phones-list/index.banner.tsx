"use client";

import React from "react";
import styles from "./styles.banner.module.css";
import { PromotionalBanner } from "./types";

/**
 * 특별 프로모션 배너 컴포넌트
 *
 * @description 중고폰 추천 상품 배너 UI
 * 배경 이미지, 마스크 효과, 그래디언트 오버레이, 배지를 포함합니다.
 *
 * @example
 * ```tsx
 * const banner = {
 *   id: "1",
 *   phoneModel: "iPhone 14 Pro",
 *   condition: "새것",
 *   originalPrice: 1500000,
 *   salePrice: 1180000,
 *   backgroundImageUrl: "...",
 *   badges: ["안전거래 인증", "A급 조건"],
 *   description: "즉시 구매 가능"
 * };
 *
 * <PromotionalBannerComponent
 *   banner={banner}
 *   onClick={(id) => console.log(id)}
 * />
 * ```
 */

interface PromotionalBannerComponentProps {
  banner: PromotionalBanner;
  className?: string;
  onClick?: (bannerId: string) => void;
}

/**
 * 할인율 계산 함수
 * @param originalPrice 원가
 * @param salePrice 판매가
 * @returns 할인율 (%)
 */
function calculateDiscountRate(originalPrice: number, salePrice: number): number {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * 가격을 포맷팅하는 함수
 * @param price 가격
 * @returns 포맷된 가격 문자열 (예: "1,180,000")
 */
function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

export default function PromotionalBannerComponent({
  banner,
  className = "",
  onClick,
}: PromotionalBannerComponentProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(banner.id);
    }
  };

  const discountRate = calculateDiscountRate(banner.originalPrice, banner.salePrice);
  const formattedSalePrice = formatPrice(banner.salePrice);
  const formattedOriginalPrice = formatPrice(banner.originalPrice);

  return (
    <div
      className={`${styles.banner} ${className}`}
      data-testid="promotional-banner"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* 배경 이미지 */}
      <img
        src={banner.backgroundImageUrl}
        alt={banner.phoneModel}
        className={styles.bannerImage}
        data-testid="banner-image"
      />

      {/* 그래디언트 오버레이 */}
      <div className={styles.bannerOverlay} data-testid="banner-overlay" />

      {/* 상단 우측 배지 영역 */}
      {banner.badges && banner.badges.length > 0 && (
        <div className={styles.badgesContainer} data-testid="badges-container">
          {banner.badges.slice(0, 3).map((badge, index) => (
            <div
              key={index}
              className={styles.badge}
              data-testid={`badge-${index}`}
              title={badge}
            >
              {badge}
            </div>
          ))}
        </div>
      )}

      {/* 하단 콘텐츠 영역 */}
      <div className={styles.contentContainer} data-testid="content-container">
        {/* 모델명 */}
        <h2 className={styles.phoneModel} data-testid="phone-model">
          {banner.phoneModel}
        </h2>

        {/* 조건 배지 */}
        <div className={styles.conditionBadges} data-testid="condition-badges">
          <span className={styles.conditionBadge} data-testid="condition-badge">
            #{banner.condition}
          </span>
          {discountRate > 0 && (
            <span className={styles.conditionBadge} data-testid="discount-badge">
              {discountRate}% 할인
            </span>
          )}
        </div>

        {/* 가격 정보 */}
        <div className={styles.priceContainer} data-testid="price-container">
          <span className={styles.originalPrice} data-testid="original-price">
            {formattedOriginalPrice}
          </span>
          <span className={styles.salePrice} data-testid="sale-price">
            {formattedSalePrice}
          </span>
          {discountRate > 0 && (
            <span className={styles.discountRate} data-testid="discount-rate">
              {discountRate}%
            </span>
          )}
        </div>

        {/* 설명 텍스트 (선택사항) */}
        {banner.description && (
          <p className={styles.description} data-testid="description">
            {banner.description}
          </p>
        )}
      </div>
    </div>
  );
}
