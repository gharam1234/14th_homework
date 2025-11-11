'use client';

import React, { useState } from 'react';
import styles from './styles.module.css';

/**
 * Selectbox 컴포넌트 Props 인터페이스
 */
export interface ISelectboxProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  placeholder?: string;
  disabled?: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

/**
 * Selectbox 컴포넌트
 *
 * @description Figma 디자인 기반 셀렉트박스 컴포넌트입니다.
 * variant와 size 조합으로 다양한 변형을 지원합니다.
 *
 * @param props - Selectbox 컴포넌트 Props
 * @returns Selectbox 컴포넌트
 */
export function Selectbox({
  variant = 'primary',
  size = 'medium',
  placeholder = '선택하세요',
  disabled = false,
  options,
  onChange,
  defaultValue,
}: ISelectboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onChange?.(value);
  };

  const classNameVariant = `${variant}-${size}`;
  const containerClassName = `${styles.container} ${styles[classNameVariant]} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`;

  return (
    <div className={containerClassName} data-testid="selectbox-container">
      <button
        className={styles.trigger}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        data-testid="selectbox-trigger"
      >
        <span className={styles.selectedText}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={styles.arrow} data-testid="selectbox-arrow">
          ▼
        </span>
      </button>

      {isOpen && !disabled && (
        <div className={styles.dropdown} data-testid="selectbox-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.option} ${
                selectedValue === option.value ? styles.selected : ''
              }`}
              onClick={() => handleSelect(option.value)}
              data-testid={`selectbox-option-${option.value}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Selectbox;
