/**
 * 토큰 수정 페이지
 *
 * @description 기존 토큰 정보를 수정하는 페이지
 */

import TokenNew from "@/components/token-new";

interface TokenEditPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "토큰 수정하기",
  description: "AI 토큰 정보를 수정하세요",
};

export default function TokenEditPage({ params }: TokenEditPageProps) {
  const { id } = params;

  return (
    <main style={{ padding: "40px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
        <TokenNew isEdit={true} tokenId={id} />
      </div>
    </main>
  );
}
