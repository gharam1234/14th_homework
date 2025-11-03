import React from 'react';
import styles from './styles.module.css';

// 버튼 변형과 상태를 정의하는 타입
export type ButtonVariant = 'primary' | 'secondary';
export type ButtonActiveState = 'active' | 'inactive';

// 컴포넌트 외부에서 사용할 수 있도록 명시적인 Props 타입을 제공
export type ButtonProps = {
  variant?: ButtonVariant; // 기본: 'primary'
  active?: ButtonActiveState; // 기본: 'active'
  children: React.ReactNode; // 라벨 텍스트 또는 커스텀 노드
  leftIcon?: React.ReactNode; // 왼쪽 아이콘 슬롯
  rightIcon?: React.ReactNode; // 오른쪽 아이콘 슬롯
  className?: string; // 외부 클래스 확장 지점
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// Figma 토큰을 반영한 버튼 컴포넌트
// - variant: 'primary' | 'secondary'
// - active: 'active' | 'inactive'
// - 높이/패딩/타이포/둥근 모서리 등은 styles.module.css에서 관리
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  active = 'active',
  children,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  // 비활성 상태일 때 접근성/상호작용을 위해 disabled를 강제 적용
  const isInactive = active === 'inactive';
  const computedDisabled = disabled ?? isInactive;

  const rootClassName = cx(
    styles.root,
    variant === 'primary' && styles.variantPrimary,
    variant === 'secondary' && styles.variantSecondary,
    active === 'active' && styles.stateActive,
    active === 'inactive' && styles.stateInactive,
    className,
  );

  return (
    <button
      type={props.type ?? 'button'}
      className={rootClassName}
      aria-pressed={active === 'active'}
      aria-disabled={computedDisabled || undefined}
      disabled={computedDisabled}
      {...props}
    >
      {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
      <span className={styles.label}>{children}</span>
      {rightIcon ? <span className={styles.rightIcon}>{rightIcon}</span> : null}
    </button>
  );
};

export default Button;


