import React from 'react';
import styles from './styles.module.css';

// 입력 필드 변형과 크기를 정의하는 타입 (주석은 항상 한국어)
export type InputVariant = 'primary' | 'secondary' | 'tertiary';
export type InputSize = 'small' | 'medium' | 'large';

// 컴포넌트 외부에서 사용할 수 있도록 명시적인 Props 타입을 제공
export type InputProps = {
  variant?: InputVariant; // 기본: 'primary'
  size?: InputSize; // 기본: 'medium'
  leftIcon?: React.ReactNode; // 왼쪽 아이콘 슬롯
  rightIcon?: React.ReactNode; // 오른쪽 아이콘 슬롯
  error?: string | boolean; // 에러 메시지 또는 에러 여부
  label?: string; // 외부 라벨 텍스트
  helperText?: string; // 보조 설명 텍스트
  showCount?: boolean; // 글자 수 카운터 표시 여부 (피그마: 우측 정렬 0/100)
  className?: string; // 외부 클래스 확장 지점
  inputClassName?: string; // 인풋 엘리먼트 확장 지점
} & React.InputHTMLAttributes<HTMLInputElement>;

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 피그마 토큰을 반영한 입력 컴포넌트
// - variant: 'primary' | 'secondary' | 'tertiary'
// - size: 'small' | 'medium' | 'large'
// - 라벨/헬퍼/에러 메시지 지원
export const Input: React.FC<InputProps> = ({
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  error,
  label,
  helperText,
  showCount,
  className,
  inputClassName,
  id,
  disabled,
  ...props
}) => {
  // 훅은 항상 동일한 순서로 호출되어야 하므로, 무조건 생성 후 선택적으로 사용
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  // 글자 수 계산을 위해 내부 값 상태를 보조로 사용 (제어/비제어 모두 지원)
  const [internalValue, setInternalValue] = React.useState<string>(
    (typeof props.defaultValue === 'string' ? props.defaultValue : '') as string,
  );
  const isControlled = typeof props.value === 'string';
  const currentValue = (isControlled ? (props.value as string) : internalValue) ?? '';

  const rootClassName = cx(
    styles.root,
    variant === 'primary' && styles.variantPrimary,
    variant === 'secondary' && styles.variantSecondary,
    variant === 'tertiary' && styles.variantTertiary,
    size === 'small' && styles.sizeSmall,
    size === 'medium' && styles.sizeMedium,
    size === 'large' && styles.sizeLarge,
    disabled && styles.isDisabled,
    hasError && styles.isError,
    className,
  );

  const inputClass = cx(styles.input, inputClassName);

  return (
    <label className={rootClassName} htmlFor={inputId} aria-disabled={disabled || undefined}>
      {label ? (
        <span className={styles.label}>
          {label}
          {props.required ? <span className={styles.requiredMark}>*</span> : null}
        </span>
      ) : null}
      <div className={styles.field}>
        {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
        <input
          id={inputId}
          className={inputClass}
          aria-invalid={hasError || undefined}
          disabled={disabled}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        {rightIcon ? <span className={styles.rightIcon}>{rightIcon}</span> : null}
      </div>
      {hasError ? (
        typeof error === 'string' ? <span className={styles.errorText}>{error}</span> : <span className={styles.errorText}>유효하지 않은 값입니다.</span>
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}
      {showCount && typeof props.maxLength === 'number' ? (
        <div className={styles.counter} aria-live="polite">
          <span className={styles.counterText}>{Math.min(currentValue.length, props.maxLength)}/{props.maxLength}</span>
        </div>
      ) : null}
    </label>
  );
};

export default Input;


