"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";

/**
 * 토큰 지갑 컴포넌트
 *
 * @description Figma 디자인 기반 토큰 지갑 컴포넌트입니다.
 * 사용자 정보, 토큰 잔액, 거래 내역 등을 표시합니다.
 */

/**
 * 토큰 거래 내역 데이터 타입
 */
interface ITransaction {
  id: number;
  name: string;
  price: string;
  date: string;
  status?: "거래 완료" | "판매중";
}

/**
 * 토큰 지갑 페이지 Props 인터페이스
 */
interface IMypageProps {
  userName?: string;
  userImage?: string;
  tokenCount?: number;
  transactions?: ITransaction[];
  onSearch?: (keyword: string) => void;
}

/**
 * 포인트 아이콘 컴포넌트
 */
function PointIcon() {
  return (
    <svg
      className={styles.pointIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="point-icon"
    >
      <circle cx="12" cy="12" r="9" stroke="#333333" strokeWidth="1.5" />
      <path d="M12 8V16M8 12H16" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 오른쪽 화살표 아이콘
 */
function RightArrowIcon() {
  return (
    <svg
      className={styles.menuItemIcon}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 4L14 10L8 16" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 토큰 보유 정보 섹션
 */
interface IUserInfoSectionProps {
  userName: string;
  userImage: string;
  tokenCount: number;
  onMenuClick?: (menuName: string) => void;
}

function UserInfoSection({
  userName,
  userImage,
  tokenCount,
  onMenuClick,
}: IUserInfoSectionProps) {
  const [activeMenu, setActiveMenu] = useState<string>("판매중인 토큰");

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(menuName);
    onMenuClick?.(menuName);
  }

  return (
    <div className={styles.userInfo} data-testid="user-info-section">
      <h2 className={styles.userInfoTitle} data-testid="user-info-title">
        토큰 보유
      </h2>

      {/* 프로필 */}
      <div className={styles.profile} data-testid="profile">
        <img
          src={userImage}
          alt={userName}
          className={styles.profileImage}
          data-testid="profile-image"
        />
        <p className={styles.profileName} data-testid="profile-name">
          {userName}
        </p>
      </div>

      {/* 구분선 */}
      <hr className={styles.divider} />

      {/* 토큰 잔액 */}
      <div className={styles.pointsSection} data-testid="points-section">
        <PointIcon />
        <div className={styles.pointsValue} data-testid="points-value">
          <p className={styles.pointsValueNumber}>{tokenCount.toLocaleString()}</p>
          <p className={styles.pointsValueLabel}>개</p>
        </div>
      </div>

      {/* 구분선 */}
      <hr className={styles.divider} />

      {/* 메뉴 */}
      <div className={styles.menuList} data-testid="menu-list">
        <button
          className={`${styles.menuItem} ${
            activeMenu === "판매중인 토큰" ? styles.menuItemActive : ""
          }`}
          onClick={() => handleMenuClick("판매중인 토큰")}
          data-testid="menu-item-transactions"
        >
          <p className={styles.menuItemText}>판매중인 토큰</p>
          <RightArrowIcon />
        </button>
        <button
          className={`${styles.menuItem} ${
            activeMenu === "토큰 구매 내역" ? styles.menuItemActive : ""
          }`}
          onClick={() => handleMenuClick("토큰 구매 내역")}
          data-testid="menu-item-points"
        >
          <p className={styles.menuItemText}>토큰 구매 내역</p>
          <RightArrowIcon />
        </button>
        <button
          className={`${styles.menuItem} ${
            activeMenu === "지갑 설정" ? styles.menuItemActive : ""
          }`}
          onClick={() => handleMenuClick("지갑 설정")}
          data-testid="menu-item-password"
        >
          <p className={styles.menuItemText}>지갑 설정</p>
          <RightArrowIcon />
        </button>
      </div>
    </div>
  );
}

/**
 * 토큰 거래 내역 테이블 컴포넌트
 */
interface ITransactionTableProps {
  transactions: ITransaction[];
}

function TransactionTable({ transactions }: ITransactionTableProps) {
  return (
    <div className={styles.tableContainer} data-testid="transaction-table">
      {/* 테이블 헤더 */}
      <div className={styles.tableHeader} data-testid="table-header">
        <p
          className={`${styles.tableHeaderCell} ${styles.tableHeaderNumber}`}
          data-testid="header-number"
        >
          번호
        </p>
        <p
          className={`${styles.tableHeaderCell} ${styles.tableHeaderName}`}
          data-testid="header-name"
        >
          토큰 이름
        </p>
        <p
          className={`${styles.tableHeaderCell} ${styles.tableHeaderPrice}`}
          data-testid="header-price"
        >
          가격
        </p>
        <p
          className={`${styles.tableHeaderCell} ${styles.tableHeaderDate}`}
          data-testid="header-date"
        >
          날짜
        </p>
      </div>

      {/* 테이블 행 */}
      <div data-testid="table-body">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className={styles.tableRow}
            data-testid={`table-row-${index}`}
          >
            <p
              className={`${styles.tableCell} ${styles.tableCellNumber}`}
              data-testid={`cell-number-${index}`}
            >
              {transaction.id}
            </p>
            <div
              className={`${styles.tableCell} ${styles.tableCellName}`}
              data-testid={`cell-name-${index}`}
            >
              <p className={styles.tableCellNameText}>{transaction.name}</p>
              {transaction.status && (
                <p className={styles.tableCellStatus}>{transaction.status}</p>
              )}
            </div>
            <p
              className={`${styles.tableCell} ${styles.tableCellPrice}`}
              data-testid={`cell-price-${index}`}
            >
              {transaction.price}
            </p>
            <p
              className={`${styles.tableCell} ${styles.tableCellDate}`}
              data-testid={`cell-date-${index}`}
            >
              {transaction.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 토큰 지갑 페이지 메인 컴포넌트
 */
export default function Mypage({
  userName = "사용자",
  userImage = "https://api.example.com/profile.jpg",
  tokenCount = 250,
  transactions = [
    {
      id: 1,
      name: "Claude Pro 토큰",
      price: "15,000원",
      date: "2024.12.16",
      status: "거래 완료",
    },
    {
      id: 2,
      name: "Cursor 프리미엄 토큰",
      price: "12,000원",
      date: "2024.12.15",
    },
    {
      id: 3,
      name: "Windsurf 토큰",
      price: "10,000원",
      date: "2024.12.14",
      status: "거래 완료",
    },
    {
      id: 4,
      name: "Codex 토큰",
      price: "8,000원",
      date: "2024.12.13",
      status: "거래 완료",
    },
    {
      id: 5,
      name: "ChatGPT Plus 토큰",
      price: "20,000원",
      date: "2024.12.12",
    },
    {
      id: 6,
      name: "Perplexity Pro 토큰",
      price: "11,000원",
      date: "2024.12.11",
    },
    {
      id: 7,
      name: "V0 개발자 토큰",
      price: "9,000원",
      date: "2024.12.10",
    },
    {
      id: 8,
      name: "Claude Team 토큰",
      price: "25,000원",
      date: "2024.12.09",
    },
    {
      id: 9,
      name: "Cursor 팀 토큰",
      price: "18,000원",
      date: "2024.12.08",
    },
    {
      id: 10,
      name: "GitHub Copilot 토큰",
      price: "13,000원",
      date: "2024.12.07",
    },
  ],
  onSearch,
}: IMypageProps) {
  const [activeTab, setActiveTab] = useState<"판매중인 토큰" | "거래 완료">("판매중인 토큰");
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = () => {
    onSearch?.(searchKeyword);
  };

  return (
    <div className={styles.container} data-testid="mypage">
      {/* 제목 */}
      <h1 className={styles.title} data-testid="page-title">
        토큰 지갑
      </h1>

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout} data-testid="main-layout">
        {/* 왼쪽 사이드바 */}
        <div className={styles.sidebar} data-testid="sidebar">
          <UserInfoSection
            userName={userName}
            userImage={userImage}
            tokenCount={tokenCount}
            onMenuClick={(menuName) => console.log("메뉴 클릭:", menuName)}
          />
        </div>

        {/* 오른쪽 콘텐츠 영역 */}
        <div className={styles.contentArea} data-testid="content-area">
          {/* 탭 섹션 */}
          <div className={styles.tabSection} data-testid="tab-section">
            <button
              className={`${styles.tab} ${activeTab === "판매중인 토큰" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("판매중인 토큰")}
              data-testid="tab-my-products"
            >
              판매중인 토큰
            </button>
            <button
              className={`${styles.tab} ${activeTab === "거래 완료" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("거래 완료")}
              data-testid="tab-bookmarks"
            >
              거래 완료
            </button>
          </div>

          {/* 검색 섹션 */}
          <div className={styles.searchSection} data-testid="search-section">
            <div className={styles.searchBar} data-testid="search-bar">
              <span>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="토큰을 검색해 주세요."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                data-testid="search-input"
              />
            </div>
            <button
              className={styles.searchButton}
              onClick={handleSearch}
              data-testid="search-button"
            >
              검색
            </button>
          </div>

          {/* 토큰 거래 내역 테이블 */}
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
