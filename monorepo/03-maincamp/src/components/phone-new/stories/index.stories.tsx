import type { Meta, StoryObj } from "@storybook/react";
import PhoneNew from "../index";

/**
 * 중고폰 판매 등록 폼 - Storybook 스토리
 *
 * 당근마켓 스타일의 스마트폰 거래 등록 폼입니다.
 * Figma 디자인을 기반으로 구현되었습니다.
 */
const meta: Meta<typeof PhoneNew> = {
  title: "Components/UsedPhoneNew",
  component: PhoneNew,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "중고폰 판매 등록 폼 컴포넌트입니다. UI만 구현되어 있으며, 기능은 차후에 추가됩니다.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PhoneNew>;

/**
 * 기본 상태
 *
 * 중고폰 판매 등록 폼의 초기 상태입니다.
 * - 모든 입력 필드는 비어있음
 * - 등록하기 버튼은 비활성화 상태
 * - 주소 관련 필드들은 비활성화 상태
 */
export const Default: Story = {
  args: {},
};

/**
 * 데스크톱 뷰
 */
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
};

/**
 * 태블릿 뷰
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "ipad",
    },
  },
};

/**
 * 모바일 뷰
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
