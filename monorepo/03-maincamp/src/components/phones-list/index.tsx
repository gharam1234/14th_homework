     "use client";

import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { usePhonesListRouting } from "./hooks/index.routing.hook";
import { usePhoneFilters } from "./hooks/index.filter.hook";
import { usePhoneSearch } from "./hooks/index.search.hook";
import { useIconFilter, type Phone } from "./hooks/index.icon-filter.hook";
import type { IPhoneCard } from "./hooks/index.search.hook";
import { usePagination } from "./hooks/index.pagination.hook";
import { useFavorite } from "./hooks/index.favorite.hook";


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

interface PhoneCardProps extends IPhoneCardWithRouting {
  storageCapacity?: string | null;
  deviceCondition?: string | null;
  address?: string | null;
  saleState?: 'available' | 'reserved' | 'sold' | null;
  isFavorite?: boolean;
  currency?: string | null;
  onFavoriteClick?: (e: React.MouseEvent) => void;
  isFavoriteLoading?: boolean;
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
  storageCapacity,
  deviceCondition,
  address,
  saleState,
  isFavorite = false,
  currency,
  onFavoriteClick,
  isFavoriteLoading = false,
}: PhoneCardProps) {
  const DEFAULT_IMAGE_PATH = '/images/phone_sample.png';
  const [localFavorite, setLocalFavorite] = useState<boolean>(Boolean(isFavorite));

  useEffect(() => {
    setLocalFavorite(Boolean(isFavorite));
  }, [isFavorite]);
  
  const handleClick = () => {
    if (phoneId && onCardClick) {
      onCardClick(phoneId);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (isFavoriteLoading) {
      return;
    }
    setLocalFavorite((prev) => !prev);
    if (onFavoriteClick) {
      onFavoriteClick(e);
    }
  };

  // 이미지 에러 핸들러
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = event.currentTarget;
    const originalSrc = imgElement.src;

    // 무한 루프 방지: 이미 기본 이미지인 경우 재시도하지 않음
    if (originalSrc.includes(DEFAULT_IMAGE_PATH)) {
      return;
    }

    // 기본 이미지로 대체
    imgElement.src = DEFAULT_IMAGE_PATH;
  };

  const saleStateLabel = saleState === 'available' ? '판매중' : saleState === 'reserved' ? '예약중' : saleState === 'sold' ? '판매완료' : '정보 없음';
  
  const getSaleStateClassName = () => {
    switch (saleState) {
      case 'available':
        return styles.saleStateAvailable;
      case 'reserved':
        return styles.saleStateReserved;
      case 'sold':
        return styles.saleStateSold;
      default:
        return styles.saleStateDefault;
    }
  };

  // 이미지 URL이 없으면 기본 이미지 사용
  const displayImageUrl = imageUrl || DEFAULT_IMAGE_PATH;

  return (
    <div
      className={`${styles.card} ${phoneId ? styles.cardPointer : styles.cardDefault}`}
      data-testid="phone-card"
      onClick={handleClick}
    >
      <div className={styles.cardImage}>
        <div className={styles.cardImageWrapper}>
          <img src={displayImageUrl} alt={title} onError={handleImageError} />
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle} data-testid="card-title">{title}</h3>
          {modelName && (
            <p className={styles.cardModel} data-testid="card-model-name">
              모델명: {modelName}
            </p>
          )}
          {storageCapacity && (
            <p className={styles.cardModel} data-testid="card-storage-capacity">
              용량: {storageCapacity}
            </p>
          )}
          {deviceCondition && (
            <p className={styles.cardModel} data-testid="card-device-condition">
              상태: {deviceCondition}
            </p>
          )}
          {address && (
            <p className={styles.cardModel} data-testid="card-address">
              지역: {address}
            </p>
          )}
          <p className={styles.cardDescription}>{description}</p>
          <div className={styles.cardHeaderActions}>
            {saleState && (
              <span
                className={`${styles.saleStateBadge} ${getSaleStateClassName()}`}
                data-testid="card-sale-state"
              >
                {saleStateLabel}
              </span>
            )}
            <button
              className={styles.favoriteButton}
              onClick={handleFavoriteClick}
              disabled={isFavoriteLoading}
              data-testid={`favorite-button-${phoneId}`}
              aria-label={localFavorite ? '관심상품 제거' : '관심상품 저장'}
              aria-pressed={localFavorite}
            >
              <span>{localFavorite ? '❤️' : '🤍'}</span>
              <span>{likeCount}</span>
            </button>
          </div>
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
            <span className={styles.currency}>
              {currency === 'KRW' || !currency ? '원' : currency}
            </span>
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
  onSearch?: (params: unknown) => void;
}

/**
 * 브랜드 필터 데이터
 */
const BRAND_FILTERS = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "lg", label: "LG" },
  { id: "others", label: "기타" },
] as const;

