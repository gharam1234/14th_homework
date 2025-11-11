import type { Meta, StoryObj } from '@storybook/react';
import PhonesInquiry from '../index';
import { InquiryItem } from '../types';

const meta: Meta<typeof PhonesInquiry> = {
  title: 'Components/PhonesInquiry',
  component: PhonesInquiry,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhonesInquiry>;

/**
 * 더미 문의 데이터
 */
const mockInquiries: InquiryItem[] = [
  {
    id: 'inquiry-001',
    profileName: '홍길동',
    profileImage: undefined,
    content:
      '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
    canEdit: true,
    canDelete: true,
  },
  {
    id: 'inquiry-002',
    profileName: '마에스트로',
    profileImage: undefined,
    content:
      '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
    canEdit: false,
    canDelete: false,
  },
];

/**
 * 기본 상태 - 문의 목록 있음
 */
export const Default: Story = {
  args: {
    inquiries: mockInquiries,
    placeholderText: '문의사항을 입력해 주세요.',
    maxLength: 100,
  },
};

/**
 * 빈 상태 - 문의가 없음
 */
export const Empty: Story = {
  args: {
    inquiries: [],
    placeholderText: '문의사항을 입력해 주세요.',
    maxLength: 100,
  },
};

/**
 * 단일 문의 - 수정/삭제 버튼이 있는 경우
 */
export const SingleInquiry: Story = {
  args: {
    inquiries: [mockInquiries[0]],
    placeholderText: '문의사항을 입력해 주세요.',
    maxLength: 100,
  },
};

/**
 * 단일 문의 - 수정/삭제 버튼이 없는 경우
 */
export const SingleInquiryReadOnly: Story = {
  args: {
    inquiries: [mockInquiries[1]],
    placeholderText: '문의사항을 입력해 주세요.',
    maxLength: 100,
  },
};

/**
 * 커스텀 플레이스홀더 텍스트
 */
export const CustomPlaceholder: Story = {
  args: {
    inquiries: mockInquiries,
    placeholderText: '이 상품에 대해 궁금한 점을 물어보세요.',
    maxLength: 100,
  },
};

/**
 * 더 긴 최대 길이
 */
export const LongerMaxLength: Story = {
  args: {
    inquiries: mockInquiries,
    placeholderText: '문의사항을 입력해 주세요.',
    maxLength: 500,
  },
};
