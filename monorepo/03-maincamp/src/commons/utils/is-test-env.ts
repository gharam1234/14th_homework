export const isTestEnv = (): boolean => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TEST_ENV === 'test') {
    return true;
  }

  if (typeof window !== 'undefined' && (window as any).__TEST_BYPASS__ === true) {
    return true;
  }

  return false;
};
