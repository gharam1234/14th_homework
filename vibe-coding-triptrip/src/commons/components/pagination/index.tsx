import React from 'react';
import styles from './styles.module.css';

// 피그마 사양 기반 페이지네이션 컴포넌트
// - variant: 'primary' | 'secondary' | 'tertiary'
// - size: 'small' | 'medium' | 'large'
// - 좌/우 이동 아이콘과 페이지 버튼들로 구성

export type PaginationVariant = 'primary' | 'secondary' | 'tertiary';
export type PaginationSize = 'small' | 'medium' | 'large';

export type PaginationProps = {
  variant?: PaginationVariant; // 기본: 'primary'
  size?: PaginationSize; // 기본: 'medium'
  totalPages: number; // 총 페이지 수 (1 이상)
  currentPage?: number; // 현재 페이지 (1 기반)
  defaultPage?: number; // 비제어 모드 초기 페이지
  onChange?: (page: number) => void; // 페이지 변경 콜백
  className?: string; // 외부 컨테이너 확장
  prevIcon?: React.ReactNode; // 이전 아이콘 슬롯
  nextIcon?: React.ReactNode; // 다음 아이콘 슬롯
  disabled?: boolean; // 전체 비활성화
  ariaLabel?: string; // 네비게이션 라벨
};

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 접근성용 기본 아이콘 (필요 시 교체 가능)
const DefaultChevronLeft: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M14.7 6.3a1 1 0 0 1 0 1.4L10.4 12l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0z" fill="currentColor"/>
  </svg>
);
const DefaultChevronRight: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9.3 17.7a1 1 0 0 1 0-1.4L13.6 12 9.3 7.7a1 1 0 1 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0z" fill="currentColor"/>
  </svg>
);

export const Pagination: React.FC<PaginationProps> = ({
  variant = 'primary',
  size = 'medium',
  totalPages,
  currentPage,
  defaultPage = 1,
  onChange,
  className,
  prevIcon,
  nextIcon,
  disabled,
  ariaLabel = '페이지네이션 내비게이션',
}) => {
  // 제어/비제어 모드 지원
  const isControlled = typeof currentPage === 'number';
  const [internalPage, setInternalPage] = React.useState<number>(defaultPage);
  const page = isControlled ? (currentPage as number) : internalPage;

  // 경계값 보정: totalPages 최소 1, page 범위 [1, totalPages]
  const safeTotal = Math.max(1, Math.floor(totalPages || 1));
  const clampedPage = Math.min(Math.max(page, 1), safeTotal);
  React.useEffect(() => {
    if (!isControlled && page !== clampedPage) setInternalPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTotal]);

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

  function handleChange(nextPage: number) {
    if (disabled) return;
    const next = Math.min(Math.max(nextPage, 1), safeTotal);
    if (!isControlled) setInternalPage(next);
    if (next !== page) onChange?.(next);
  }

  // 단순 숫자 나열 (1~safeTotal). 필요 시 ellipsis 로직 확장 가능
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);

  return (
    <nav className={rootClassName} aria-label={ariaLabel} role="navigation">
      <button
        type="button"
        className={cx(styles.iconButton, styles.prevButton)}
        aria-label="이전 페이지"
        onClick={() => handleChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        {prevIcon ?? <DefaultChevronLeft />}
      </button>
      <div className={styles.items} role="list">
        {pages.map((p) => {
          const isActive = p === clampedPage;
          const itemClass = cx(styles.item, isActive && styles.itemActive);
          return (
            <button
              key={p}
              type="button"
              role="listitem"
              className={itemClass}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${p} 페이지`}
              onClick={() => handleChange(p)}
              disabled={disabled}
            >
              {p}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={cx(styles.iconButton, styles.nextButton)}
        aria-label="다음 페이지"
        onClick={() => handleChange(page + 1)}
        disabled={disabled || page >= safeTotal}
      >
        {nextIcon ?? <DefaultChevronRight />}
      </button>
    </nav>
  );
};

export default Pagination;


