"use client"

import React from 'react';
import styles from './styles.module.css';

// 버튼 variant 타입 정의
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonTheme = 'light' | 'dark';

// 버튼 프롭스 인터페이스
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼의 시각적 스타일 variant */
  variant?: ButtonVariant;
  /** 버튼의 크기 */
  size?: ButtonSize;
  /** 버튼의 테마 (light/dark) */
  theme?: ButtonTheme;
  /** 버튼 앞에 표시될 아이콘 */
  startIcon?: React.ReactNode;
  /** 버튼 뒤에 표시될 아이콘 */
  endIcon?: React.ReactNode;
  /** 로딩 상태 표시 */
  loading?: boolean;
  /** 전체 너비 차지 여부 */
  fullWidth?: boolean;
  /** 자식 요소 (버튼 텍스트) */
  children: React.ReactNode;
}

/**
 * Button 컴포넌트
 * 
 * Figma 디자인을 기반으로 한 완전한 variant 시스템을 제공합니다.
 * - variant: primary, secondary, tertiary
 * - size: small, medium, large
 * - theme: light, dark
 * - 아이콘 지원 (startIcon, endIcon)
 * - 로딩 상태 지원
 * - 접근성 완전 준수
 * 
 * @example
 * ```tsx
 * // 기본 primary 버튼
 * <Button>확인</Button>
 * 
 * // 아이콘이 있는 secondary 버튼
 * <Button variant="secondary" startIcon={<PlusIcon />}>
 *   일기쓰기
 * </Button>
 * 
 * // 큰 사이즈의 tertiary 버튼
 * <Button variant="tertiary" size="large" theme="dark">
 *   취소
 * </Button>
 * 
 * // 로딩 상태의 전체 너비 버튼
 * <Button loading fullWidth>
 *   저장 중...
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  theme = 'light',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}) => {
  // CSS 클래스 조합
  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    styles[`button--${theme}`],
    loading && styles['button--loading'],
    (disabled || loading) && styles['button--disabled'],
    fullWidth && styles['button--full-width'],
    startIcon && styles['button--with-start-icon'],
    endIcon && styles['button--with-end-icon'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {/* 로딩 스피너 */}
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg
            className={styles.spinnerIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M22 12c0-5.52-4.48-10-10-10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}

      {/* 시작 아이콘 */}
      {startIcon && !loading && (
        <span className={styles.startIcon} aria-hidden="true">
          {startIcon}
        </span>
      )}

      {/* 버튼 텍스트 */}
      <span className={styles.content}>
        {children}
      </span>

      {/* 끝 아이콘 */}
      {endIcon && !loading && (
        <span className={styles.endIcon} aria-hidden="true">
          {endIcon}
        </span>
      )}
    </button>
  );
};

// 기본 export
export default Button;
