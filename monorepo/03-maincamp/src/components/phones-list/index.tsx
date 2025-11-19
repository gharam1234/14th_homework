"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";
import { usePhonesListRouting } from "./hooks/index.routing.hook";
import { usePhoneFilters } from "./hooks/index.filter.hook";
import { usePhoneSearch } from "./hooks/index.search.hook";
import { useIconFilter, type Phone } from "./hooks/index.icon-filter.hook";
import type { IPhoneCard } from "./hooks/index.search.hook";

/**
 * 디바이스 타입 필터 아이콘 데이터
 */
const DEVICE_TYPE_FILTERS = ["phone", "tablet", "laptop", "watch"] as const;

type DeviceType = typeof DEVICE_TYPE_FILTERS[number];

/**
 * 디바이스 타입 아이콘 렌더링 함수
 */
function getDeviceTypeIcon(type: DeviceType) {
  const iconMap: Record<DeviceType, string> = {
    phone: "📱",
    tablet: "📱",
    laptop: "💻",
    watch: "⌚",
  };
  return iconMap[type];
}

/**
 * 중고폰 브랜드 필터 아이콘 컴포넌트
 * @description 주요 스마트폰 브랜드 로고 아이콘
 */
function FilterIconApple() {
  return (
    <img
      src="https://cdn.simpleicons.org/apple/000000?view=light"
      alt="Apple"
      className={styles.filterIcon}
      data-testid="icon-apple"
    />
  );
}

function FilterIconSamsung() {
  return (
    <img
      src="https://cdn.simpleicons.org/samsung/1428A0?view=light"
      alt="Samsung"
      className={styles.filterIcon}
      data-testid="icon-samsung"
    />
  );
}

function FilterIconGoogle() {
  return (
    <img
      src="https://cdn.simpleicons.org/google/4285F4?view=light"
      alt="Google"
      className={styles.filterIcon}
      data-testid="icon-google"
    />
  );
}

function FilterIconXiaomi() {
  return (
    <img
      src="https://cdn.simpleicons.org/xiaomi/FF6900?view=light"
      alt="Xiaomi"
      className={styles.filterIcon}
      data-testid="icon-xiaomi"
    />
  );
}

function FilterIconNothing() {
  return (
    <img
      src="https://cdn.simpleicons.org/nothing/000000?view=light"
      alt="Nothing"
      className={styles.filterIcon}
      data-testid="icon-nothing"
    />
  );
}

function FilterIconSony() {
  return (
    <img
      src="https://cdn.simpleicons.org/sony/000000?view=light"
      alt="Sony"
      className={styles.filterIcon}
      data-testid="icon-sony"
    />
  );
}

function FilterIconMotorola() {
  return (
    <img
      src="https://cdn.simpleicons.org/motorola/5C51A3?view=light"
      alt="Motorola"
      className={styles.filterIcon}
      data-testid="icon-motorola"
    />
  );
}

function FilterIconLG() {
  return (
    <img
      src="https://cdn.simpleicons.org/lg/A50034?view=light"
      alt="LG"
      className={styles.filterIcon}
      data-testid="icon-lg"
    />
  );
}

function FilterIconOthers() {
  return (
    <img
      src="https://cdn.simpleicons.org/asterisk/666666?view=light"
      alt="기타 브랜드"
      className={styles.filterIcon}
      data-testid="icon-others"
    />
  );
}

interface IPhoneCardWithRouting extends IPhoneCard {
  onCardClick?: (phoneId: string | number) => void;
}