export default function PhonesList({ onSearch }: IPhonesListProps) {
  const [activeTab, setActiveTab] = useState<"selling" | "completed">("selling");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchInFlight, setIsSearchInFlight] = useState(false);
  const [hasIconFilterInteracted, setHasIconFilterInteracted] = useState(false);
  const { navigateToPhoneDetail, navigateToPhoneCreate } = usePhonesListRouting();
  const {
    dateRange,
    keyword,
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

  // 찜 기능 훅
  const { 
    toggleFavorite, 
    isFavorite: checkIsFavorite, 
    toastMessage, 
    isLoading: isFavoriteLoading,
    closeToast 
  } = useFavorite();

  // 페이징 훅
  const {
    phones: paginatedPhones,
    currentPage,
    totalCount,
    isLoading: isPaginationLoading,
    error: paginationError,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
  } = usePagination();

  const handleBrandFilterClick = (brandId: string) => {
    setHasIconFilterInteracted(true);
    toggleCategory(brandId);
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
        <div className={styles.filteringMessage}>
          필터링 중...
        </div>
      );
    }

    if (phonesList.length === 0) {
      return (
        <div
          data-testid="no-results"
          className={styles.noResultsMessage}
        >
          필터링된 결과가 없습니다
        </div>
      );
    }

    return phonesList.map((phone, index) => {
      const formattedPrice = formatPhonePrice(phone.price);
      const categoriesString = phone.categories?.join(' ') || '';
      const phoneIdStr = String(phone.id);

      return (
        <PhoneCard
          key={phone.id ?? index}
          phoneId={phone.id}
          title={phone.title || ""}
          description=""
          tags={categoriesString}
          price={formattedPrice}
          sellerLabel="판매자 정보"
          imageUrl={phone.main_image_url}
          likeCount={0}
          modelName=""
          saleState={phone.sale_state}
          isFavorite={checkIsFavorite(phoneIdStr)}
          onCardClick={navigateToPhoneDetail}
          onFavoriteClick={() => toggleFavorite(phoneIdStr)}
          isFavoriteLoading={isFavoriteLoading}
        />
      );
    });
  };

  /**
   * 페이징된 카드 렌더링
   */
  const renderPaginatedCards = () => {
    // 로딩 상태
    if (isPaginationLoading && paginatedPhones.length === 0) {
      return (
        <div className={styles.loadingState} data-testid="loading-state">
          데이터 로드 중...
        </div>
      );
    }

    // 에러 상태
    if (paginationError) {
      return (
        <div className={styles.errorState} data-testid="error-state">
          데이터를 불러올 수 없습니다. 다시 시도해주세요.
        </div>
      );
    }

    // 빈 상태
    if (paginatedPhones.length === 0) {
      return (
        <div className={styles.emptyState} data-testid="empty-state">
          상품이 없습니다.
        </div>
      );
    }

    return paginatedPhones.map((phone, index) => {
      const formattedPrice = formatPhonePrice(phone.price);
      // tags 파싱 (JSONB 배열)
      const tagsArray = Array.isArray(phone.tags) ? phone.tags : [];
      const tagsString = tagsArray.length > 0 ? tagsArray.map(tag => `#${tag}`).join(' ') : '';
      // categories도 함께 표시
      const categoriesString = phone.categories?.join(' ') || '';
      const allTags = [tagsString, categoriesString].filter(Boolean).join(' ');
      const phoneIdStr = String(phone.id);

      return (
        <PhoneCard
          key={phone.id ?? index}
          phoneId={phone.id}
          title={phone.title || "제목 없음"}
          description=""
          tags={allTags}
          price={formattedPrice}
          sellerLabel="판매자 정보"
          imageUrl={phone.main_image_url || undefined}
          likeCount={0}
          modelName={phone.model_name || ""}
          storageCapacity={phone.storage_capacity}
          deviceCondition={phone.device_condition}
          address={phone.address}
          saleState={phone.sale_state}
          isFavorite={checkIsFavorite(phoneIdStr)}
          currency={phone.currency}
          onCardClick={navigateToPhoneDetail}
          onFavoriteClick={() => toggleFavorite(phoneIdStr)}
          isFavoriteLoading={isFavoriteLoading}
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
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div 
          className={`${styles.toast} ${toastMessage.type === 'error' ? styles.toastError : styles.toastSuccess}`}
          data-testid="favorite-toast"
          onClick={closeToast}
        >
          {toastMessage.message}
        </div>
      )}

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
                className={styles.dateInput}
              />
              <span>~</span>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => setDateRange(dateRange.startDate, e.target.value || null)}
                className={styles.dateInput}
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
                className={styles.searchInput}
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
            <button
              className={styles.resetButton}
              data-testid="reset-button"
              onClick={resetFilters}
            >
              초기화
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
      </div>

      {/* 아이콘 필터 로딩 메시지 */}
      {isCategoryLoading && (
        <div
          data-testid="icon-filter-loading"
          className={styles.iconFilterLoading}
        >
          로딩 중...
        </div>
      )}

      {/* 아이콘 필터 에러 메시지 */}
      {categoryError && (
        <div
          data-testid="icon-filter-error"
          role="alert"
          className={styles.iconFilterError}
        >
          {categoryError}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div
          role="alert"
          data-testid="error-alert"
          className={styles.errorAlert}
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
            lg: FilterIconLG,
            others: FilterIconOthers,
          }[brand.id];

            const isSelected = selectedCategory === brand.id;

            return (
              <button
                key={brand.id}
                className={[
                  styles.filterItem,
                  styles.filterButton,
                  isSelected ? styles.filterItemSelected : '',
                  isSelected ? 'selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleBrandFilterClick(brand.id)}
                data-testid={`filter-${brand.id}`}
                aria-pressed={isSelected}
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
              className={styles.noResultsMessage}
            >
              검색 결과가 없습니다
            </div>
          ) : (
            // 페이징된 데이터 표시
            renderPaginatedCards()
          )}
        </div>

        {/* 페이징 컨트롤 */}
        {!shouldRenderPhonesList && !hasSearched && paginatedPhones.length > 0 && (
          <div className={styles.paginationContainer} data-testid="pagination-container">
            <button
              className={styles.paginationButton}
              onClick={previousPage}
              disabled={!hasPreviousPage}
              data-testid="pagination-prev-button"
            >
              이전
            </button>

            <div className={styles.pageInfo} data-testid="page-info">
              {currentPage} / {Math.ceil(totalCount / 10)}
            </div>

            <button
              className={styles.paginationButton}
              onClick={nextPage}
              disabled={!hasNextPage}
              data-testid="pagination-next-button"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
