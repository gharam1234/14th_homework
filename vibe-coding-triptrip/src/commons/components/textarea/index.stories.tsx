import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Textarea, { TextareaProps, TextareaVariant, TextareaSize } from './index';

// 한국어 주석: 텍스트 영역 컴포넌트 스토리 - variant/size/상태/카운터 조합과 컨트롤 제공

const meta: Meta<typeof Textarea> = {
  title: 'Commons/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    // 한국어 주석: variant 선택 - primary/secondary/tertiary
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary'],
      description: '텍스트 영역 시각 변형',
    },
    // 한국어 주석: size 선택 - small/medium/large
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '텍스트 영역 크기',
    },
    // 한국어 주석: 라벨/헬퍼/에러 컨트롤
    label: { control: { type: 'text' }, description: '외부 라벨 텍스트' },
    helperText: { control: { type: 'text' }, description: '보조 설명 텍스트' },
    // 한국어 주석: error는 문자열 메시지로 제어 (불리언 에러는 별도 스토리에서 예시)
    error: { control: { type: 'text' }, description: '에러 메시지 (불리언/문자열 지원)' },
    // 한국어 주석: 카운터 활성/최대 글자 수
    showCount: { control: { type: 'boolean' }, description: '글자 수 카운터 표시' },
    maxLength: { control: { type: 'number' }, description: '최대 글자 수 (카운터와 함께 사용)' },
    // 한국어 주석: 기본 텍스트 영역 속성 컨트롤
    placeholder: { control: { type: 'text' }, description: '플레이스홀더' },
    disabled: { control: { type: 'boolean' }, description: '비활성화' },
    required: { control: { type: 'boolean' }, description: '필수 입력 표시' },
    // 한국어 주석: 클래스 확장 지점은 컨트롤 비활성화
    className: { control: false },
    textareaClassName: { control: false },
    // 한국어 주석: onChange 액션 로깅
    onChange: { action: 'changed' },
  },
  args: {
    // 한국어 주석: 기본 args - 프라이머리/미디엄/라벨/헬퍼/플레이스홀더
    variant: 'primary' as TextareaVariant,
    size: 'medium' as TextareaSize,
    label: '라벨',
    helperText: '헬퍼 텍스트',
    placeholder: '내용을 입력하세요',
    showCount: false,
    disabled: false,
    required: false,
  } as unknown as Partial<TextareaProps>,
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// 한국어 주석: 프라이머리 변형
export const Primary: Story = {
  name: 'Primary',
};

// 한국어 주석: 세컨더리 변형
export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary' as TextareaVariant,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 터셔리 변형
export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    variant: 'tertiary' as TextareaVariant,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 크기 - Small
export const Small: Story = {
  name: 'Size / Small',
  args: {
    size: 'small' as TextareaSize,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 크기 - Medium
export const Medium: Story = {
  name: 'Size / Medium',
  args: {
    size: 'medium' as TextareaSize,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 크기 - Large
export const Large: Story = {
  name: 'Size / Large',
  args: {
    size: 'large' as TextareaSize,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 비활성화 상태
export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    placeholder: '입력 불가',
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 필수 입력 표시
export const Required: Story = {
  name: 'Required',
  args: {
    required: true,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 에러 - 불리언(true) 기본 메시지
export const ErrorBoolean: Story = {
  name: 'Error / Boolean',
  args: {
    // 한국어 주석: 컴포넌트는 boolean일 때 기본 에러 메시지를 렌더링
    error: true,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 에러 - 메시지 제공
export const ErrorMessage: Story = {
  name: 'Error / Message',
  args: {
    error: '유효하지 않은 값입니다.',
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 카운터(0/100) - 최대 글자 수와 함께 사용
export const WithCounter: Story = {
  name: 'With Counter (0/100)',
  args: {
    showCount: true,
    maxLength: 100,
    defaultValue: '',
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 긴 텍스트 예시
export const LongText: Story = {
  name: 'Long Text Example',
  args: {
    defaultValue: '이것은 긴 텍스트 예시입니다. 텍스트 영역의 스크롤과 리사이즈 기능을 확인할 수 있습니다. 여러 줄의 텍스트를 입력할 때 텍스트 영역이 어떻게 동작하는지 볼 수 있습니다.',
    rows: 5,
  } as unknown as Partial<TextareaProps>,
};

// 한국어 주석: 모든 기능 조합 예시
export const AllFeatures: Story = {
  name: 'All Features Combined',
  args: {
    variant: 'primary' as TextareaVariant,
    size: 'large' as TextareaSize,
    label: '상세 설명',
    helperText: '자세한 내용을 입력해주세요',
    placeholder: '여기에 내용을 입력하세요...',
    showCount: true,
    maxLength: 200,
    required: true,
    rows: 6,
  } as unknown as Partial<TextareaProps>,
};
