import type { Meta, StoryObj } from "@storybook/react";
import PhonesList from "../index";

/**
 * Figma 디자인 기반 중고폰 마켓플레이스 페이지 컴포넌트
 *
 * 중고 스마트폰 거래 마켓플레이스의 메인 화면으로,
 * 검색 필터, 브랜드 분류, 거래 카드 그리드를 포함합니다.
 */
const meta: Meta<typeof PhonesList> = {
  title: "Components/UsedPhoneList",
  component: PhonesList,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Figma 디자인을 기반으로 한 중고폰 마켓플레이스 컴포넌트입니다. 가격 범위 선택, 기기 검색, 브랜드 필터 기능을 제공합니다.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PhonesList>;

/**
 * 기본 상태
 * 모든 필터와 검색 기능이 활성화된 기본 상태입니다.
 */
export const Default: Story = {
  args: {
    onSearch: (params) => {
      console.log("중고폰 검색 파라미터:", params);
    },
  },
};

/**
 * 초기 로딩 상태
 * 컴포넌트가 처음 렌더링되었을 때의 상태입니다.
 */
export const InitialLoad: Story = {
  args: {
    onSearch: undefined,
  },
};

/**
 * 중고폰 검색 결과
 * 사용자가 기기를 검색한 후의 상태입니다.
 */
export const PhoneSearchResults: Story = {
  args: {
    onSearch: (params) => {
      console.log("중고폰 필터 적용됨:", params);
    },
  },
};

/**
 * 반응형 레이아웃 (태블릿)
 * 태블릿 크기의 뷰포트에서의 표시입니다.
 */
export const TabletView: Story = {
  args: {
    onSearch: undefined,
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};

/**
 * 반응형 레이아웃 (모바일)
 * 모바일 크기의 뷰포트에서의 표시입니다.
 */
export const MobileView: Story = {
  args: {
    onSearch: undefined,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
