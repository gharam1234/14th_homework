import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Pagination, { PaginationProps, PaginationVariant, PaginationSize } from './index';

// 한국어 주석: 페이지네이션 컴포넌트 스토리 - variant/size/상태/아이콘/제어 모드 조합과 컨트롤 제공

const meta: Meta<typeof Pagination> = {
  title: 'Commons/Pagination',
  component: Pagination,
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
    // 한국어 주석: 전체 페이지 수
    totalPages: { control: { type: 'number' }, description: '총 페이지 수 (1 이상)' },
    // 한국어 주석: 제어 모드에서 현재 페이지
    currentPage: { control: { type: 'number' }, description: '제어 모드의 현재 페이지 (1 기반)' },
    // 한국어 주석: 비제어 모드 초기 페이지
    defaultPage: { control: { type: 'number' }, description: '비제어 모드 초기 페이지 (1 기반)' },
    // 한국어 주석: 비활성화 상태
    disabled: { control: { type: 'boolean' }, description: '전체 비활성화' },
    // 한국어 주석: 접근성 라벨
    ariaLabel: { control: { type: 'text' }, description: '내비게이션 aria-label' },
    // 한국어 주석: 아이콘 슬롯은 JSX이므로 컨트롤 비활성화
    prevIcon: { control: false },
    nextIcon: { control: false },
    className: { control: false },
    // 한국어 주석: onChange 액션 로깅
    onChange: { action: 'page-changed' },
  },
  args: {
    // 한국어 주석: 기본 args - 프라이머리/미디엄/총 7페이지/비제어 1페이지 시작
    variant: 'primary' as PaginationVariant,
    size: 'medium' as PaginationSize,
    totalPages: 7,
    defaultPage: 1,
    disabled: false,
  } as unknown as Partial<PaginationProps>,
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// 한국어 주석: 프라이머리 변형
export const Primary: Story = {
  name: 'Primary',
};

// 한국어 주석: 세컨더리 변형
export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary' as PaginationVariant,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 터셔리 변형
export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    variant: 'tertiary' as PaginationVariant,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 크기 - Small
export const Small: Story = {
  name: 'Size / Small',
  args: {
    size: 'small' as PaginationSize,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 크기 - Medium
export const Medium: Story = {
  name: 'Size / Medium',
  args: {
    size: 'medium' as PaginationSize,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 크기 - Large
export const Large: Story = {
  name: 'Size / Large',
  args: {
    size: 'large' as PaginationSize,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 비활성화 상태
export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 제어 모드 - 현재 페이지 외부 제어
export const Controlled: Story = {
  name: 'Controlled (with currentPage)',
  render: (args) => {
    const [page, setPage] = React.useState<number>(args.currentPage ?? 3);
    return (
      <Pagination
        {...args}
        currentPage={page}
        onChange={(p) => setPage(p)}
      />
    );
  },
  args: {
    currentPage: 3,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 아이콘 슬롯 제공 예시
export const WithCustomIcons: Story = {
  name: 'With Custom Icons',
  args: {
    prevIcon: <span aria-hidden>⬅️</span>,
    nextIcon: <span aria-hidden>➡️</span>,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 페이지 수가 적은 경우(3)
export const FewPages: Story = {
  name: 'Total Pages / 3',
  args: {
    totalPages: 3,
  } as unknown as Partial<PaginationProps>,
};

// 한국어 주석: 페이지 수가 많은 경우(12)
export const ManyPages: Story = {
  name: 'Total Pages / 12',
  args: {
    totalPages: 12,
  } as unknown as Partial<PaginationProps>,
};

