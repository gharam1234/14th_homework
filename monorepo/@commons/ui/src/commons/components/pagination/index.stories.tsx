import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Pagination from './index';

const meta = {
  title: 'Commons/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 페이지네이션 컴포넌트
 * Primary variant, Medium size, 5페이지
 */
export const Default: Story = {
  args: {
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * 다양한 페이지 수를 가진 페이지네이션
 */
export const WithTenPages: Story = {
  args: {
    totalPages: 10,
    defaultPage: 1,
  },
};

export const WithOneHundredPages: Story = {
  args: {
    totalPages: 100,
    defaultPage: 1,
  },
};

/**
 * Variant: Primary (기본 중립 스타일)
 */
export const VariantPrimary: Story = {
  args: {
    variant: 'primary',
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * Variant: Secondary (아웃라인 + 약한 브랜드 톤)
 */
export const VariantSecondary: Story = {
  args: {
    variant: 'secondary',
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * Variant: Tertiary (고스트/텍스트형 - 강조 컬러 중심)
 */
export const VariantTertiary: Story = {
  args: {
    variant: 'tertiary',
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * Size: Small (28x28)
 */
export const SizeSmall: Story = {
  args: {
    size: 'small',
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * Size: Medium (32x32, 기본값)
 */
export const SizeMedium: Story = {
  args: {
    size: 'medium',
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * Size: Large (40x40)
 */
export const SizeLarge: Story = {
  args: {
    size: 'large',
    totalPages: 5,
    defaultPage: 1,
  },
};

/**
 * 비활성 상태
 */
export const Disabled: Story = {
  args: {
    totalPages: 5,
    defaultPage: 1,
    disabled: true,
  },
};

/**
 * 제어 모드 (Controlled)
 * 상위 컴포넌트에서 currentPage를 관리하는 경우
 */
export const Controlled: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return (
      <div>
        <p>현재 페이지: {page}</p>
        <Pagination {...args} currentPage={page} onChange={setPage} />
      </div>
    );
  },
  args: {
    totalPages: 5,
  },
};

/**
 * 모든 Variant와 Size 조합 (Small)
 */
export const AllVariantsSmall: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Primary</h3>
        <Pagination variant="primary" size="small" totalPages={5} defaultPage={1} />
      </div>
      <div>
        <h3>Secondary</h3>
        <Pagination variant="secondary" size="small" totalPages={5} defaultPage={1} />
      </div>
      <div>
        <h3>Tertiary</h3>
        <Pagination variant="tertiary" size="small" totalPages={5} defaultPage={1} />
      </div>
    </div>
  ),
};

/**
 * 모든 Variant와 Size 조합 (Medium)
 */
export const AllVariantsMedium: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Primary</h3>
        <Pagination variant="primary" size="medium" totalPages={5} defaultPage={1} />
      </div>
      <div>
        <h3>Secondary</h3>
        <Pagination variant="secondary" size="medium" totalPages={5} defaultPage={1} />
      </div>
      <div>
        <h3>Tertiary</h3>
        <Pagination variant="tertiary" size="medium" totalPages={5} defaultPage={1} />
      </div>
    </div>
  ),
};

/**
 * 모든 Variant와 Size 조합 (Large)
 */
export const AllVariantsLarge: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Primary</h3>
        <Pagination variant="primary" size="large" totalPages={5} defaultPage={1} />
      </div>
      <div>
        <h3>Secondary</h3>
        <Pagination variant="secondary" size="large" totalPages={5} defaultPage={1} />
      </div>
      <div>
        <h3>Tertiary</h3>
        <Pagination variant="tertiary" size="large" totalPages={5} defaultPage={1} />
      </div>
    </div>
  ),
};

/**
 * 커스텀 아이콘을 사용하는 페이지네이션
 */
export const WithCustomIcons: Story = {
  args: {
    totalPages: 5,
    defaultPage: 1,
    prevIcon: <span>←</span>,
    nextIcon: <span>→</span>,
  },
};

/**
 * onChange 콜백 동작
 */
export const WithChangeCallback: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return (
      <div>
        <p>선택된 페이지: {page}</p>
        <Pagination {...args} defaultPage={1} onChange={(p) => setPage(p)} />
      </div>
    );
  },
  args: {
    totalPages: 5,
  },
};

/**
 * 단일 페이지 (테스트용)
 */
export const SinglePage: Story = {
  args: {
    totalPages: 1,
    defaultPage: 1,
  },
};

/**
 * 매우 많은 페이지
 */
export const ManyPages: Story = {
  args: {
    totalPages: 50,
    defaultPage: 25,
  },
};
