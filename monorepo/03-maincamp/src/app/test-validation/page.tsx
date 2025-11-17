'use client';

import { useEffect } from 'react';
import * as validationUtils from '@/commons/utils/validation.util';

export default function TestValidationPage() {
  useEffect(() => {
    // window 객체에 validation 함수들을 노출
    if (typeof window !== 'undefined') {
      (window as any).validationUtils = validationUtils;
    }
  }, []);

  return (
    <div data-testid="validation-test-container">
      <h1>Validation Test Page</h1>
    </div>
  );
}
