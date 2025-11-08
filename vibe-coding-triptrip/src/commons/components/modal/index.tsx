import React from 'react';
import styles from './styles.module.css';
import { Button } from '../button';

export type ModalVariant = 'info' | 'danger';
export type ModalActions = 'single' | 'dual';

export type ModalProps = {
  variant?: ModalVariant; // 기본: 'info'
  actions?: ModalActions; // 기본: 'single'
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryText?: string;
  secondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  className?: string;
  open?: boolean; // 모달 프로바이더와 함께 사용 시 외부에서 제어. 기본 true.
};

function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

export const Modal: React.FC<ModalProps> = ({
  variant = 'info',
  actions = 'single',
  title,
  description,
  primaryText = '확인',
  secondaryText = '취소',
  onPrimary,
  onSecondary,
  className,
  open = true,
}) => {
  if (!open) return null;

  return (
    <section
      role="dialog"
      aria-modal="true"
      className={cx(styles.root, styles[variant], className)}
    >
      <header className={styles.header}>
        <div className={styles.leadIcon} aria-hidden />
        {title ? <h2 className={styles.title}>{title}</h2> : null}
      </header>

      {description ? (
        <p className={styles.description}>{description}</p>
      ) : null}

      <div
        className={cx(
          styles.actions,
          actions === 'dual' ? styles.dual : styles.single,
        )}
      >
        {actions === 'dual' ? (
          <>
            <Button
              variant="secondary"
              className={styles.buttonFullWidth}
              onClick={onSecondary}
            >
              {secondaryText}
            </Button>
            <Button
              variant="primary"
              className={styles.buttonFullWidth}
              onClick={onPrimary}
            >
              {primaryText}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            className={styles.buttonFullWidth}
            onClick={onPrimary}
          >
            {primaryText}
          </Button>
        )}
      </div>
    </section>
  );
};

export default Modal;