function PhoneCard({
  title,
  description,
  tags,
  price,
  sellerLabel,
  imageUrl,
  likeCount = 24,
  modelName,
  phoneId,
  onCardClick,
}: IPhoneCardWithRouting) {
  const handleClick = () => {
    if (phoneId && onCardClick) {
      onCardClick(phoneId);
    }
  };

  return (
    <div
      className={styles.card}
      data-testid="phone-card"
      onClick={handleClick}
      style={{ cursor: phoneId ? "pointer" : "default" }}
    >
      <div className={styles.cardImage}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div style={{ backgroundColor: "#e0e0e0", width: "100%", height: "100%" }} />
        )}
        <div className={styles.bookmark} data-testid="bookmark">
          <span>❤️</span>
          <span>{likeCount}</span>
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {modelName && (
            <p className={styles.cardModel} data-testid="card-model-name">
              모델명: {modelName}
            </p>
          )}
          <p className={styles.cardDescription}>{description}</p>
        </div>
        <div className={styles.cardTags}>
          <p className={styles.tags}>{tags}</p>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.hostName} data-testid="card-seller-label">
            {sellerLabel}
          </span>
          <div className={styles.priceArea}>
            <span className={styles.price}>{price}</span>
            <span className={styles.currency}>원</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 중고폰 리스트 페이지 - Figma 디자인 기반
 *
 * @description 중고 스마트폰 거래 마켓플레이스 페이지의 메인 컴포넌트입니다.
 * 검색 필터, 브랜드 분류, 거래 카드 그리드를 포함합니다.
 */
interface IPhonesListProps {
  onSearch?: (params: any) => void;
}

/**
 * 브랜드 필터 데이터
 */
const BRAND_FILTERS = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "google", label: "Google" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "nothing", label: "Nothing" },
  { id: "sony", label: "Sony" },
  { id: "motorola", label: "Motorola" },
  { id: "lg", label: "LG" },
  { id: "others", label: "기타" },
] as const;

