import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import SelectBox, { SelectBoxProps, SelectBoxVariant, SelectBoxSize, SelectOption } from './index';

// 한국어 주석: 셀렉트박스 컴포넌트 스토리 - variant/size/라벨/플레이스홀더/헬퍼/에러/제어 모드 조합과 컨트롤 제공

const meta: Meta<typeof SelectBox> = {
  title: 'Commons/SelectBox',
  component: SelectBox,
  tags: ['autodocs'],
  argTypes: {
    // 한국어 주석: variant 선택 - primary/secondary/tertiary
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary'],
      description: '컴포넌트 시각 변형',
    },
    // 한국어 주석: size 선택 - small/medium/large
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '컴포넌트 크기',
    },
    // 한국어 주석: 라벨/플레이스홀더/헬퍼/에러 컨트롤
    label: { control: { type: 'text' }, description: '외부 라벨 텍스트' },
    placeholder: { control: { type: 'text' }, description: '값이 없을 때 안내 텍스트' },
    helperText: { control: { type: 'text' }, description: '보조 설명 텍스트' },
    error: { control: { type: 'text' }, description: '에러 메시지 (불리언/문자열 지원)' },
    // 한국어 주석: 옵션 목록은 배열이므로 컨트롤은 JSON으로 노출
    options: { control: { type: 'object' }, description: '옵션 배열 (label/value/disabled)' },
    // 한국어 주석: 제어/비제어 값
    value: { control: { type: 'text' }, description: '제어 모드의 값' },
    defaultValue: { control: { type: 'text' }, description: '비제어 초기값' },
    // 한국어 주석: 비활성화
    disabled: { control: { type: 'boolean' }, description: '전체 비활성화' },
    // 한국어 주석: 클래스 확장 지점은 스토리 컨트롤에서 제외
    className: { control: false },
    triggerClassName: { control: false },
    panelClassName: { control: false },
    // 한국어 주석: onChange 액션 로깅 (value, option)
    onChange: { action: 'changed' },
  },
  args: {
    // 한국어 주석: 기본 args - 프라이머리/미디엄/라벨/헬퍼/플레이스홀더/옵션
    variant: 'primary' as SelectBoxVariant,
    size: 'medium' as SelectBoxSize,
    label: '라벨',
    helperText: '헬퍼 텍스트',
    placeholder: '선택하세요',
    options: [
      { label: '옵션 1', value: 'opt1' },
      { label: '옵션 2', value: 'opt2' },
      { label: '옵션 3 (비활성)', value: 'opt3', disabled: true },
      { label: '옵션 4', value: 'opt4' },
    ] as SelectOption[],
    disabled: false,
  } as unknown as Partial<SelectBoxProps>,
};

export default meta;
type Story = StoryObj<typeof SelectBox>;

// 한국어 주석: 프라이머리 변형
export const Primary: Story = {
  name: 'Primary',
};

// 한국어 주석: 세컨더리 변형
export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary' as SelectBoxVariant,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 터셔리 변형
export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    variant: 'tertiary' as SelectBoxVariant,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 크기 - Small
export const Small: Story = {
  name: 'Size / Small',
  args: {
    size: 'small' as SelectBoxSize,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 크기 - Medium
export const Medium: Story = {
  name: 'Size / Medium',
  args: {
    size: 'medium' as SelectBoxSize,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 크기 - Large
export const Large: Story = {
  name: 'Size / Large',
  args: {
    size: 'large' as SelectBoxSize,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 비활성화 상태
export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 에러 - 불리언(true) 기본 메시지 렌더링
export const ErrorBoolean: Story = {
  name: 'Error / Boolean',
  args: {
    error: true,
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 에러 - 메시지 제공
export const ErrorMessage: Story = {
  name: 'Error / Message',
  args: {
    error: '유효하지 않은 값입니다.',
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 라벨/헬퍼 텍스트 조합
export const WithHelperAndLabel: Story = {
  name: 'With Helper & Label',
  args: {
    label: '선택 라벨',
    helperText: '추가 설명 텍스트',
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 제어 모드 - 외부에서 value를 제어
export const Controlled: Story = {
  name: 'Controlled (with value)',
  render: (args) => {
    const [val, setVal] = React.useState<string>(args.value ?? 'opt2');
    return (
      <SelectBox
        {...args}
        value={val}
        onChange={(nextValue) => setVal(nextValue)}
      />
    );
  },
  args: {
    value: 'opt2',
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 비제어 모드 - defaultValue 제공
export const UncontrolledWithDefault: Story = {
  name: 'Uncontrolled (with defaultValue)',
  args: {
    defaultValue: 'opt1',
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 비활성 옵션 포함 예시
export const WithDisabledOption: Story = {
  name: 'With Disabled Option',
  args: {
    options: [
      { label: '활성 1', value: 'a1' },
      { label: '비활성', value: 'a2', disabled: true },
      { label: '활성 2', value: 'a3' },
    ] as SelectOption[],
  } as unknown as Partial<SelectBoxProps>,
};

// 한국어 주석: 긴 목록 스크롤 예시
export const LongListScroll: Story = {
  name: 'Long List (Scroll)',
  args: {
    options: Array.from({ length: 20 }, (_, i) => ({ label: `아이템 ${i + 1}` , value: `v${i + 1}` })) as SelectOption[],
    placeholder: '긴 목록에서 선택',
  } as unknown as Partial<SelectBoxProps>,
};


