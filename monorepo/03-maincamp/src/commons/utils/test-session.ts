import { isTestEnv } from '@/commons/utils/is-test-env';

export const DEFAULT_TEST_SUPABASE_USER = {
  id: '00000000-0000-4000-8000-playwright',
  email: 'playwright@example.com',
  aud: 'authenticated' as const,
  role: 'authenticated' as const,
  created_at: '2024-01-01T00:00:00.000Z',
};

export const resolveTestSupabaseUser = () => {
  if (!isTestEnv()) {
    return null;
  }

  if (typeof window !== 'undefined') {
    if ((window as any).__TEST_SUPABASE_USER_DISABLED__) {
      return null;
    }
    if (!(window as any).__TEST_SUPABASE_USER__) {
      (window as any).__TEST_SUPABASE_USER__ = DEFAULT_TEST_SUPABASE_USER;
    }
    return (window as any).__TEST_SUPABASE_USER__;
  }

  return DEFAULT_TEST_SUPABASE_USER;
};
