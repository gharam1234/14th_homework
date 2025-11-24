/**
 * 문의하기 컴포넌트 타입 정의
 */

/** 사용자 프로필 정보 */
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  role?: 'user' | 'seller';
}

/** 단일 문의/답변 */
export interface InquiryItem {
  id: string;
  author: UserProfile;
  content: string;
  createdAt: string;
  isReply?: boolean;
  parentId?: string; // 답변인 경우 부모 문의 ID
  canEdit?: boolean;
  canDelete?: boolean;
  updatedAt?: string; // 수정 시간
}

/** 문의 섹션 (입력 + 목록) */
export interface InquirySection {
  inputPlaceholder?: string;
  submitButtonText?: string;
  inputMaxLength?: number;
  items: InquiryItem[];
}

/** 문의하기 컴포넌트 Props */
export interface InqueriesProps {
  /** 문의 입력 섹션 정보 */
  inputSection?: {
    placeholder?: string;
    submitButtonText?: string;
    maxLength?: number;
  };
  /** 문의 목록 데이터 */
  inquiries?: InquiryItem[];
  /** 문의 제출 핸들러 */
  onSubmitInquiry?: (content: string) => Promise<boolean | void> | boolean | void;
  /** 답변 제출 핸들러 */
  onSubmitReply?: (inquiryId: string, content: string) => Promise<boolean | void> | boolean | void;
  /** 중첩 답변 제출 핸들러 */
  onSubmitNestedReply?: (parentId: string, content: string) => void | Promise<boolean>;
  /** 문의/답변 수정 핸들러 */
  onEditInquiry?: (id: string, content: string) => void;
  /** 문의/답변 삭제 핸들러 */
  onDeleteInquiry?: (id: string) => void;
  /** 답변 버튼 클릭 핸들러 */
  onReplyClick?: (inquiryId: string) => void;
  /** 수정 중인 답변 ID */
  editingReplyId?: string | null;
  /** 수정 입력값 */
  editingReplyContent?: string;
  /** 수정 로딩 상태 */
  isEditingLoading?: boolean;
  /** 수정 에러 메시지 */
  editingError?: string | null;
  /** 수정 입력값 변경 핸들러 */
  onEditingReplyContentChange?: (content: string) => void;
  /** 수정 저장 핸들러 */
  onSubmitEditReply?: (replyId: string) => void;
  /** 수정 취소 핸들러 */
  onCancelEditReply?: () => void;
}
