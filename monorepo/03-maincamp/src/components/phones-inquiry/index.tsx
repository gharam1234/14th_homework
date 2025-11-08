/**
 * 상품 상세 페이지의 문의하기 폼 컴포넌트
 *
 * @description Figma 디자인을 구현한 프레젠테이션 컴포넌트입니다.
 * 문의사항 입력 폼을 렌더링하며, 기능은 부모 컴포넌트에서 구현합니다.
 * @param props - 컴포넌트 속성
 */
'use client'

import React from 'react'
import { MyButton } from '@commons/ui'
import { IPhonesInquiryProps } from './types'
import styles from './styles.module.css'

/** 채팅 아이콘 SVG 컴포넌트 */
function ChatIcon() {
  return (
    <svg
      className={styles.titleIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="chat-icon"
    >
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function PhonesInquiry({
  text = '',
  onChangeText,
  onSubmit,
  maxLength = 100,
  isLoading = false,
  error,
  disabled = false,
  placeholder = '문의사항을 입력해 주세요',
}: IPhonesInquiryProps) {
  /**
   * textarea 변경 핸들러
   * 최대 문자 수를 초과하지 않도록 제한합니다.
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= maxLength) {
      onChangeText?.(newText)
    }
  }

  const currentLength = text?.length ?? 0

  return (
    <div className={styles.container} data-testid="phones-inquiry">
      {/* 제목 섹션 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <ChatIcon />
          <p className={styles.titleText}>문의하기</p>
        </div>

        {/* 입력 폼 섹션 */}
        <div className={styles.inputSection}>
          {/* Textarea 래퍼 */}
          <div className={styles.textAreaWrapper}>
            <textarea
              className={styles.textArea}
              value={text}
              onChange={handleTextChange}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              data-testid="inquiry-textarea"
              aria-label="문의 내용"
            />

            {/* 문자 수 표시 */}
            <div className={styles.countWrapper}>
              <p className={styles.count} data-testid="char-count">
                {currentLength}/{maxLength}
              </p>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p
              style={{
                color: '#ff4d4d',
                fontSize: '1.4rem',
                margin: '0',
                textAlign: 'right',
              }}
              data-testid="error-message"
            >
              {error}
            </p>
          )}

          {/* 버튼 래퍼 */}
          <div className={styles.buttonWrapper} data-testid="submit-button">
            <MyButton
              onClick={onSubmit}
              disabled={disabled || isLoading || currentLength === 0}
              variant="primary"
            >
              {isLoading ? '제출 중...' : '문의 하기'}
            </MyButton>
          </div>
        </div>
      </div>
    </div>
  )
}
