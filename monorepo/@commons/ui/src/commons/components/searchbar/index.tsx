"use client";

import React, { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.css";

export type SearchbarVariant = "primary" | "secondary" | "tertiary";
export type SearchbarSize = "small" | "medium" | "large";

export interface SearchbarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  variant?: SearchbarVariant;
  size?: SearchbarSize;
  className?: string;
}

/**
 * MySearchbar
 * - variant: 'primary' | 'secondary' | 'tertiary'
 * - size: 'small' | 'medium' | 'large'
 */
export function MySearchbar({
  value,
  onChange,
  onSearch,
  onClear,
  variant = "primary",
  size = "medium",
  placeholder = "검색어를 입력하세요",
  disabled,
  className,
  ...rest
}: SearchbarProps) {
  const [internal, setInternal] = useState(value ?? "");

  // 외부 value가 존재하면 제어 컴포넌트로 동작
  const text = value !== undefined ? value : internal;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (onChange) onChange(next);
      if (value === undefined) setInternal(next);
    },
    [onChange, value]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent | React.MouseEvent) => {
      if (e) e.preventDefault();
      if (onSearch) onSearch(text);
    },
    [onSearch, text]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleClear = useCallback(() => {
    if (onChange && value !== undefined) onChange("");
    if (value === undefined) setInternal("");
    if (onClear) onClear();
  }, [onChange, onClear, value]);

  const rootClass = useMemo(() => {
    const classes = [styles.container, styles[variant], styles[size]];
    if (className) classes.push(className);
    if (disabled) classes.push(styles.disabled);
    return classes.join(" ");
  }, [variant, size, className, disabled]);

  return (
    <form className={rootClass} onSubmit={handleSubmit} role="search">
      <button
        type="submit"
        className={styles.iconButton}
        aria-label="검색"
        disabled={disabled}
      >
        <SearchIcon />
      </button>

      <input
        className={styles.input}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />

      {text && !disabled ? (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="지우기"
        >
          <ClearIcon />
        </button>
      ) : null}
    </form>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
    >
      <path
        d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0-2C6.582 2 3 5.582 3 10s3.582 8 8 8c1.85 0 3.549-.63 4.9-1.688l4.394 4.394a1 1 0 0 0 1.414-1.414l-4.394-4.394A7.963 7.963 0 0 0 19 10c0-4.418-3.582-8-8-8z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClearIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
    >
      <path
        d="M6.225 4.811a1 1 0 0 0-1.414 1.414L9.586 11l-4.775 4.775a1 1 0 1 0 1.414 1.414L11 12.414l4.775 4.775a1 1 0 0 0 1.414-1.414L12.414 11l4.775-4.775a1 1 0 1 0-1.414-1.414L11 9.586 6.225 4.811z"
        fill="currentColor"
      />
    </svg>
  );
}

export default MySearchbar;
