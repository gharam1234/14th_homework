"use client";

import React from "react";
import styles from "./styles.module.css";
import { Input } from "@/commons/components/input";
import { Button } from "@/commons/components/button";
import Image from "next/image";

// 보드 작성 UI 컴포넌트
// - 피그마 노드 레이아웃을 기준으로 고정 사이즈를 적용
// - 공통컴포넌트는 variant/size/className만 사용 (원본 수정 금지)
export default function BoardsWriteUI(): JSX.Element {
  return (
    <section className={styles.writeContainer}>
      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-header: 1280 * 68 (노드: 285:32386) */}
      <header className={styles.writeHeader}>
        <h1 className={styles.headerTitle}>게시물 등록</h1>
      </header>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-title: 1280 * 80 (노드: 285:32394) */}
      <div className={styles.writeTitle}>
        <h2>제목</h2>
        <Input
          variant="primary"
          placeholder="제목을 입력하세요"
          maxLength={100}
          className={styles.fullWidth}
        />
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-contents: 1280 * 368 (노드: 285:32396) */}
      <div className={styles.writeContents}>
        {/* Input 컴포넌트만 사용 요구 → 멀티라인은 높이로 대체 */}
        <Input
          variant="secondary"
          placeholder="내용을 입력하세요"
          className={styles.fullWidth}
        />
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-address: 1280 * 192 (노드: 285:32401) */}
      <div className={styles.writeAddress}>
        <div className={styles.addressRow}>
          <Input
            variant="primary"
            placeholder="우편번호 검색"
            disabled
            className={styles.zipInput}
          />
          <Button variant="secondary" className={styles.zipButton}>검색</Button>
        </div>
        <div className={styles.addressRow}>
          <Input
            variant="primary"
            placeholder="주소"
            readOnly
            className={styles.fullWidth}
          />
        </div>
        <div className={styles.addressRow}>
          <Input
            variant="primary"
            placeholder="상세주소"
            className={styles.fullWidth}
          />
        </div>
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-utube: 1280 * 80 (노드: 285:32406) */}
      <div className={styles.writeUtube}>
        <Input
          variant="primary"
          placeholder="유튜브 링크를 입력하세요"
          className={styles.fullWidth}
        />
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-images: 1280 * 192 (노드: 285:32408) */}
      <div className={styles.writeImages}>
        <div className={styles.imageGrid}>
          <Image src="/images/add-image.png" alt="이미지 추가" width={410} height={144} className={styles.imageItem} />
          <Image src="/images/add-image.png" alt="이미지 추가" width={410} height={144} className={styles.imageItem} />
          <Image src="/images/add-image.png" alt="이미지 추가" width={410} height={144} className={styles.imageItem} />
        </div>
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-footer: 1280 * 48 (노드: 285:32416) */}
      <footer className={styles.writeFooter}>
        <div className={styles.footerButtons}>
          <Button variant="secondary" className={styles.footerButtonLeft}>닫기</Button>
          <Button variant="primary" className={styles.footerButtonRight}>등록하기</Button>
        </div>
      </footer>
    </section>
  );
}


