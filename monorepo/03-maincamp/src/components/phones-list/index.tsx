"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";
import { usePhonesListRouting } from "./hooks/index.routing.hook";

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

/**
 * 중고폰 카드 컴포넌트
 * @description 중고폰 정보를 표시하는 카드
 */
interface IPhoneCard {
  title: string;
  description: string;
  tags: string;
  price: string;
  sellerName: string;
  imageUrl?: string;
  likeCount?: number;
}

interface IPhoneCardWithRouting extends IPhoneCard {
  phoneId?: string | number;
  onCardClick?: (phoneId: string | number) => void;
}

function PhoneCard({
  title,
  description,
  tags,
  price,
  sellerName,
  imageUrl,
  likeCount = 24,
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
          <p className={styles.cardDescription}>{description}</p>
        </div>
        <div className={styles.cardTags}>
          <p className={styles.tags}>{tags}</p>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.hostName}>{sellerName}</span>
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

export default function PhonesList({ onSearch }: IPhonesListProps) {
  const [activeTab, setActiveTab] = useState<"selling" | "completed">("selling");
  const { navigateToPhoneDetail, navigateToPhoneCreate } = usePhonesListRouting();

  // 샘플 카드 데이터
  const samplePhones = [
    {
      title: "아이폰 14 Pro 256GB",
      description: "A급 상태, 자급제 모델",
      tags: "#Apple #A급 #안전거래",
      price: "1,180,000",
      sellerName: "홍대직거래",
      likeCount: 142,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    },
    {
      title: "갤럭시 S23 울트라 512GB",
      description: "삼성 케어 잔여 6개월",
      tags: "#Samsung #자급제 #S펜포함",
      price: "1,090,000",
      sellerName: "삼성중고샵",
      likeCount: 98,
      imageUrl: "https://images.unsplash.com/photo-1580898434531-5700dde6756c?w=400&h=300&fit=crop",
    },
    {
      title: "픽셀 8 프로 128GB",
      description: "미개봉 수준, 국내 정식",
      tags: "#Google #미개봉 #AI카메라",
      price: "980,000",
      sellerName: "픽셀러버",
      likeCount: 74,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3f8c5fed2fa8?w=400&h=300&fit=crop",
    },
    {
      title: "노트20 울트라 256GB",
      description: "생활기스 적은 B급",
      tags: "#Samsung #S펜 #대화면",
      price: "520,000",
      sellerName: "부산직거래",
      likeCount: 61,
      imageUrl: "https://images.unsplash.com/photo-1451188502541-13943edb6acb?w=400&h=300&fit=crop",
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
            <div style={{ fontSize: "16px", color: "#777777" }}>
              최소 가격 - 최대 가격
            </div>
          </div>
          <div className={styles.searchBarInput} data-testid="search-bar">
            🔍
            <input
              type="text"
              placeholder="모델명이나 기기명을 검색해 주세요."
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "16px",
                backgroundColor: "transparent",
              }}
            />
          </div>
          <button className={styles.searchButton} data-testid="search-button">
            검색
          </button>
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

      {/* 콘텐츠 섹션 */}
      <div className={styles.contentSection}>
        {/* 필터 섹션 */}
        <div className={styles.filterSection} data-testid="filter-section">
          <div className={styles.filterItem} data-testid="filter-apple">
            <FilterIconApple />
            <span className={styles.filterLabel}>Apple</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-samsung">
            <FilterIconSamsung />
            <span className={styles.filterLabel}>Samsung</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-google">
            <FilterIconGoogle />
            <span className={styles.filterLabel}>Google</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-xiaomi">
            <FilterIconXiaomi />
            <span className={styles.filterLabel}>Xiaomi</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-nothing">
            <FilterIconNothing />
            <span className={styles.filterLabel}>Nothing</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-sony">
            <FilterIconSony />
            <span className={styles.filterLabel}>Sony</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-motorola">
            <FilterIconMotorola />
            <span className={styles.filterLabel}>Motorola</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-lg">
            <FilterIconLG />
            <span className={styles.filterLabel}>LG</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-others">
            <FilterIconOthers />
            <span className={styles.filterLabel}>기타</span>
          </div>
        </div>

        {/* 카드 영역 */}
        <div className={styles.cardArea} data-testid="card-area">
          {sampleCards.map((card, index) => (
            <PhoneCard
              key={index}
              {...card}
              onCardClick={navigateToPhoneDetail}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
