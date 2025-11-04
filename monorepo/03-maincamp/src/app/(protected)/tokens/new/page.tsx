/**
 * 토큰 판매 등록 페이지
 *
 * @description 당근마켓 스타일의 AI 토큰(Cursor, Claude Code 등) 거래 등록 페이지
 */

import TokenNew from "@/components/token-new";

export const metadata = {
  title: "토큰 판매하기",
  description: "AI 토큰을 판매 등록하세요",
};

export default function TokenNewPage() {
  return (
    <main style={{ padding: "40px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
        <TokenNew isEdit={false} />
      </div>
    </main>
  );
}
