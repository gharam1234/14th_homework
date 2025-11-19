import type { Meta, StoryObj } from '@storybook/react';
import { Selectbox } from '.';

const meta = {
  title: 'Components/Selectbox',
  component: Selectbox,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Selectbox variant',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Selectbox size',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    options: {
      control: { type: 'object' },
      description: 'Select options',
    },
  },
  args: {
    placeholder: '옵션을 선택하세요',
    options: [
      { value: 'option1', label: '옵션 1' },
      { value: 'option2', label: '옵션 2' },
      { value: 'option3', label: '옵션 3' },
      { value: 'option4', label: '옵션 4' },
    ],
  },
} satisfies Meta<typeof Selectbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: true,
  },
};

export const PrimarySmall: Story = {
  args: {
    variant: 'primary',
    size: 'small',
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'large',
  },
};

export const SecondarySmall: Story = {
  args: {
    variant: 'secondary',
    size: 'small',
  },
};

export const SecondaryLarge: Story = {
  args: {
    variant: 'secondary',
    size: 'large',
  },
};

export const TertiarySmall: Story = {
  args: {
    variant: 'tertiary',
    size: 'small',
  },
};

export const TertiaryLarge: Story = {
  args: {
    variant: 'tertiary',
    size: 'large',
  },
};
