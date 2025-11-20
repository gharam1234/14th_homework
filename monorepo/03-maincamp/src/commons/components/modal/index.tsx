"use client"

import React from 'react';
import { Button } from '../button';
import styles from './styles.module.css';

// 모달 variant 타입 정의
export type ModalVariant = 'info' | 'danger';
export type ModalActions = 'single' | 'dual';
export type ModalTheme = 'light' | 'dark';

// 모달 프롭스 인터페이스
export interface ModalProps {
  /** 모달의 시각적 스타일 variant */
  variant?: ModalVariant;
  /** 모달의 액션 타입 (단일/이중 버튼) */
  actions?: ModalActions;
  /** 모달의 테마 (light/dark) */
  theme?: ModalTheme;
  /** 모달 제목 */
  title: string;
  /** 모달 메시지 */
  message: string;
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 버튼 클릭 콜백 */
  onConfirm?: () => void;
  /** 취소 버튼 클릭 콜백 */
  onCancel?: () => void;
  /** 테스트 식별자 */
  'data-testid'?: string;
}

/**
 * Modal 컴포넌트
 * 
 * Figma 디자인을 기반으로 한 완전한 variant 시스템을 제공합니다.
 * - variant: info, danger
 * - actions: single, dual
 * - theme: light, dark
 * - modal.provider와 함께 사용하도록 설계됨
 * 
 * @example
 * ```tsx
 * // 기본 info 모달 (단일 액션)
 * <Modal
 *   title="일기 등록 완료"
 *   message="등록이 완료 되었습니다."
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   confirmText="확인"
 *   onConfirm={handleConfirm}
 * />
 * 
 * // danger 모달 (이중 액션)
 * <Modal
 *   variant="danger"
 *   actions="dual"
 *   title="일기 등록 취소"
 *   message="일기 등록을 취소 하시겠어요?"
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   confirmText="등록 취소"
 *   cancelText="계속 작성"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  variant = 'info',
  actions = 'single',
  theme = 'light',
  title,
  message,
  isOpen,
  onClose,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  'data-testid': dataTestId,
}) => {
  // CSS 클래스 조합
  const modalClasses = [
    styles.modal,
    styles[`modal--${variant}`],
    styles[`modal--${actions}`],
    styles[`modal--${theme}`],
  ]
    .filter(Boolean)
    .join(' ');

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // ESC 키 처리는 modal.provider에서 담당하므로 여기서는 비활성화
  // React.useEffect(() => {
  //   const handleEscape = (event: KeyboardEvent) => {
  //     if (event.key === 'Escape') {
  //       onClose();
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener('keydown', handleEscape);
  //   }

  //   return () => {
  //     document.removeEventListener('keydown', handleEscape);
  //   };
  // }, [isOpen, onClose]);

  // 모달이 열려있지 않으면 렌더링하지 않음 (Hook 호출 이후에 배치)
  if (!isOpen) return null;

  return (
    <div 
      className={modalClasses}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      data-testid={dataTestId || (variant === 'info' ? 'success-modal' : 'error-modal')}
    >
        {/* 모달 콘텐츠 영역 */}
        <div className={styles.modalContent}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
          <p id="modal-message" className={styles.modalMessage}>
            {message}
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className={styles.modalActions}>
          {actions === 'dual' && (
            <Button
              variant="secondary"
              theme="light"
              size="medium"
              className={styles.modalButton}
              onClick={handleCancel}
              data-testid="delete-cancel-button"
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant="primary"
            theme="light"
            size="medium"
            className={actions === 'single' ? styles.modalButtonSingle : styles.modalButton}
            onClick={handleConfirm}
            data-testid="delete-confirm-button"
          >
            {confirmText}
          </Button>
        </div>
    </div>
  );
};

// 기본 export
export default Modal;
