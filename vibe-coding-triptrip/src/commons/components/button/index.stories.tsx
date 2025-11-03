import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Button, { ButtonProps } from './index';

// 한국어 주석: 버튼 컴포넌트 스토리 - variant/active 조합과 컨트롤 제공

const meta: Meta<typeof Button> = {
  title: 'Commons/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    // 한국어 주석: variant 선택 - primary/secondary
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary'],
      description: '버튼 시각 변형',
    },
    // 한국어 주석: active 상태 - active/inactive
    active: {
      control: { type: 'radio' },
      options: ['active', 'inactive'],
      description: '활성/비활성 상태',
    },
    // 한국어 주석: label 텍스트
    children: {
      control: { type: 'text' },
      description: '버튼 라벨',
    },
    leftIcon: { control: false },
    rightIcon: { control: false },
    className: { control: false },
    onClick: { action: 'clicked' },
  },
  args: {
    // 한국어 주석: 기본 args - 프라이머리/활성/기본 라벨
    variant: 'primary',
    active: 'active',
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 한국어 주석: 프라이머리/활성 상태
export const PrimaryActive: Story = {
  name: 'Primary / Active',
};

// 한국어 주석: 프라이머리/비활성 상태 - disabled 자동 적용
export const PrimaryInactive: Story = {
  name: 'Primary / Inactive',
  args: {
    active: 'inactive',
    children: 'Disabled Primary',
  } as Partial<ButtonProps>,
};

// 한국어 주석: 세컨더리/활성 상태
export const SecondaryActive: Story = {
  name: 'Secondary / Active',
  args: {
    variant: 'secondary',
    children: 'Secondary',
  } as Partial<ButtonProps>,
};

// 한국어 주석: 세컨더리/비활성 상태
export const SecondaryInactive: Story = {
  name: 'Secondary / Inactive',
  args: {
    variant: 'secondary',
    active: 'inactive',
    children: 'Disabled Secondary',
  } as Partial<ButtonProps>,
};

// 한국어 주석: 아이콘 슬롯 예시 (좌/우 아이콘)
export const WithIcons: Story = {
  name: 'With Left/Right Icons',
  args: {
    leftIcon: <span aria-hidden>⭐</span>,
    rightIcon: <span aria-hidden>➡️</span>,
    children: 'With Icons',
  } as Partial<ButtonProps>,
};


