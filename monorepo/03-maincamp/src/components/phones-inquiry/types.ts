/**
 * 상품 상세 페이지의 문의하기 폼 컴포넌트 Props 인터페이스
 */
export interface IPhonesInquiryProps {
  /** 입력된 문의 텍스트 */
  text?: string;

  /** 텍스트 변경 시 호출되는 핸들러 */
  onChangeText?: (text: string) => void;

  /** 문의 제출 시 호출되는 핸들러 */
  onSubmit?: () => void;

  /** 최대 문자 수 (기본값: 100) */
  maxLength?: number;

  /** 로딩 상태 */
  isLoading?: boolean;

  /** 에러 메시지 */
  error?: string;

  /** 버튼 비활성화 여부 */
  disabled?: boolean;

  /** placeholder 텍스트 (기본값: "문의사항을 입력해 주세요") */
  placeholder?: string;
}
