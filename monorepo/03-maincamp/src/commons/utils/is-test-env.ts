export const isTestEnv = (): boolean => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TEST_ENV === 'test') {
    return true;
  }

  if (typeof window !== 'undefined') {
    const bypassFlag = (window as any).__TEST_BYPASS__;
    if (bypassFlag === true) {
      return true;
    }

    try {
      const storedFlag = window.localStorage.getItem('__TEST_BYPASS__');
      if (storedFlag === 'true') {
        return true;
      }
    } catch (error) {
      console.warn('[isTestEnv] 로컬스토리지 테스트 플래그 확인 실패', error);
    }
  }

  return false;
};
