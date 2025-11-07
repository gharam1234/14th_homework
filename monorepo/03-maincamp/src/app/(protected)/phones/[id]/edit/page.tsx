/**
 * 중고폰 수정 페이지
 *
 * @description 기존 중고폰 정보를 수정하는 페이지
 */

import PhoneNew from "@/components/phone-new";

interface PhoneEditPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "중고폰 수정하기",
  description: "중고폰 정보를 수정하세요",
};

export default function PhoneEditPage({ params }: PhoneEditPageProps) {
  const { id } = params;

  return (
    <main style={{ padding: "40px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
        <PhoneNew isEdit={true} phoneId={id} />
      </div>
    </main>
  );
}
