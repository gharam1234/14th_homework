import type { Meta, StoryObj } from '@storybook/react';
import { MyButton } from ".";


const meta = {
  title: 'components/MyButton',
  component: MyButton,
  tags: ['autodocs'],
} satisfies Meta<typeof MyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};