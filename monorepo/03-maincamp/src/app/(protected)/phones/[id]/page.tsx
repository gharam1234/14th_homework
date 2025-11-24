'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PhoneDetail from '@/components/phone-detail';
import Inquiries from '@/components/inquiries';
import { useInquirySubmit } from '@/components/inquiries/hooks/index.submit.hook';
import { useInquiryDataBinding } from '@/components/inquiries/hooks/index.data-binding.hook';
import { useReplyEdit } from '@/components/inquiries/hooks/index.edit.hook';
import { useReplySubmit } from '@/components/inquiries/hooks/index.reply-submit.hook';

interface PhoneDetailPageProps {
  params: {
    id: string;
  };
}

export default function PhoneDetailTestPage({ params }: PhoneDetailPageProps) {
  const phoneId = params.id;
  const router = useRouter();
  
  // 문의 데이터 조회
  const { inquiries, refetch } = useInquiryDataBinding({
    phoneId,
  });
  
  // 문의 제출
  const { submitInquiry } = useInquirySubmit({
    phoneId,
    onSuccess: () => {
      refetch(); // 제출 성공 시 데이터 새로고침
      router.refresh();
    },
  });

  // 답변 수정
  const { isEditingId, editContent, isLoading, error, startEdit, cancelEdit, updateContent, submitEdit } = useReplyEdit({
    onSuccess: (replyId, updatedContent) => {
      // 수정 성공 시 로컬 상태 업데이트
      refetch(); // 데이터 새로고침
      router.refresh();
    },
  });

  const { submitReply } = useReplySubmit({
    phoneId,
    onSuccess: () => {
      refetch();
      router.refresh();
    },
  });

  const handleSubmitInquiry = useCallback(
    (content: string) => {
      return submitInquiry(content);
    },
    [submitInquiry]
  );

  const handleEditInquiry = useCallback(
    (id: string, content: string) => {
      startEdit(id, content);
    },
    [startEdit]
  );

  const handleEditingReplyContentChange = useCallback(
    (content: string) => {
      updateContent(content);
    },
    [updateContent]
  );

  const handleSubmitEditReply = useCallback(
    async (replyId: string) => {
      await submitEdit(replyId);
    },
    [submitEdit]
  );

  const handleCancelEditReply = useCallback(
    () => {
      cancelEdit();
    },
    [cancelEdit]
  );

  const handleSubmitReply = useCallback(
    (inquiryId: string, content: string) => {
      return submitReply(inquiryId, content);
    },
    [submitReply]
  );

  const handleSubmitNestedReply = useCallback(
    (parentId: string, content: string) => {
      return submitReply(parentId, content);
    },
    [submitReply]
  );

  return (
    <main style={{ padding: '40px' }}>
      <PhoneDetail />

      {/* 문의하기 섹션 */}
      <section style={{ marginTop: '60px' }}>
        <Inquiries
          inputSection={{
            placeholder: '문의사항을 입력해 주세요.',
            submitButtonText: '문의 하기',
            maxLength: 100,
          }}
          inquiries={inquiries}
          onSubmitInquiry={handleSubmitInquiry}
          onSubmitReply={handleSubmitReply}
          onSubmitNestedReply={handleSubmitNestedReply}
          onEditInquiry={handleEditInquiry}
          editingReplyId={isEditingId}
          editingReplyContent={editContent}
          isEditingLoading={isLoading}
          editingError={error}
          onEditingReplyContentChange={handleEditingReplyContentChange}
          onSubmitEditReply={handleSubmitEditReply}
          onCancelEditReply={handleCancelEditReply}
        />
      </section>
    </main>
  );
}
