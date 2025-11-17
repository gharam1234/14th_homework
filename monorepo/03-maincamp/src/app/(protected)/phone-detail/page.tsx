/**
 * 테스트 전용 PhoneDetail 페이지
 * @description Playwright 테스트를 위한 PhoneDetail 컴포넌트 렌더링 페이지
 */
import PhoneDetail from '@/components/phone-detail';

export default function PhoneDetailTestPage() {
  return <PhoneDetail phoneId="listing-001" />;
}
