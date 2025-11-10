/**
 * 문의 컴포넌트 타입 정의
 */

/**
 * 문의 항목
 */
export interface InquiryItem {
  id: string;
  profileName: string;
  profileImage?: string;
  content: string;
  createdAt: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 문의하기 컴포넌트 Props
 */
export interface PhonesInquiryProps {
  inquiries?: InquiryItem[];
  onSubmit?: (content: string) => void;
  placeholderText?: string;
  maxLength?: number;
}
