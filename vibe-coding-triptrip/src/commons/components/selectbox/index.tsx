import React from 'react';
import styles from './styles.module.css';

// 셀렉트박스 변형과 크기를 정의하는 타입 (주석은 항상 한국어)
export type SelectBoxVariant = 'primary' | 'secondary' | 'tertiary';
export type SelectBoxSize = 'small' | 'medium' | 'large';

// 옵션 타입 정의
export type SelectOption = {
  label: string; // 사용자에게 보이는 라벨
  value: string; // 내부 값
  disabled?: boolean; // 비활성 옵션 여부
};

// 컴포넌트 외부에서 사용할 수 있도록 명시적인 Props 타입을 제공
export type SelectBoxProps = {
  variant?: SelectBoxVariant; // 기본: 'primary'
  size?: SelectBoxSize; // 기본: 'medium'
  label?: string; // 외부 라벨 텍스트
  placeholder?: string; // 값이 없을 때 표시할 안내 텍스트
  helperText?: string; // 보조 설명 텍스트
  error?: string | boolean; // 에러 메시지 또는 에러 여부
  options: SelectOption[]; // 표시할 옵션 목록
  value?: string; // 제어 컴포넌트 값
  defaultValue?: string; // 비제어 초기값
  onChange?: (value: string, option: SelectOption | undefined) => void; // 값 변경 콜백
  disabled?: boolean; // 전체 비활성화
  className?: string; // 외부 클래스 확장 지점
  triggerClassName?: string; // 트리거 엘리먼트 확장 지점
  panelClassName?: string; // 패널 엘리먼트 확장 지점
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>;

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 키보드 네비게이션을 위한 유틸: 다음 활성 인덱스 계산
function getNextEnabledIndex(options: SelectOption[], startIndex: number, delta: 1 | -1): number {
  const len = options.length;
  if (len === 0) return -1;
  let i = startIndex;
  for (let step = 0; step < len; step += 1) {
    i = (i + delta + len) % len;
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

export const SelectBox: React.FC<SelectBoxProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  placeholder = '선택하세요',
  helperText,
  error,
  options,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  triggerClassName,
  panelClassName,
  id,
  ...props
}) => {
  // 접근성: 레이블과 리스트박스 연결을 위한 ID 생성
  const generatedId = React.useId();
  const rootId = id ?? `selectbox-${generatedId}`;
  const listboxId = `${rootId}-listbox`;

  // 제어/비제어 값을 모두 지원
  const isControlled = typeof value === 'string';
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const selectedValue = (isControlled ? value : internalValue) ?? '';
  const selectedIndex = options.findIndex((o) => o.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // 열림 상태 및 하이라이트 인덱스 관리
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(
    selectedIndex >= 0 ? selectedIndex : getNextEnabledIndex(options, -1, 1),
  );

  // 외부 클릭으로 패널 닫기
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function onDocumentMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, []);

  // 열릴 때 선택/가능 항목으로 하이라이트 초기화
  React.useEffect(() => {
    if (isOpen) {
      const baseIndex = selectedIndex >= 0 ? selectedIndex : -1;
      const next = getNextEnabledIndex(options, baseIndex, 1);
      setHighlightedIndex(next);
    }
  }, [isOpen, selectedIndex, options]);

  const hasError = Boolean(error);

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
    isOpen && styles.isOpen,
    className,
  );

  const triggerClass = cx(styles.trigger, triggerClassName);
  const panelClass = cx(styles.panel, panelClassName);

  function commitChange(nextValue: string, nextIndex: number) {
    const nextOption = options[nextIndex];
    if (!nextOption || nextOption.disabled) return;
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue, nextOption);
  }

  function onTriggerClick() {
    if (disabled) return;
    setIsOpen((v) => !v);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = getNextEnabledIndex(options, highlightedIndex, 1);
      if (next >= 0) setHighlightedIndex(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = getNextEnabledIndex(options, highlightedIndex, -1);
      if (next >= 0) setHighlightedIndex(next);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = getNextEnabledIndex(options, -1, 1);
      if (first >= 0) setHighlightedIndex(first);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = (() => {
        for (let i = options.length - 1; i >= 0; i -= 1) {
          if (!options[i]?.disabled) return i;
        }
        return -1;
      })();
      if (last >= 0) setHighlightedIndex(last);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        const hv = options[highlightedIndex]?.value as string;
        commitChange(hv, highlightedIndex);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      id={rootId}
      className={rootClassName}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      <button
        type="button"
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={hasError || undefined}
        onClick={onTriggerClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
      >
        <span className={styles.selectedValue}>
          {selectedOption ? selectedOption.label : <span className={styles.placeholder}>{placeholder}</span>}
        </span>
        <span className={styles.rightIcon} aria-hidden>
          ▼
        </span>
      </button>
      {isOpen ? (
        <div className={panelClass} role="presentation">
          <ul id={listboxId} role="listbox" className={styles.listbox} aria-activedescendant={highlightedIndex >= 0 ? `${rootId}-opt-${highlightedIndex}` : undefined}>
            {options.map((opt, index) => {
              const isSelected = selectedValue === opt.value;
              const isHighlighted = highlightedIndex === index;
              const optionClass = cx(
                styles.option,
                isSelected && styles.isSelected,
                isHighlighted && styles.isHighlighted,
                opt.disabled && styles.optionDisabled,
              );
              return (
                <li
                  key={opt.value}
                  id={`${rootId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  className={optionClass}
                  onMouseEnter={() => {
                    if (!opt.disabled) setHighlightedIndex(index);
                  }}
                  onMouseDown={(e) => {
                    // 클릭 셀렉트 시 포커스 유지 위해 기본 포커스 전환 방지
                    e.preventDefault();
                  }}
                  onClick={() => {
                    if (opt.disabled) return;
                    commitChange(opt.value, index);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.optionLabel}>{opt.label}</span>
                  {isSelected ? <span className={styles.checkIcon} aria-hidden>✓</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {hasError ? (
        typeof error === 'string' ? <span className={styles.errorText}>{error}</span> : <span className={styles.errorText}>유효하지 않은 값입니다.</span>
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}
    </div>
  );
};

export default SelectBox;


