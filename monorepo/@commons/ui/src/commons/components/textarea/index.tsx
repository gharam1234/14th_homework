"use client";

import React, { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.css";

export type TextareaVariant = "primary" | "secondary" | "tertiary";
export type TextareaSize = "small" | "medium" | "large";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  variant?: TextareaVariant;
  size?: TextareaSize;
  className?: string;
}

/**
 * MyTextarea
 * - variant: 'primary' | 'secondary' | 'tertiary'
 * - size: 'small' | 'medium' | 'large'
 */
export function MyTextarea({
  value,
  onChange,
  variant = "primary",
  size = "medium",
  placeholder = "텍스트를 입력하세요",
  disabled,
  className,
  ...rest
}: TextareaProps) {
  const [internal, setInternal] = useState(value ?? "");

  // 외부 value가 존재하면 제어 컴포넌트로 동작
  const text = value !== undefined ? value : internal;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (onChange) onChange(next);
      if (value === undefined) setInternal(next);
    },
    [onChange, value]
  );

  const rootClass = useMemo(() => {
    const classes = [styles.container, styles[variant], styles[size]];
    if (className) classes.push(className);
    if (disabled) classes.push(styles.disabled);
    return classes.join(" ");
  }, [variant, size, className, disabled]);

  return (
    <textarea
      className={rootClass}
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  );
}

export default MyTextarea;
