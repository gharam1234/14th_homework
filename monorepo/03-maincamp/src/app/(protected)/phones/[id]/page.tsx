'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PhoneDetail from '@/components/phone-detail';
import Inquiries from '@/components/inquiries';
import { useInquirySubmit } from '@/components/inquiries/hooks/index.submit.hook';

interface PhoneDetailPageProps {
  params: {
    id: string;
  };
}

export default function PhoneDetailTestPage({ params }: PhoneDetailPageProps) {
  const phoneId = params.id;
  const router = useRouter();
  const { submitInquiry } = useInquirySubmit({
    phoneId,
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleSubmitInquiry = useCallback(
    (content: string) => {
      return submitInquiry(content);
    },
    [submitInquiry]
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
          inquiries={[]}
          onSubmitInquiry={handleSubmitInquiry}
          onSubmitReply={(inquiryId, content) => {
            console.log('답변 제출:', inquiryId, content);
          }}
        />
      </section>
    </main>
  );
}
