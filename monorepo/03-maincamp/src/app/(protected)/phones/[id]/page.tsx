'use client';

import { useParams } from 'next/navigation';
import { useFetchPhoneDetail } from '@/components/phone-detail/hooks/index.fetch.hook';
import PhoneDetail from '@/components/phone-detail';
import PhonesInquiry from '@/components/phones-inquiry';

/**
 * 중고폰 상세 페이지
 * Supabase에서 폰 정보를 조회하고 표시합니다.
 */
export default function PhoneDetailPage() {
  const params = useParams();
  const phoneId = params.id as string;

  // 폰 데이터 조회
  const { phone, isLoading, error } = useFetchPhoneDetail(phoneId);

  if (isLoading) {
    return (
      <main style={{ padding: '40px' }}>
        <div data-testid="loading-spinner" style={{ textAlign: 'center', padding: '40px' }}>
          <p>로딩 중...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: '40px' }}>
        <div data-testid="error-message" style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
          <p>오류 발생: {error}</p>
        </div>
      </main>
    );
  }

  if (!phone) {
    return (
      <main style={{ padding: '40px' }}>
        <div data-testid="no-data-message" style={{ textAlign: 'center', padding: '40px' }}>
          <p>폰 정보를 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px' }}>
      <PhoneDetail data={phone} />
      <PhonesInquiry />
    </main>
  );
}
