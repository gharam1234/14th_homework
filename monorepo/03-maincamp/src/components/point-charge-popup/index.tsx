"use client"

import React from 'react';
import styles from './styles.module.css';
import { Button } from '@/commons/components/button';
import type { IChargePopupProps } from './types';

/**
 * ChargePopup - Figma 디자인 기반 포인트 충전 팝업 컴포넌트
 *
 * @description Figma 디자인을 구현한 컴포넌트입니다.
 * 충전 금액 선택과 확인/취소 기능을 제공합니다.
 *
 * @param props - 컴포넌트 속성
 * @param props.options - 선택 가능한 충전 금액 옵션 목록
 * @param props.selectedValue - 선택된 충전 금액 (controlled component)
 * @param props.cancelText - 취소 버튼 텍스트 (기본값: "취소")
 * @param props.confirmText - 충전 버튼 텍스트 (기본값: "충전하기")
 * @param props.onChangeAmount - 금액 선택 변경 핸들러
 * @param props.onCancel - 취소 버튼 클릭 핸들러
 * @param props.onConfirm - 충전 버튼 클릭 핸들러
 * @param props.data-testid - 테스트 식별자
 */
export default function ChargePopup({
  options,
  selectedValue = '',
  cancelText = '취소',
  confirmText = '충전하기',
  onChangeAmount,
  onCancel,
  onConfirm,
  'data-testid': dataTestId = 'charge-popup',
}: IChargePopupProps) {
  return (
    <div
      className={styles.popup}
      data-testid={dataTestId}
      data-name="popup"
      data-node-id="285:32916"
    >
      {/* 콘텐츠 영역 */}
      <div className={styles.content}>
        {/* 아이콘 영역 */}
        <div className={styles.iconWrapper}>
          <img
            src="https://www.figma.com/api/mcp/asset/9da8c505-ea12-4c2a-930a-024df6c61bd3"
            alt="포인트 충전"
            className={styles.icon}
          />
        </div>

        {/* 제목 */}
        <p className={styles.title}>
          충전하실 금액을 선택해 주세요
        </p>

        {/* 드롭다운 영역 */}
        <div
          className={styles.dropdown}
          data-name="dropdown"
          data-node-id="I285:32916;108:20014"
        >
          <div className={styles.dropdownInner}>
            <select
              className={styles.select}
              value={selectedValue}
              onChange={(e) => onChangeAmount?.(e.target.value)}
              data-testid="charge-amount-select"
            >
              <option value="" disabled>
                내용입력
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* 화살표 아이콘 */}
            <img
              src="https://www.figma.com/api/mcp/asset/9d688e79-ec59-4e86-af16-3bc981b5a01e"
              alt=""
              className={styles.selectIcon}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div
        className={styles.buttonArea}
        data-name="버튼 영역"
        data-node-id="I285:32916;99:15193"
      >
        {/* 취소 버튼 */}
        <Button
          variant="secondary"
          theme="light"
          size="medium"
          className={styles.button}
          onClick={onCancel}
          data-testid="charge-cancel-button"
        >
          {cancelText}
        </Button>

        {/* 충전하기 버튼 */}
        <Button
          variant="primary"
          theme="light"
          size="medium"
          className={styles.button}
          onClick={onConfirm}
          data-testid="charge-confirm-button"
        >
          {confirmText}
        </Button>
      </div>
    </div>
  );
}
