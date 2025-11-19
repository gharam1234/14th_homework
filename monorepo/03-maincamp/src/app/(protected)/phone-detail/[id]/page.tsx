'use client';

import PhoneDetail from '@/components/phone-detail';

interface PhoneDetailDynamicPageProps {
  params: {
    id: string;
  };
}

export default function PhoneDetailDynamicPage({ params }: PhoneDetailDynamicPageProps) {
  return <PhoneDetail phoneId={params.id} />;
}

