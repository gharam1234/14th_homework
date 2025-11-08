'use client';

import { useEffect, useState } from 'react';
import PhoneDetail from '@/components/phone-detail';

export default function PhoneDetailTestPage() {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // localStorage에서 사용자 이메일 가져오기
    // (로그인 시 저장된 이메일을 사용)
    const storedEmail = localStorage.getItem('userEmail') || '';
    setUserEmail(storedEmail);
  }, []);

  return (
    <main style={{ padding: '40px' }}>
      <PhoneDetail userEmail={userEmail} />
    </main>
  );
}
