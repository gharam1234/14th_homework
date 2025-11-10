import React from 'react';
import styles from './styles.module.css';

// 텍스트 영역 변형과 크기를 정의하는 타입 (주석은 항상 한국어)
export type TextareaVariant = 'primary' | 'secondary' | 'tertiary';
export type TextareaSize = 'small' | 'medium' | 'large';

// 컴포넌트 외부에서 사용할 수 있도록 명시적인 Props 타입을 제공
export type TextareaProps = {
  variant?: TextareaVariant; // 기본: 'primary'
  size?: TextareaSize; // 기본: 'medium'
  error?: string | boolean; // 에러 메시지 또는 에러 여부
  label?: string; // 외부 라벨 텍스트
  helperText?: string; // 보조 설명 텍스트
  showCount?: boolean; // 글자 수 카운터 표시 여부 (피그마: 우측 정렬 0/100)
  className?: string; // 외부 클래스 확장 지점
  textareaClassName?: string; // 텍스트 영역 엘리먼트 확장 지점
  placeholder?: string; // 플레이스홀더 텍스트
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 피그마 토큰을 반영한 텍스트 영역 컴포넌트
// - variant: 'primary' | 'secondary' | 'tertiary'
// - size: 'small' | 'medium' | 'large'
// - 라벨/헬퍼/에러 메시지 지원
export const Textarea: React.FC<TextareaProps> = ({
  variant = 'primary',
  size = 'medium',
  error,
  label,
  helperText,
  showCount,
  className,
  textareaClassName,
  id,
  disabled,
  placeholder,
  ...props
}) => {
  // 훅은 항상 동일한 순서로 호출되어야 하므로, 무조건 생성 후 선택적으로 사용
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
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
        <textarea
          id={textareaId}
          className={textareaClass}
          aria-invalid={hasError || undefined}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
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

export default Textarea;
