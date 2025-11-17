'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { InqueriesProps, InquiryItem } from './types';

/**
 * 문의하기 컴포넌트 - Figma 디자인 기반 프레젠테이션 컴포넌트
 *
 * @description 상품 상세 페이지에서 사용자 문의와 판매자 답변을 표시하는 UI 컴포넌트입니다.
 * UI만 렌더링하며, 기능은 부모 컴포넌트에서 구현합니다.
 * @param props - 컴포넌트 속성
 */
export default function Inquiries({
  inputSection = {
    placeholder: '문의사항을 입력해 주세요.',
    submitButtonText: '문의 하기',
    maxLength: 100,
  },
  inquiries = [],
  onSubmitInquiry,
  onSubmitReply,
  onEditInquiry,
  onDeleteInquiry,
  onReplyClick,
}: InqueriesProps) {
  // 입력 텍스트 상태 관리
  const [inquiryText, setInquiryText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  /**
   * 문의 제출 핸들러
   */
  const handleSubmitInquiry = async () => {
    if (!onSubmitInquiry) {
      return;
    }

    try {
      const result = await onSubmitInquiry(inquiryText);
      if (result !== false) {
        setInquiryText('');
      }
    } catch (error) {
      console.error('문의 제출 실패:', error);
    }
  };

  /**
   * 답변 버튼 클릭 핸들러
   */
  const handleReplyClick = (inquiryId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [inquiryId]: !prev[inquiryId],
    }));
    onReplyClick?.(inquiryId);
  };

  /**
   * 답변 제출 핸들러
   */
  const handleSubmitReply = (inquiryId: string) => {
    const text = replyTexts[inquiryId];
    if (text?.trim() && onSubmitReply) {
      onSubmitReply(inquiryId, text);
      setReplyTexts((prev) => ({
        ...prev,
        [inquiryId]: '',
      }));
      setExpandedReplies((prev) => ({
        ...prev,
        [inquiryId]: false,
      }));
    }
  };

  /**
   * 답변 취소 핸들러
   */
  const handleCancelReply = (inquiryId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [inquiryId]: false,
    }));
    setReplyTexts((prev) => ({
      ...prev,
      [inquiryId]: '',
    }));
  };

  /**
   * 아이콘 렌더링 - Chat
   */
  const renderChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 12H6v-2h8v2zm6-4H6v-2h14v2z"
        fill="#333333"
      />
    </svg>
  );

  /**
   * 아이콘 렌더링 - Reply
   */
  const renderReplyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 9V5l-7 7 7 7v-6c5.15.5 8 2.81 10 5.69-.5-4.3-2.99-7.69-10-7.69z"
        fill="#333333"
      />
    </svg>
  );

  /**
   * 아이콘 렌더링 - Return (답변 들여쓰기용)
   */
  const renderReturnIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8zm1.5 0c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5-6.5 2.91-6.5 6.5z"
        fill="#333333"
      />
    </svg>
  );

  /**
   * 아이콘 렌더링 - Edit
   */
  const renderEditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M14.167 2.5l3.333 3.333M2.5 17.5h3.333L15 8.333 11.667 5 2.5 14.167v3.333z"
        fill="#333333"
      />
    </svg>
  );

  /**
   * 아이콘 렌더링 - Close
   */
  const renderCloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M15.833 4.167L4.167 15.833M4.167 4.167l11.666 11.666"
        stroke="#333333"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );

  /**
   * 문의 아이템 렌더링
   */
  const renderInquiryItem = (inquiry: InquiryItem, index: number) => (
    <div key={inquiry.id} className={styles.inquiryItem} data-testid={`inquiry-item-${index}`}>
      <div className={styles.inquiryContent}>
        {/* 프로필 및 정보 */}
        <div className={styles.inquiryHeader}>
          <div className={styles.profile}>
            <div className={styles.profileAvatar}>
              {inquiry.author.avatar ? (
                <img src={inquiry.author.avatar} alt={inquiry.author.name} className={styles.profileAvatarImg} />
              ) : (
                <div style={{ width: '24px', height: '24px' }} />
              )}
            </div>
            <span className={styles.profileName}>{inquiry.author.name}</span>
          </div>
        </div>

        {/* 문의 내용 */}
        <div className={styles.inquiryBody}>{inquiry.content}</div>

        {/* 날짜 및 답변 버튼 */}
        <div className={styles.inquiryFooter}>
          <span className={styles.inquiryDate}>{inquiry.createdAt}</span>
        </div>
      </div>

      {/* 답변 하기 버튼 */}
      <button
        className={styles.replyButton}
        onClick={() => handleReplyClick(inquiry.id)}
        data-testid={`reply-button-${index}`}
      >
        <div className={styles.replyIcon}>{renderReplyIcon()}</div>
        <span>답변 하기</span>
      </button>

      {/* 답변 입력 섹션 (확장 시 표시) */}
      {expandedReplies[inquiry.id] && (
        <div className={styles.replyInputSection}>
          <div className={styles.replyInputWrapper}>
            <div className={styles.textareaContainer}>
              <textarea
                className={styles.replyTextarea}
                placeholder={inputSection.placeholder}
                value={replyTexts[inquiry.id] || ''}
                onChange={(e) => {
                  const text = e.target.value.slice(0, inputSection.maxLength);
                  setReplyTexts((prev) => ({
                    ...prev,
                    [inquiry.id]: text,
                  }));
                }}
                data-testid={`reply-textarea-${index}`}
              />
              <div className={styles.charCount}>{replyTexts[inquiry.id]?.length || 0}/{inputSection.maxLength}</div>
            </div>

            <div className={styles.replyButtonGroup}>
              <button
                className={styles.cancelButton}
                onClick={() => handleCancelReply(inquiry.id)}
                data-testid={`cancel-reply-button-${index}`}
              >
                취소
              </button>
              <button
                className={styles.submitReplyButton}
                onClick={() => handleSubmitReply(inquiry.id)}
                data-testid={`submit-reply-button-${index}`}
              >
                답변 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * 답변 아이템 렌더링 (들여쓰기)
   */
  const renderReplyItem = (reply: InquiryItem, parentIndex: number, replyIndex: number) => (
    <div key={reply.id} className={styles.replyWrapper} data-testid={`reply-item-${parentIndex}-${replyIndex}`}>
      {/* 들여쓰기 표시 */}
      <div className={styles.replyBorder}>
        <div className={styles.replyIcon2}>{renderReturnIcon()}</div>
      </div>

      {/* 답변 내용 */}
      <div className={styles.replyContent}>
        <div className={styles.replyItem}>
          {/* 프로필 및 액션 버튼 */}
          <div className={styles.replyHeader}>
            <div className={styles.replyProfile}>
              <div className={styles.profileAvatar}>
                {reply.author.avatar ? (
                  <img src={reply.author.avatar} alt={reply.author.name} className={styles.profileAvatarImg} />
                ) : (
                  <div style={{ width: '24px', height: '24px' }} />
                )}
              </div>
              <span className={styles.profileName}>{reply.author.name}</span>
            </div>

            {/* 수정/삭제 버튼 */}
            {(reply.canEdit || reply.canDelete) && (
              <div className={styles.replyActions}>
                {reply.canEdit && (
                  <button className={styles.actionButton} onClick={() => onEditInquiry?.(reply.id, reply.content)} data-testid={`edit-reply-${reply.id}`}>
                    {renderEditIcon()}
                  </button>
                )}
                {reply.canDelete && (
                  <button className={styles.actionButton} onClick={() => onDeleteInquiry?.(reply.id)} data-testid={`delete-reply-${reply.id}`}>
                    {renderCloseIcon()}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 답변 내용 */}
          <div className={styles.replyBody}>{reply.content}</div>

          {/* 답변 날짜 */}
          <div className={styles.replyFooter}>
            <span className={styles.replyDate}>{reply.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container} data-testid="inquiries-container">
      {/* === 제목 섹션 === */}
      <section>
        <div className={styles.header}>
          <div className={styles.headerIcon}>{renderChatIcon()}</div>
          <h2 className={styles.headerTitle}>문의하기</h2>
        </div>
      </section>

      {/* === 입력 섹션 === */}
      <section className={styles.inputSection}>
        <div className={styles.inputWrapper}>
          <div className={styles.textareaContainer}>
            <textarea
              className={styles.textarea}
              placeholder={inputSection.placeholder}
              value={inquiryText}
              onChange={(e) => {
                const text = e.target.value;
                setInquiryText(text);
              }}
              data-testid="inquiry-textarea"
            />
            <div className={styles.charCount} data-testid="inquiry-char-count">
              {inquiryText.length}/{inputSection.maxLength}
            </div>
          </div>
          <button className={styles.submitButton} onClick={handleSubmitInquiry} data-testid="submit-inquiry-button">
            {inputSection.submitButtonText}
          </button>
        </div>
      </section>

      {/* === 구분선 === */}
      <hr style={{ border: 'none', borderTop: '1px solid #e4e4e4', margin: 0 }} />

      {/* === 문의 목록 === */}
      <section className={styles.inquiriesList} data-testid="inquiries-list">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry, index) => (
            <div key={inquiry.id}>
              {/* 문의 아이템 */}
              {renderInquiryItem(inquiry, index)}

              {/* 답변 아이템들 */}
              {inquiry.parentId == null && (
                <>
                  {inquiries
                    .filter((item) => item.parentId === inquiry.id)
                    .map((reply, replyIndex) => renderReplyItem(reply, index, replyIndex))}
                </>
              )}

              {/* 구분선 */}
              {index < inquiries.filter((item) => item.parentId == null).length - 1 && (
                <hr style={{ border: 'none', borderTop: '1px solid #e4e4e4', margin: 0 }} />
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ababab' }}>문의가 없습니다.</div>
        )}
      </section>
    </div>
  );
}
