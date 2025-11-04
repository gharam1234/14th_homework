'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import { TokenDetail as TokenDetailType, TokenDetailProps } from './types';

/**
 * 더미 토큰 데이터
 */
const DUMMY_TOKEN_DATA: TokenDetailType = {
  id: 'token-001',
  title: 'Claude Code Token - Cursor Edition',
  price: 45000,
  originalPrice: 60000,
  description: `클로드 코드로 작성된 프리미엄 토큰입니다.

이 토큰은 Cursor Editor에서 최적화되어 있으며, 다양한 개발 환경에서 사용할 수 있습니다.

주요 특징:
• 빠른 응답 속도
• 높은 정확도
• 안정적인 성능
• 24시간 기술 지원

이 토큰을 사용하면 개발 생산성을 50% 이상 향상시킬 수 있습니다.
안전한 거래를 위해 에스크로 서비스를 제공하고 있습니다.`,
  category: '클로드코드',
  subcategory: '개발 도구',
  hashtags: ['#인기토큰', '#클로드코드', '#신뢰'],
  seller: {
    id: 'seller-001',
    name: '신뢰할 수 있는 판매자',
    rating: 4.8,
    totalSales: 234,
    responseRate: 98,
    location: '서울시 강남구 선릉로',
    latitude: 37.4979,
    longitude: 127.0276,
    profileImage: '/images/프로필아이콘.png',
  },
  images: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=180&h=136&fit=crop',
  ],
  mainImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop',
  status: 'available',
  views: 2450,
  likes: 127,
  createdAt: '2025-11-04T10:30:00Z',
  updatedAt: '2025-11-04T10:30:00Z',
};

/**
 * 토큰 상세 페이지 컴포넌트
 */
export default function TokenDetail({ data = DUMMY_TOKEN_DATA, onChat, onBookmark, onShare }: TokenDetailProps) {
  const tokenData = data || DUMMY_TOKEN_DATA;
  const [messageText, setMessageText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const messageLength = messageText.length;
  const maxLength = 100;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxLength) {
      setMessageText(text);
    }
  };

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const handleSubmitMessage = () => {
    if (messageText.trim()) {
      console.log('문의 메시지 전송:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        {/* === 헤더 섹션 === */}
        <section className={styles.headerSection}>
          {/* 제목 및 액션 버튼 */}
          <div className={styles.titleArea}>
            <div className={styles.titleHeader}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{tokenData.title}</h1>
                <div className={styles.actionButtons}>
                  {/* 삭제 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="삭제"
                    onClick={() => console.log('삭제 버튼 클릭')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 공유 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="공유"
                    onClick={onShare}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.15c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.44 9.31 6.77 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.77 0 1.44-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 위치 아이콘 */}
                  <button
                    className={styles.iconButton}
                    title="위치"
                    onClick={() => console.log('위치 버튼 클릭')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                        fill="#333333"
                      />
                    </svg>
                  </button>

                  {/* 북마크 배지 */}
                  <div className={styles.bookmarkBadge}>
                    <button
                      className={styles.iconButton}
                      onClick={handleBookmarkClick}
                      title="북마크"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M17 3H5c-1.11 0-2 .9-2 2v16l7-3 7 3V5c0-1.1.89-2 2-2z"
                          fill={isBookmarked ? '#ffffff' : 'none'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <p className={styles.bookmarkCount}>{tokenData.likes}</p>
                  </div>
                </div>
              </div>
              <p className={styles.subtitle}>{tokenData.seller.name}의 신뢰할 수 있는 거래</p>
              <p className={styles.hashtags}>{tokenData.hashtags.join(' ')}</p>
            </div>

            {/* 이미지 갤러리 */}
            <div className={styles.imageGallery}>
              {/* 메인 이미지 */}
              <div className={styles.mainImageWrapper}>
                <img
                  src={tokenData.mainImage}
                  alt="메인 이미지"
                  className={styles.mainImage}
                />
              </div>

              {/* 썸네일 */}
              <div className={styles.thumbnailWrapper}>
                {tokenData.images.slice(1).map((image, index) => (
                  <div key={index} className={`${styles.thumbnail} ${index > 0 ? styles.thumbnailInactive : ''}`}>
                    <img
                      src={image}
                      alt={`썸네일 ${index + 1}`}
                      className={styles.thumbnailImage}
                    />
                  </div>
                ))}
                <div className={styles.thumbnailGradient} />
              </div>
            </div>
          </div>
        </section>

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 상세 설명 섹션 === */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>상세 설명</h2>
          <div className={styles.descriptionContent}>
            {tokenData.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </section>

        {/* === 구분선 === */}
        <div className={styles.divider} />

        {/* === 위치 섹션 === */}
        <section className={styles.locationSection}>
          <h2 className={styles.sectionTitle}>상세 위치</h2>
          <div className={styles.mapContainer}>
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=844&h=280&fit=crop"
              alt="판매자 위치"
              className={styles.mapImage}
            />
          </div>
        </section>

        {/* === 문의 섹션 === */}
        <section className={styles.inquirySection}>
          <div className={styles.inquiryForm}>
            {/* 문의 헤더 */}
            <div className={styles.inquiryHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                  fill="#333333"
                />
              </svg>
              <h3 className={styles.inquiryTitle}>이 판매자에게 문의하기</h3>
            </div>

            {/* 문의 입력폼 */}
            <div className={styles.inputContainer}>
              <textarea
                className={styles.messageInput}
                placeholder="메시지를 입력해 주세요."
                value={messageText}
                onChange={handleMessageChange}
                maxLength={maxLength}
              />
              <div className={styles.inputFooter}>
                <p className={styles.charCount}>
                  {messageLength}/{maxLength}
                </p>
                <button className={styles.submitButton} onClick={handleSubmitMessage}>
                  <span className={styles.submitButtonText}>구매하기</span>
                </button>
              </div>
            </div>
          </div>

          {/* 빈 상태 메시지 */}
          {false && <p className={styles.emptyMessage}>아직 문의가 없습니다.</p>}
        </section>

        {/* 여백 */}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}
