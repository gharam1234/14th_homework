import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import SearchBar, { SearchBarProps } from './index';

// 한국어 주석: 검색바 컴포넌트 스토리 - variant/size 조합, 아이콘/상태, Playground 제공

const meta: Meta<typeof SearchBar> = {
  title: 'Commons/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary'],
      description: '시각 변형',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '컴포넌트 크기',
    },
    label: { control: 'text', description: '라벨 텍스트 (접근성 포함)' },
    placeholder: { control: 'text', description: '플레이스홀더 텍스트' },
    disabled: { control: 'boolean', description: '비활성 상태' },
    className: { control: false },
    inputClassName: { control: false },
    leftIcon: { control: false, description: '좌측 아이콘 슬롯' },
    rightIcon: { control: false, description: '우측 아이콘 슬롯' },
    onChange: { action: 'change', description: '입력값 변경 이벤트' },
    value: { control: 'text', description: '컨트롤드 입력값' },
    defaultValue: { control: 'text', description: '기본 입력값' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    label: '검색',
    placeholder: '제목을 검색해 주세요.',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Playground: Story = {
  name: 'Playground',
};

export const Primary: Story = {
  name: 'Primary',
  args: {
    variant: 'primary',
  } as Partial<SearchBarProps>,
};

export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary',
  } as Partial<SearchBarProps>,
};

export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    variant: 'tertiary',
  } as Partial<SearchBarProps>,
};

export const Small: Story = {
  name: 'Small',
  args: {
    size: 'small',
  } as Partial<SearchBarProps>,
};

export const Large: Story = {
  name: 'Large',
  args: {
    size: 'large',
  } as Partial<SearchBarProps>,
};

export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    leftIcon: <span role="img" aria-label="search">🔍</span>,
    rightIcon: <span role="img" aria-label="clear">❌</span>,
    placeholder: '아이콘이 포함된 검색바',
  } as Partial<SearchBarProps>,
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    value: '',
  } as Partial<SearchBarProps>,
};


