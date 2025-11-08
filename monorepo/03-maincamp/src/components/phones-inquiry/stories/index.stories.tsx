import type { Meta, StoryObj } from '@storybook/react'
import PhonesInquiry from '../index'

const meta: Meta<typeof PhonesInquiry> = {
  title: 'Components/PhonesInquiry',
  component: PhonesInquiry,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: '입력된 문의 텍스트',
    },
    onChangeText: {
      description: '텍스트 변경 시 호출되는 핸들러',
      action: 'changed',
    },
    onSubmit: {
      description: '문의 제출 시 호출되는 핸들러',
      action: 'clicked',
    },
    maxLength: {
      control: 'number',
      description: '최대 문자 수',
    },
    isLoading: {
      control: 'boolean',
      description: '로딩 상태',
    },
    disabled: {
      control: 'boolean',
      description: '버튼 비활성화 여부',
    },
    error: {
      control: 'text',
      description: '에러 메시지',
    },
    placeholder: {
      control: 'text',
      description: 'placeholder 텍스트',
    },
  },
}

export default meta
type Story = StoryObj<typeof PhonesInquiry>

/** 기본 상태 */
export const Default: Story = {
  args: {
    text: '',
    maxLength: 100,
    isLoading: false,
    disabled: false,
    placeholder: '문의사항을 입력해 주세요',
  },
}

/** 텍스트 입력된 상태 */
export const WithText: Story = {
  args: {
    ...Default.args,
    text: '상품이 정말 좋습니다. 다른 색상은 없을까요?',
  },
}

/** 최대 문자에 가까운 상태 */
export const NearMaxLength: Story = {
  args: {
    ...Default.args,
    text: '이 제품의 배터리 용량은 얼마나 되나요? 얼마나 오래 사용할 수 있을까요?',
    maxLength: 100,
  },
}

/** 로딩 상태 */
export const Loading: Story = {
  args: {
    ...Default.args,
    text: '문의사항입니다.',
    isLoading: true,
  },
}

/** 에러 상태 */
export const WithError: Story = {
  args: {
    ...Default.args,
    text: '문의사항입니다.',
    error: '문의 등록에 실패했습니다. 다시 시도해주세요.',
  },
}

/** 비활성화 상태 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
}

/** 커스텀 placeholder */
export const CustomPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: '상품에 대한 질문이나 의견을 자유롭게 입력해주세요.',
  },
}
