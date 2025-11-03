"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";

/**
 * AI 토큰 필터 아이콘 컴포넌트
 * @description Claude, Cursor, Windsurf 등의 AI 토큰 필터 아이콘 (공식 로고 CDN)
 */
function FilterIconClaude() {
  return (
    <img
      src="https://cdn.simpleicons.org/anthropic/000000?view=light"
      alt="Claude"
      className={styles.filterIcon}
      data-testid="icon-claude"
    />
  );
}

function FilterIconCursor() {
  return (
    <img
      src="https://cdn.simpleicons.org/cursor/000000?view=light"
      alt="Cursor"
      className={styles.filterIcon}
      data-testid="icon-cursor"
    />
  );
}

function FilterIconWindsurf() {
  return (
    <img
      src="https://cdn.simpleicons.org/codeium/06A77D?view=light"
      alt="Windsurf"
      className={styles.filterIcon}
      data-testid="icon-windsurf"
    />
  );
}

function FilterIconCodex() {
  return (
    <img
      src="https://cdn.simpleicons.org/openai/412991?view=light"
      alt="Codex"
      className={styles.filterIcon}
      data-testid="icon-codex"
    />
  );
}

function FilterIconChatGPT() {
  return (
    <img
      src="https://cdn.simpleicons.org/openai/10A37F?view=light"
      alt="ChatGPT"
      className={styles.filterIcon}
      data-testid="icon-chatgpt"
    />
  );
}

function FilterIconGitHubCopilot() {
  return (
    <img
      src="https://cdn.simpleicons.org/github/000000?view=light"
      alt="GitHub Copilot"
      className={styles.filterIcon}
      data-testid="icon-github-copilot"
    />
  );
}

function FilterIconPerplexity() {
  return (
    <img
      src="https://cdn.simpleicons.org/perplexity/000000?view=light"
      alt="Perplexity"
      className={styles.filterIcon}
      data-testid="icon-perplexity"
    />
  );
}

function FilterIconV0() {
  return (
    <img
      src="https://cdn.simpleicons.org/vercel/000000?view=light"
      alt="V0"
      className={styles.filterIcon}
      data-testid="icon-v0"
    />
  );
}

function FilterIconEtc() {
  return (
    <img
      src="https://cdn.simpleicons.org/asterisk/666666?view=light"
      alt="기타"
      className={styles.filterIcon}
      data-testid="icon-etc"
    />
  );
}

/**
 * 토큰 카드 컴포넌트
 * @description 토큰 정보를 표시하는 카드
 */
interface ITokenCard {
  title: string;
  description: string;
  tags: string;
  price: string;
  sellerName: string;
  imageUrl?: string;
  likeCount?: number;
}

function TokenCard({
  title,
  description,
  tags,
  price,
  sellerName,
  imageUrl,
  likeCount = 24,
}: ITokenCard) {
  return (
    <div className={styles.card} data-testid="token-card">
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
 * 토큰 마켓플레이스 페이지 - Figma 디자인 기반
 *
 * @description AI 토큰 거래 마켓플레이스 페이지의 메인 컴포넌트입니다.
 * 검색 필터, 토큰 분류, 토큰 카드 그리드를 포함합니다.
 */
interface ITokenMarketplaceProps {
  onSearch?: (params: any) => void;
}

export default function TokenMarketplace({ onSearch }: ITokenMarketplaceProps) {
  const [activeTab, setActiveTab] = useState<"selling" | "completed">("selling");

  // 샘플 카드 데이터
  const sampleCards: ITokenCard[] = Array(8).fill({
    title: "Claude Pro 토큰",
    description: "고급 AI 어시스턴트 Claude의 프리미엄 버전",
    tags: "#AI #Chat #Code #Analysis",
    price: "15,000",
    sellerName: "토큰마켓",
    likeCount: 24,
  });

  return (
    <div className={styles.container} data-testid="token-marketplace">
      {/* 제목 */}
      <h1 className={styles.title} data-testid="title">
        여기에서만 거래할 수 있는 AI 토큰
      </h1>

      {/* 탭 섹션 */}
      <div className={styles.tabSection} data-testid="tab-section">
        <button
          className={`${styles.tab} ${activeTab === "selling" ? styles.tabActive : styles.tabInactive}`}
          onClick={() => setActiveTab("selling")}
          data-testid="tab-selling"
        >
          판매중인 토큰
        </button>
        <button
          className={`${styles.tab} ${activeTab === "completed" ? styles.tabActive : styles.tabInactive}`}
          onClick={() => setActiveTab("completed")}
          data-testid="tab-completed"
        >
          거래완료 토큰
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
              placeholder="토큰 이름을 검색해 주세요."
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
        <button className={styles.sellButton} data-testid="sell-button">
          <div className={styles.sellButtonIcon}>📝</div>
          <span>토큰 판매 등록</span>
        </button>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className={styles.contentSection}>
        {/* 필터 섹션 */}
        <div className={styles.filterSection} data-testid="filter-section">
          <div className={styles.filterItem} data-testid="filter-claude">
            <FilterIconClaude />
            <span className={styles.filterLabel}>Claude</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-cursor">
            <FilterIconCursor />
            <span className={styles.filterLabel}>Cursor</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-windsurf">
            <FilterIconWindsurf />
            <span className={styles.filterLabel}>Windsurf</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-codex">
            <FilterIconCodex />
            <span className={styles.filterLabel}>Codex</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-chatgpt">
            <FilterIconChatGPT />
            <span className={styles.filterLabel}>ChatGPT</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-github-copilot">
            <FilterIconGitHubCopilot />
            <span className={styles.filterLabel}>GitHub Copilot</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-perplexity">
            <FilterIconPerplexity />
            <span className={styles.filterLabel}>Perplexity</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-v0">
            <FilterIconV0 />
            <span className={styles.filterLabel}>V0</span>
          </div>
          <div className={styles.filterItem} data-testid="filter-etc">
            <FilterIconEtc />
            <span className={styles.filterLabel}>기타</span>
          </div>
        </div>

        {/* 카드 영역 */}
        <div className={styles.cardArea} data-testid="card-area">
          {sampleCards.map((card, index) => (
            <TokenCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