export default function PhonesList({ onSearch }: IPhonesListProps) {
  const [activeTab, setActiveTab] = useState<"selling" | "completed">("selling");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchInFlight, setIsSearchInFlight] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const [hasIconFilterInteracted, setHasIconFilterInteracted] = useState(false);
  const { navigateToPhoneDetail, navigateToPhoneCreate } = usePhonesListRouting();
  const {
    availableNow,
    dateRange,
    keyword,
    setAvailableNow,
    setDateRange,
    setKeyword,
    resetFilters,
  } = usePhoneFilters();
  const { searchResults, isLoading, error, handleSearch, isSearchEnabled } = usePhoneSearch();
  const {
    selectedCategory,
    isLoading: isCategoryLoading,
    error: categoryError,
    phonesList,
    toggleCategory,
  } = useIconFilter();

  const handleBrandFilterClick = (brandId: string) => {
    setHasIconFilterInteracted(true);
    toggleCategory(brandId);
  };

  const handleIconFilterToggle = (deviceType: DeviceType) => {
    setSelectedDeviceType((prev) => (prev === deviceType ? null : deviceType));
  };

  const shouldRenderPhonesList =
    selectedCategory !== null ||
    hasIconFilterInteracted ||
    (!hasSearched && (phonesList.length > 0 || isCategoryLoading || Boolean(categoryError)));

  const formatPhonePrice = (price: Phone['price']): string => {
    if (typeof price === "number") {
      return new Intl.NumberFormat("ko-KR").format(price);
    }
    if (typeof price === "string") {
      const parsed = Number(price);
      return Number.isFinite(parsed) ? new Intl.NumberFormat("ko-KR").format(parsed) : price;
    }
    return "0";
  };

  const renderIconFilteredCards = () => {
    if (isCategoryLoading && phonesList.length === 0) {
      return (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: "40px",
            textAlign: "center",
            color: "#999",
          }}
        >
          필터링 중...
        </div>
      );
    }

    if (phonesList.length === 0) {
      return (
        <div
          data-testid="no-results"
          style={{
            gridColumn: "1 / -1",
            padding: "40px",
            textAlign: "center",
            color: "#999",
          }}
        >
          필터링된 결과가 없습니다
        </div>
      );
    }

    return phonesList.map((phone, index) => {
      const formattedPrice = formatPhonePrice(phone.price);
      const saleStateLabel = phone.sale_state ?? "정보 없음";

      return (
        <PhoneCard
          key={phone.id ?? index}
          phoneId={phone.id}
          title={phone.title || ""}
          description={`거래 상태: ${saleStateLabel}`}
          tags={phone.categories?.join(" ") || ""}
          price={formattedPrice}
          sellerLabel="판매자 정보"
          imageUrl={phone.main_image_url}
          likeCount={0}
          modelName=""
          onCardClick={navigateToPhoneDetail}
        />
      );
    });
  };

  // 샘플 카드 데이터
  const samplePhones: IPhoneCard[] = [
    {
      title: "아이폰 14 Pro 256GB",
      description: "A급 상태, 자급제 모델",
      tags: "#Apple #A급 #안전거래",
      price: "1,180,000",
      sellerLabel: "판매자 홍대직",
      likeCount: 142,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
      modelName: "iPhone 14 Pro",
    },
    {
      title: "갤럭시 S23 울트라 512GB",
      description: "삼성 케어 잔여 6개월",
      tags: "#Samsung #자급제 #S펜포함",
      price: "1,090,000",
      sellerLabel: "판매자 삼성샵",
      likeCount: 98,
      imageUrl: "https://images.unsplash.com/photo-1580898434531-5700dde6756c?w=400&h=300&fit=crop",
      modelName: "Galaxy S23 Ultra",
    },
    {
      title: "픽셀 8 프로 128GB",
      description: "미개봉 수준, 국내 정식",
      tags: "#Google #미개봉 #AI카메라",
      price: "980,000",
      sellerLabel: "판매자 픽셀러버",
      likeCount: 74,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3f8c5fed2fa8?w=400&h=300&fit=crop",
      modelName: "Pixel 8 Pro",
    },
    {
      title: "노트20 울트라 256GB",
      description: "생활기스 적은 B급",
      tags: "#Samsung #S펜 #대화면",
      price: "520,000",
      sellerLabel: "판매자 부산직",
      likeCount: 61,
      imageUrl: "https://images.unsplash.com/photo-1451188502541-13943edb6acb?w=400&h=300&fit=crop",
      modelName: "Galaxy Note20 Ultra",
    },
  ];

  const sampleCards: (IPhoneCard & { phoneId: number })[] = Array(8)
    .fill(null)
    .map((_, index) => ({
      ...samplePhones[index % samplePhones.length],
      phoneId: index + 1,
    }));

  return (
    <div className={styles.container} data-testid="phones-list">
      {/* 제목 */}
      <h1 className={styles.title} data-testid="title">
        여기에서만 만날 수 있는 중고폰
      </h1>

      {/* 탭 섹션 */}
      <div className={styles.tabSection} data-testid="tab-section">
        <button
          className={`${styles.tab} ${activeTab === "selling" ? styles.tabActive : styles.tabInactive}`}
          onClick={() => setActiveTab("selling")}
          data-testid="tab-selling"
        >
          판매중인 기기
        </button>
        <button
          className={`${styles.tab} ${activeTab === "completed" ? styles.tabActive : styles.tabInactive}`}
          onClick={() => setActiveTab("completed")}
          data-testid="tab-completed"
        >
          거래완료 기기
        </button>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className={styles.searchSection} data-testid="search-section">
        <div className={styles.searchInputGroup}>
          <div className={styles.datepickerInput} data-testid="datepicker">
            📅
            <div className={styles.dateInputWrapper}>
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange(e.target.value || null, dateRange.endDate)}
                style={{
                  border: "none",
                  outline: "none",
                  padding: "4px",
                  backgroundColor: "transparent",
                }}
              />
              <span>~</span>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => setDateRange(dateRange.startDate, e.target.value || null)}
                style={{
                  border: "none",
                  outline: "none",
                  padding: "4px",
                  backgroundColor: "transparent",
                }}
              />
            </div>
          </div>
          <div className={styles.searchBarGroup}>
            <div className={styles.searchBarInput} data-testid="search-bar">
              🔍
              <input
                type="text"
                placeholder="모델명이나 기기명을 검색해 주세요."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                data-testid="search-input"
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "16px",
                  backgroundColor: "transparent",
                }}
              />
            </div>
            <button
              className={styles.searchButton}
              data-testid="search-button"
              onClick={() => {
                if (isSearchInFlight) return;
                setIsSearchInFlight(true);
                handleSearch()
                  .finally(() => {
                    setHasSearched(true);
                    setIsSearchInFlight(false);
                  });
              }}
              disabled={!isSearchEnabled || isLoading || isSearchInFlight}
            >
              {isLoading || isSearchInFlight ? '검색 중...' : '검색'}
            </button>
          </div>
        </div>
        <button
          className={styles.sellButton}
          data-testid="sell-button"
          onClick={navigateToPhoneCreate}
        >
          <div className={styles.sellButtonIcon}>📝</div>
          <span>중고폰 판매 등록</span>
        </button>
        <button
          className={styles.resetButton}
          data-testid="reset-button"
          onClick={resetFilters}
          style={{
            marginLeft: '8px',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          초기화
        </button>
      </div>

      {/* 토글 필터 */}
      <div style={{ marginBottom: '16px' }}>
        <label data-testid="toggle-available" style={{ marginRight: '16px' }}>
          <input
            type="checkbox"
            checked={availableNow}
            onChange={(e) => setAvailableNow(e.target.checked)}
          />
          {' '}즉시 구매 가능
        </label>
      </div>

      {/* 아이콘 필터 */}
      <div
        className={styles.iconFilterContainer}
        data-testid="icon-filter"
      >
        {DEVICE_TYPE_FILTERS.map((deviceType) => (
          <button
            key={deviceType}
            className={`${styles.iconFilterItem} ${
              selectedDeviceType === deviceType ? styles.iconFilterItemSelected : ''
            }`}
            onClick={() => handleIconFilterToggle(deviceType)}
            data-testid={`icon-${deviceType}`}
            aria-pressed={selectedDeviceType === deviceType}
          >
            <span className={styles.iconFilterIcon}>
              {getDeviceTypeIcon(deviceType)}
            </span>
            <span className={styles.iconFilterLabel}>
              {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {/* 아이콘 필터 로딩 메시지 */}
      {isCategoryLoading && (
        <div
          data-testid="icon-filter-loading"
          style={{
            padding: '12px',
            backgroundColor: '#e7f3ff',
            color: '#0066cc',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          로딩 중...
        </div>
      )}

      {/* 아이콘 필터 에러 메시지 */}
      {categoryError && (
        <div
          data-testid="icon-filter-error"
          role="alert"
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          {categoryError}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div
          role="alert"
          data-testid="error-alert"
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* 콘텐츠 섹션 */}
      <div className={styles.contentSection}>
        {/* 필터 섹션 */}
        <div className={styles.filterSection} data-testid="filter-section">
        {BRAND_FILTERS.map((brand) => {
          const IconComponent = {
            apple: FilterIconApple,
            samsung: FilterIconSamsung,
            google: FilterIconGoogle,
              xiaomi: FilterIconXiaomi,
              nothing: FilterIconNothing,
              sony: FilterIconSony,
              motorola: FilterIconMotorola,
              lg: FilterIconLG,
              others: FilterIconOthers,
            }[brand.id];

            const isSelected = selectedCategory === brand.id;

            return (
              <button
                key={brand.id}
                className={[
                  styles.filterItem,
                  isSelected ? styles.filterItemSelected : '',
                  isSelected ? 'selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleBrandFilterClick(brand.id)}
                data-testid={`filter-${brand.id}`}
                aria-pressed={isSelected}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <IconComponent />
                <span className={styles.filterLabel}>{brand.label}</span>
              </button>
            );
          })}
        </div>

        {/* 카드 영역 */}
        <div className={styles.cardArea} data-testid="card-area">
          {shouldRenderPhonesList ? (
            renderIconFilteredCards()
          ) : searchResults.length > 0 ? (
            // 검색 결과 표시
            searchResults.map((card, index) => (
              <PhoneCard
                key={card.phoneId ?? index}
                {...card}
                phoneId={card.phoneId}
                onCardClick={navigateToPhoneDetail}
              />
            ))
          ) : hasSearched ? (
            // 검색 결과가 없을 때
            <div
              data-testid="no-results"
              style={{
                gridColumn: '1 / -1',
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              검색 결과가 없습니다
            </div>
          ) : (
            // 검색을 하지 않았을 때 샘플 데이터 표시
            sampleCards.map((card, index) => (
              <PhoneCard
                key={index}
                {...card}
                onCardClick={navigateToPhoneDetail}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
