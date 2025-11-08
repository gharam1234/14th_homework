'use client';

import React from 'react';
import { MyButton } from '../commons/components/button';
import styles from './styles.module.css';
import { IModalProps } from './types';

/**
 * Modal 컴포넌트
 *
 * @description Figma 디자인 기반 모달 컴포넌트입니다.
 * 프로바이더 패턴과 함께 사용하며, 자체 backdrop을 포함합니다.
 * type과 actions 조합으로 다양한 모달 변형을 지원합니다.
 *
 * @param props - Modal 컴포넌트 Props
 * @returns Modal 컴포넌트
 */
export function Modal({
  isOpen,
  type,
  actions,
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  onBackdropClick,
}: IModalProps) {
  /**
   * Primary 버튼 타입에 따른 CSS 클래스명 반환
   */
  const getPrimaryButtonWrapperClass = (): string => {
    switch (type) {
      case 'danger':
        return styles.buttonDanger;
      case 'warning':
        return styles.buttonWarning;
      case 'info':
      default:
        return styles.buttonPrimary;
    }
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.open : ''}`}
      data-testid="modal-container"
    >
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onBackdropClick}
        data-testid="modal-backdrop"
        role="presentation"
      >
        {/* 클릭 이벤트 전파 방지 */}
        <div
          onClick={(e) => e.stopPropagation()}
          data-testid="modal-content-wrapper"
        >
          {/* Modal Content */}
          <div className={styles.content} data-testid="modal-content">
            {/* 제목과 설명 */}
            <div className={styles.textSection}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.description}>{description}</p>
            </div>

            {/* 액션 버튼 영역 */}
            <div
              className={`${styles.actionSection} ${styles[actions]}`}
              data-testid="modal-actions"
            >
              {/* 이중 버튼인 경우, secondary 버튼 먼저 */}
              {actions === 'dual' && (
                <div className={`${styles.buttonWrapper} ${styles.secondary}`}>
                  <MyButton
                    variant="secondary"
                    onClick={onSecondaryClick}
                    data-testid="modal-secondary-button"
                  >
                    {secondaryButtonText}
                  </MyButton>
                </div>
              )}

              {/* Primary 버튼 */}
              <div
                className={`${styles.buttonWrapper} ${getPrimaryButtonWrapperClass()}`}
              >
                <MyButton
                  variant="primary"
                  onClick={onPrimaryClick}
                  data-testid="modal-primary-button"
                >
                  {primaryButtonText}
                </MyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
