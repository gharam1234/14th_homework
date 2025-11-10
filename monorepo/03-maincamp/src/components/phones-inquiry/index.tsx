'use client';

import { useMemo, useState } from 'react';

import { MyButton as Button, MyTextarea as Textarea } from '@commons/ui';

import styles from './styles.module.css';
import { InquiryItem, PhonesInquiryProps } from './types';

/**
 * PhonesInquiry - Figma 디자인 기반 프레젠테이션 컴포넌트
 *
 * @description 중고폰 상세 페이지의 문의하기 섹션을 표시하는 UI 컴포넌트입니다.
 * Props로 데이터만 받아서 표시하며, 기능은 부모 컴포넌트에서 구현합니다.
 * @param props - 컴포넌트 속성 (inquiries: 문의 목록, placeholderText: 입력 필드 플레이스홀더)
 */

/**
 * 아이콘: 문의 채팅 아이콘
 */
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 수정 아이콘
 */
function EditIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 15.8333V17.5H4.16667L14.2333 7.43333L12.5667 5.76667L2.5 15.8333ZM17.7167 5.68333L15.3167 3.28333C14.9333 2.9 14.3333 2.9 13.95 3.28333L12.1333 5.1L13.8 6.76667L15.6167 4.95C16 4.56667 16 3.96667 15.6167 3.58333L17.7167 5.68333Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 삭제 아이콘
 */
function DeleteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 17.5C2.5 18.3 3.1 19 4 19H16C16.9 19 17.5 18.3 17.5 17.5V5H2.5V17.5ZM19 2H15.5L14.5 1H5.5L4.5 2H1V4H19V2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 더미 문의 데이터
 */
const DUMMY_INQUIRIES: InquiryItem[] = [
  {
    id: 'inquiry-001',
    profileName: '홍길동',
    profileImage: undefined,
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
    canEdit: true,
    canDelete: true,
  },
  {
    id: 'inquiry-002',
    profileName: '마에스트로',
    profileImage: undefined,
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
    canEdit: false,
    canDelete: false,
  },
];

/**
 * 문의 항목 컴포넌트
 */
function InquiryItemComponent({ inquiry }: { inquiry: InquiryItem }) {
  const profileInitial = useMemo(() => inquiry.profileName?.[0] ?? '', [inquiry.profileName]);

  return (
    <div className={styles.inquiryItemContainer} data-testid={`inquiry-item-${inquiry.id}`}>
      {/* 프로필 및 액션 버튼 */}
      <div className={styles.inquiryItemHeader} data-testid="inquiry-item-header">
        <div className={styles.profileSection} data-testid="profile-section">
          {inquiry.profileImage ? (
            <img
              src={inquiry.profileImage}
              alt={`${inquiry.profileName} 프로필 이미지`}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.profileAvatar} aria-hidden="true">
              {profileInitial}
            </div>
          )}
          <p className={styles.profileName}>{inquiry.profileName}</p>
        </div>

        {/* 수정/삭제 버튼 */}
        {(inquiry.canEdit || inquiry.canDelete) && (
          <div className={styles.actionButtons} data-testid="action-buttons">
            {inquiry.canEdit && (
              <button
                className={styles.iconButton}
                title="수정"
                data-testid="edit-button"
              >
                <EditIcon />
              </button>
            )}
            {inquiry.canDelete && (
              <button
                className={styles.iconButton}
                title="삭제"
                data-testid="delete-button"
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 문의 내용 */}
      <p className={styles.inquiryContent} data-testid="inquiry-content">
        {inquiry.content}
      </p>

      {/* 작성 날짜 */}
      <div className={styles.inquiryMetaInfo} data-testid="inquiry-meta">
        <p className={styles.inquiryDate}>{inquiry.createdAt}</p>
      </div>
    </div>
  );
}

/**
 * 문의하기 컴포넌트
 */
export default function PhonesInquiry({
  inquiries = DUMMY_INQUIRIES,
  onSubmit,
  placeholderText = '문의사항을 입력해 주세요.',
  maxLength = 100,
}: PhonesInquiryProps) {
  const [content, setContent] = useState('');
  const characterLimit = maxLength ?? 100;
  const characterLength = content.length;
  const isSubmittable = content.trim().length > 0;

  const handleSubmit = () => {
    if (!isSubmittable) return;
    const trimmed = content.trim();
    onSubmit?.(trimmed);
    setContent('');
  };

  return (
    <div className={styles.container} data-testid="phones-inquiry-container">
      {/* === 문의 입력 섹션 === */}
      <section className={styles.inquiryInputSection} data-testid="inquiry-input-section">
        {/* 헤더: 아이콘 + 제목 */}
        <div className={styles.inquiryHeader} data-testid="inquiry-header">
          <ChatIcon className={styles.inquiryIcon} />
          <h2 className={styles.inquiryTitle} data-testid="inquiry-title">
            문의하기
          </h2>
        </div>

        {/* 입력 폼 */}
        <div className={styles.formContainer} data-testid="form-container">
          <div className={styles.textareaWrapper} data-testid="textarea-wrapper">
            <Textarea
              className={styles.textarea}
              placeholder={placeholderText}
              maxLength={characterLimit}
              value={content}
              onChange={(value) => setContent(value)}
              data-testid="inquiry-textarea"
            />
            <div className={styles.characterCount} data-testid="character-count">
              {characterLength}/{characterLimit}
            </div>
          </div>

          {/* 버튼 */}
          <div className={styles.buttonContainer} data-testid="button-container">
            <div className={styles.submitButtonWrapper} data-testid="submit-button">
              <Button
                variant="primary"
                isActive={isSubmittable}
                onClick={handleSubmit}
                type="button"
              >
                문의 하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* === 문의 목록 섹션 === */}
      <section
        className={styles.inquiriesListSection}
        data-testid="inquiries-list-section"
      >
        {inquiries && inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <InquiryItemComponent key={inquiry.id} inquiry={inquiry} />
          ))
        ) : (
          <div className={styles.emptyState} data-testid="empty-state">
            <p className={styles.emptyMessage}>아직 문의가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
