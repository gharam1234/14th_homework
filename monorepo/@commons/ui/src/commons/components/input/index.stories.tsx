import type { Meta, StoryObj } from '@storybook/react';
import { MyInput } from '.';

const meta = {
  title: 'Components/MyInput',
  component: MyInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'text' },
      description: 'Input type (e.g. text, password, email)',
    },
    name: {
      control: { type: 'text' },
      description: 'Input name attribute',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default input value',
    },
  },
} satisfies Meta<typeof MyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    type: 'text',
    name: 'title',
    defaultValue: '',
  },
};
