/**
 * 중고폰 판매 등록 페이지
 *
 * @description 당근마켓 스타일의 중고폰 거래 등록 페이지
 */

import PhoneNew from "@/components/phone-new";

export const metadata = {
  title: "중고폰 판매하기",
  description: "중고폰을 판매 등록하세요",
};

export default function PhoneNewPage() {
  return (
    <main style={{ padding: "40px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
        <PhoneNew isEdit={false} />
      </div>
    </main>
  );
}
