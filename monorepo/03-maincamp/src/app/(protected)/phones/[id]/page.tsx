'use client';

import PhoneDetail from '@/components/phone-detail';
import Inquiries from '@/components/inquiries';

export default function PhoneDetailTestPage() {
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
          onSubmitInquiry={(content) => {
            console.log('문의 제출:', content);
          }}
          onSubmitReply={(inquiryId, content) => {
            console.log('답변 제출:', inquiryId, content);
          }}
        />
      </section>
    </main>
  );
}
