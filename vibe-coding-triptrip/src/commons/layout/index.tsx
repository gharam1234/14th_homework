"use client";

import React from "react";
import Slider from "react-slick";
import styles from "./styles.module.css";

type LayoutWireframeProps = {
  children: React.ReactNode;
};

export default function LayoutWireframe({ children }: LayoutWireframeProps) {
  return (
    <div className={styles.container}>
      {/* 네비게이션 영역: 1920x80 (내부 1280 정렬) */}
      <nav className={styles.navigation}>
        <div className={styles.navigationInner}>
          {/* 좌측: 로고 + 탭 */}
          <div className={styles.navLeftGroup}>
            <div className={styles.logoArea} aria-label="logo" />
            <div className={styles.tapGroup}>
              <button className={`${styles.tapItem} ${styles.tapActive}`} type="button">
                {/* '트립토크' */}
                <span className={styles.tapLabelPrimary}>트립토크</span>
              </button>
              <button className={styles.tapItem} type="button">
                {/* '숙박권 구매' */}
                <span className={styles.tapLabel}>숙박권 구매</span>
              </button>
              <button className={styles.tapItem} type="button">
                {/* '마이 페이지' */}
                <span className={styles.tapLabel}>마이 페이지</span>
              </button>
            </div>
          </div>

          {/* 우측: 로그인 버튼 (또는 프로필 영역 대체 가능) */}
          <div className={styles.navRightGroup}>
            <button className={styles.loginButton} type="button">로그인</button>
          </div>
        </div>
      </nav>

      {/* 배너 영역: 1920x516 (react-slick 기반 캐러셀) */}
      <section className={styles.banner} aria-label="main visual banner">
        <Slider
          dots={true}
          infinite={true}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
          autoplay={true}
          autoplaySpeed={3000}
          arrows={true}
        >
          <div>
            <img src="/images/banner1.png" alt="배너 1" style={{ width: '100%', height: '516px', objectFit: 'cover' }} />
          </div>
          <div>
            <img src="/images/banner2.png" alt="배너 2" style={{ width: '100%', height: '516px', objectFit: 'cover' }} />
          </div>
          <div>
            <img src="/images/banner3.png" alt="배너 3" style={{ width: '100%', height: '516px', objectFit: 'cover' }} />
          </div>
        </Slider>
      </section>

      {/* gap 영역: 1920x40 */}
      <div className={styles.gap} />

      {/* children 영역: 1920 x auto */}
      <main className={styles.content}>{children}</main>
    </div>
  );
}


