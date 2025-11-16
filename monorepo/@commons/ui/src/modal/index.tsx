"use client";

import styles from "./styles.module.css";
import { MyButton } from "../button";

export interface IModalProps {
  variant?: "info" | "danger";
  actions?: "single" | "dual";
  title: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function Modal({
  variant = "info",
  actions = "dual",
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}: IModalProps) {
  const variantClass = variant === "danger" ? styles.danger : styles.info;
  const actionsClass = actions === "single" ? styles.single : styles.dual;

  return (
    <div className={`${styles.modal} ${variantClass}`} data-testid="modal-container" role="dialog">
      {/* 헤더 영역 */}
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && (
          <div className={styles.description}>{description}</div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className={`${styles.footer} ${actionsClass}`}>
        {actions === "dual" && (
          <div className={styles.buttonWrapper}>
            <MyButton
              variant="secondary"
              onClick={onCancel}
            >
              {cancelText}
            </MyButton>
          </div>
        )}
        <div className={styles.buttonWrapper}>
          <MyButton
            variant="primary"
            onClick={onConfirm}
          >
            {confirmText}
          </MyButton>
        </div>
      </div>
    </div>
  );
}
