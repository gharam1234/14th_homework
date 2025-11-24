import type { Meta, StoryObj } from '@storybook/react'
import ChargePopup from '../index'

const meta: Meta<typeof ChargePopup> = {
  title: 'Components/ChargePopup',
  component: ChargePopup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Figma 디자인을 기반으로 한 포인트 충전 팝업 컴포넌트입니다. UI만 렌더링하며, 기능은 부모 컴포넌트에서 구현합니다.',
      },
    },
  },
  argTypes: {
    options: {
      description: '선택 가능한 충전 금액 옵션 목록',
      control: 'object',
    },
    selectedValue: {
      description: '선택된 충전 금액 (controlled component)',
      control: 'text',
    },
    cancelText: {
      description: '취소 버튼 텍스트',
      control: 'text',
    },
    confirmText: {
      description: '충전 버튼 텍스트',
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChargePopup>

/** 기본 상태 */
export const Default: Story = {
  args: {
    options: [
      { value: '10000', label: '10,000원' },
      { value: '30000', label: '30,000원' },
      { value: '50000', label: '50,000원' },
      { value: '100000', label: '100,000원' },
    ],
    selectedValue: '',
    cancelText: '취소',
    confirmText: '충전하기',
  },
}

/** 금액 선택됨 */
export const WithSelectedValue: Story = {
  args: {
    options: [
      { value: '10000', label: '10,000원' },
      { value: '30000', label: '30,000원' },
      { value: '50000', label: '50,000원' },
      { value: '100000', label: '100,000원' },
    ],
    selectedValue: '30000',
    cancelText: '취소',
    confirmText: '충전하기',
  },
}

/** 커스텀 버튼 텍스트 */
export const CustomButtonText: Story = {
  args: {
    options: [
      { value: '10000', label: '10,000원' },
      { value: '30000', label: '30,000원' },
      { value: '50000', label: '50,000원' },
      { value: '100000', label: '100,000원' },
    ],
    selectedValue: '',
    cancelText: '닫기',
    confirmText: '결제하기',
  },
}
