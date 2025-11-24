/**
 * ChargePopup 컴포넌트 Props 타입 정의
 */

/** 충전 금액 옵션 인터페이스 */
export interface ChargeOption {
  /** 충전 금액 값 */
  value: string;
  /** 충전 금액 표시 라벨 */
  label: string;
}

/** ChargePopup 컴포넌트 Props */
export interface IChargePopupProps {
  /** 선택 가능한 충전 금액 옵션 목록 */
  options: ChargeOption[];
  /** 선택된 충전 금액 (controlled component) */
  selectedValue?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 충전 버튼 텍스트 */
  confirmText?: string;
  /** 금액 선택 변경 핸들러 */
  onChangeAmount?: (value: string) => void;
  /** 취소 버튼 클릭 핸들러 */
  onCancel?: () => void;
  /** 충전 버튼 클릭 핸들러 */
  onConfirm?: () => void;
  /** 테스트 식별자 */
  'data-testid'?: string;
}
