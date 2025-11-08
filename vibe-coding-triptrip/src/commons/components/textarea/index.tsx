import React from 'react';
import styles from './styles.module.css';

// 텍스트에어리어 변형과 크기를 정의 (주석은 항상 한국어)
export type TextareaVariant = 'primary' | 'secondary' | 'tertiary';
export type TextareaSize = 'small' | 'medium' | 'large';

// 외부에서 사용할 Props 타입 정의
export type TextareaProps = {
  variant?: TextareaVariant; // 기본: 'primary'
  size?: TextareaSize; // 기본: 'medium'
  label?: string; // 외부 라벨 텍스트
  helperText?: string; // 보조 설명 텍스트
  error?: string | boolean; // 에러 메시지 또는 에러 여부
  showCount?: boolean; // 글자 수 카운터 표시 여부 (예: 0/200)
  className?: string; // 루트 클래스 확장 지점
  textareaClassName?: string; // textarea 엘리먼트 확장 지점
  leftIcon?: React.ReactNode; // (선택) 왼쪽 아이콘 슬롯
  rightIcon?: React.ReactNode; // (선택) 오른쪽 아이콘 슬롯
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 피그마 토큰을 반영한 텍스트에어리어 컴포넌트
// - variant: 'primary' | 'secondary' | 'tertiary'
// - size: 'small' | 'medium' | 'large'
// - 라벨/헬퍼/에러/카운터 지원, 접근성 고려
export const Textarea: React.FC<TextareaProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  helperText,
  error,
  showCount,
  className,
  textareaClassName,
  leftIcon,
  rightIcon,
  id,
  disabled,
  maxLength,
  ...props
}) => {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const hasError = Boolean(error);

  // 제어/비제어 모두 지원: 글자 수 계산을 위해 내부 값 보조 상태 사용
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

  const textareaClass = cx(styles.textarea, textareaClassName);

  return (
    <label className={rootClassName} htmlFor={textareaId} aria-disabled={disabled || undefined}>
      {label ? (
        <span className={styles.label}>
          {label}
          {props.required ? <span className={styles.requiredMark}>*</span> : null}
        </span>
      ) : null}

      <div className={styles.field}>
        {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
        <textarea
          id={textareaId}
          className={textareaClass}
          aria-invalid={hasError || undefined}
          disabled={disabled}
          maxLength={maxLength}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        {rightIcon ? <span className={styles.rightIcon}>{rightIcon}</span> : null}
      </div>

      {hasError ? (
        typeof error === 'string' ? (
          <span className={styles.errorText}>{error}</span>
        ) : (
          <span className={styles.errorText}>유효하지 않은 값입니다.</span>
        )
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}

      {showCount && typeof maxLength === 'number' ? (
        <div className={styles.counter} aria-live="polite">
          <span className={styles.counterText}>
            {Math.min(currentValue.length, maxLength)}/{maxLength}
          </span>
        </div>
      ) : null}
    </label>
  );
};

export default Textarea;

