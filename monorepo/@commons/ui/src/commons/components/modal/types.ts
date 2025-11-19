/**
 * Modal 컴포넌트 Props 타입 정의
 */

/** Modal 타입 */
export type ModalType = 'info' | 'danger' | 'warning';

/** Modal 액션 버튼 개수 */
export type ModalActions = 'single' | 'dual';

/**
 * Modal 컴포넌트 Props 인터페이스
 */
export interface IModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;

  /** 모달 타입 ('info': 정보, 'danger': 위험, 'warning': 경고) */
  type: ModalType;

  /** 액션 버튼 개수 ('single': 1개, 'dual': 2개) */
  actions: ModalActions;

  /** 모달 제목 */
  title: string;

  /** 모달 설명 메시지 */
  description: string;

  /** Primary 버튼 텍스트 */
  primaryButtonText: string;

  /** Secondary 버튼 텍스트 (actions가 'dual'일 때 필수) */
  secondaryButtonText?: string;

  /** Primary 버튼 클릭 핸들러 */
  onPrimaryClick?: () => void;

  /** Secondary 버튼 클릭 핸들러 */
  onSecondaryClick?: () => void;

  /** 배경 클릭 시 모달 닫기 여부 */
  onBackdropClick?: () => void;
}
