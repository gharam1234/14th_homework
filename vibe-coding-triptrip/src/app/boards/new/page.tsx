"use client";

import React from "react";
import BoardsWriteWireframe from "@/components/boards-write";

// 새 글 작성 페이지에 보드 작성 와이어프레임 연결
export default function BoardsNewPage(): JSX.Element {
  return (
    <main style={{ display: "flex", justifyContent: "center", padding: 0 }}>
      {/* 가운데 정렬로 1280px 고정 와이어프레임 표시 */}
      <BoardsWriteWireframe />
    </main>
  );
}


