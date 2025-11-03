import type { Meta, StoryObj } from "@storybook/react";
import Mypage from "../index";

/**
 * 토큰 지갑 컴포넌트 Storybook
 *
 * Figma 디자인을 기반으로 한 토큰 지갑 컴포넌트의 다양한 상태를 보여줍니다.
 */
const meta: Meta<typeof Mypage> = {
  title: "Components/TokenWallet",
  component: Mypage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "사용자 정보, 토큰 잔액, 거래 내역을 표시하는 토큰 지갑 컴포넌트입니다.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Mypage>;

/**
 * 기본 상태
 * 모든 기능이 정상 작동하는 기본 토큰 지갑입니다.
 */
export const Default: Story = {
  args: {
    userName: "김상훈",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 250,
    onSearch: (keyword) => {
      console.log("검색:", keyword);
    },
  },
};

/**
 * 토큰이 많은 경우
 * 토큰이 많이 보유되어 있는 경우를 테스트합니다.
 */
export const ManyTokens: Story = {
  args: {
    userName: "박영수",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 1000,
    onSearch: undefined,
  },
};

/**
 * 토큰이 없는 경우
 * 토큰이 0개인 경우를 테스트합니다.
 */
export const NoTokens: Story = {
  args: {
    userName: "이순신",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 0,
    onSearch: undefined,
  },
};

/**
 * 거래 내역이 많은 경우
 * 테이블에 많은 토큰 거래 내역이 있을 때의 모습입니다.
 */
export const ManyTransactions: Story = {
  args: {
    userName: "김상훈",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 250,
    transactions: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Claude Pro 토큰 ${i + 1}`,
      price: `${15000 + i * 1000}원`,
      date: "2024.12.16",
      status: i % 2 === 0 ? ("거래 완료" as const) : undefined,
    })),
  },
};

/**
 * 빈 거래 내역
 * 거래 내역이 없는 경우입니다.
 */
export const EmptyTransactions: Story = {
  args: {
    userName: "김상훈",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 250,
    transactions: [],
  },
};

/**
 * 태블릿 뷰
 * 태블릿 크기의 뷰포트에서의 표시입니다.
 */
export const TabletView: Story = {
  args: {
    userName: "김상훈",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 250,
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};

/**
 * 모바일 뷰
 * 모바일 크기의 뷰포트에서의 표시입니다.
 */
export const MobileView: Story = {
  args: {
    userName: "김상훈",
    userImage: "https://via.placeholder.com/40",
    tokenCount: 250,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
