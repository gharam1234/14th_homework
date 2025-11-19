import type { Meta, StoryObj } from '@storybook/react';
import { MyTextarea } from '.';

const meta = {
  title: 'Components/MyTextarea',
  component: MyTextarea,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    placeholder: {
      control: { type: 'text' },
    },
  },
  args: {
    placeholder: '텍스트를 입력하세요',
  },
} satisfies Meta<typeof MyTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
  },
};

