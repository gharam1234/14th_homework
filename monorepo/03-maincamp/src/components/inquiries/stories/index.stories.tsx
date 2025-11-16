import type { Meta, StoryObj } from '@storybook/react';
import Inquiries from '../index';
import { InquiryItem } from '../types';

const meta: Meta<typeof Inquiries> = {
  title: 'Components/Inquiries',
  component: Inquiries,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Inquiries>;

/**
 * 더미 데이터: 샘플 문의
 */
const DUMMY_INQUIRIES: InquiryItem[] = [
  {
    id: 'inquiry-1',
    author: {
      id: 'user-1',
      name: '궁금증',
    },
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
  },
  {
    id: 'reply-1',
    author: {
      id: 'user-2',
      name: '판매자',
    },
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
    isReply: true,
    parentId: 'inquiry-1',
    canEdit: true,
    canDelete: true,
  },
  {
    id: 'inquiry-2',
    author: {
      id: 'user-3',
      name: '자유로운 실버',
    },
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
  },
  {
    id: 'reply-2',
    author: {
      id: 'user-2',
      name: '판매자',
    },
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
    isReply: true,
    parentId: 'inquiry-2',
    canEdit: true,
    canDelete: true,
  },
  {
    id: 'inquiry-3',
    author: {
      id: 'user-4',
      name: '둘리',
    },
    content: '살겠노라 살겠노라. 청산에 살겠노라.\n머루랑 다래를 먹고 청산에 살겠노라.\n얄리얄리 얄랑셩 얄라리 얄라',
    createdAt: '2024.11.11',
  },
];

/**
 * 기본 상태 - 문의 목록과 입력창 표시
 */
export const Default: Story = {
  args: {
    inputSection: {
      placeholder: '문의사항을 입력해 주세요.',
      submitButtonText: '문의 하기',
      maxLength: 100,
    },
    inquiries: DUMMY_INQUIRIES,
    onSubmitInquiry: (content: string) => {
      console.log('문의 제출:', content);
    },
    onSubmitReply: (inquiryId: string, content: string) => {
      console.log('답변 제출:', inquiryId, content);
    },
    onReplyClick: (inquiryId: string) => {
      console.log('답변 버튼 클릭:', inquiryId);
    },
    onEditInquiry: (id: string, content: string) => {
      console.log('수정:', id, content);
    },
    onDeleteInquiry: (id: string) => {
      console.log('삭제:', id);
    },
  },
};

/**
 * 빈 상태 - 문의가 없는 경우
 */
export const Empty: Story = {
  args: {
    inputSection: {
      placeholder: '문의사항을 입력해 주세요.',
      submitButtonText: '문의 하기',
      maxLength: 100,
    },
    inquiries: [],
  },
};

/**
 * 문의만 있고 답변이 없는 상태
 */
export const OnlyQuestions: Story = {
  args: {
    inputSection: {
      placeholder: '문의사항을 입력해 주세요.',
      submitButtonText: '문의 하기',
      maxLength: 100,
    },
    inquiries: [DUMMY_INQUIRIES[0], DUMMY_INQUIRIES[2]],
  },
};

/**
 * 문의와 답변이 함께 있는 상태
 */
export const WithReplies: Story = {
  args: {
    inputSection: {
      placeholder: '문의사항을 입력해 주세요.',
      submitButtonText: '문의 하기',
      maxLength: 100,
    },
    inquiries: DUMMY_INQUIRIES,
    onSubmitReply: (inquiryId: string, content: string) => {
      console.log('답변 제출:', inquiryId, content);
    },
  },
};
