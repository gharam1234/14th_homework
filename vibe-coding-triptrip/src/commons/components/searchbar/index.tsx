import React from 'react';
import styles from './styles.module.css';

// 검색바 변형 및 크기 타입 정의 (주석은 항상 한국어)
export type SearchBarVariant = 'primary' | 'secondary' | 'tertiary';
export type SearchBarSize = 'small' | 'medium' | 'large';

// 외부에서 사용할 수 있는 Props 타입 정의
export type SearchBarProps = {
  variant?: SearchBarVariant; // 기본: 'primary'
  size?: SearchBarSize; // 기본: 'medium'
  leftIcon?: React.ReactNode; // 좌측 아이콘 슬롯 (예: 검색 아이콘)
  rightIcon?: React.ReactNode; // 우측 아이콘 슬롯 (예: 지우기 버튼)
  className?: string; // 루트 확장 클래스
  inputClassName?: string; // 인풋 확장 클래스
  placeholder?: string; // 플레이스홀더 텍스트
  label?: string; // 접근성 및 시각용 라벨 (시각 라벨 미사용 시 스크린리더 전용 제공)
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 피그마 토큰을 반영한 검색바 컴포넌트
// - variant: 'primary' | 'secondary' | 'tertiary'
// - size: 'small' | 'medium' | 'large'
// - 좌우 아이콘 슬롯 지원, 접근성 준수
export const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  className,
  inputClassName,
  placeholder = '제목을 검색해 주세요.',
  label,
  id,
  disabled,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  // 시각 라벨이 없는 경우 스크린 리더 전용 라벨을 제공
  const ariaLabel = !label ? '검색어 입력' : undefined;

  const rootClassName = cx(
    styles.root,
    variant === 'primary' && styles.variantPrimary,
    variant === 'secondary' && styles.variantSecondary,
    variant === 'tertiary' && styles.variantTertiary,
    size === 'small' && styles.sizeSmall,
    size === 'medium' && styles.sizeMedium,
    size === 'large' && styles.sizeLarge,
    disabled && styles.isDisabled,
    className,
  );

  const inputClass = cx(styles.input, inputClassName);

  return (
    <label className={rootClassName} htmlFor={inputId} aria-disabled={disabled || undefined}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div className={styles.field} role="search">
        {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
        <input
          id={inputId}
          className={inputClass}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
          {...props}
        />
        {rightIcon ? <span className={styles.rightIcon}>{rightIcon}</span> : null}
      </div>
    </label>
  );
};

export default SearchBar;

