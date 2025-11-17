import { test, expect } from '@playwright/test';

test.describe('Validation Utility Tests', () => {
  test.describe('동기 유효성 검사 함수 테스트', () => {
    test('validateRequired - 필수 필드 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateRequired } = (window as any).validationUtils;
        return validateRequired('테스트 값', 'testField');
      });

      expect(result.success).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    test('validateRequired - 빈값 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateRequired } = (window as any).validationUtils;
        return validateRequired('', 'testField');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('testField은(는) 필수 입력 항목입니다.');
    });

    test('validateRequired - null 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateRequired } = (window as any).validationUtils;
        return validateRequired(null, 'testField');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('testField은(는) 필수 입력 항목입니다.');
    });

    test('validateRequired - undefined 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateRequired } = (window as any).validationUtils;
        return validateRequired(undefined, 'testField');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('testField은(는) 필수 입력 항목입니다.');
    });

    test('validatePrice - 유효한 가격 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validatePrice } = (window as any).validationUtils;
        return validatePrice(50000, 'price');
      });

      expect(result.success).toBe(true);
      expect(result.value).toBe(50000);
    });

    test('validatePrice - 문자열 가격 변환 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validatePrice } = (window as any).validationUtils;
        return validatePrice('50000', 'price');
      });

      expect(result.success).toBe(true);
      expect(result.value).toBe(50000);
    });

    test('validatePrice - 음수 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validatePrice } = (window as any).validationUtils;
        return validatePrice(-1000, 'price');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('price은(는) 0 이상이어야 합니다.');
    });

    test('validatePrice - 최대값 초과 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validatePrice } = (window as any).validationUtils;
        return validatePrice(200000000, 'price');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('price은(는) 100000000 이하여야 합니다.');
    });

    test('validatePrice - 숫자가 아닌 값 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validatePrice } = (window as any).validationUtils;
        return validatePrice('abc', 'price');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('price은(는) 유효한 숫자여야 합니다.');
    });

    test('validateCoordinate - 유효한 좌표 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateCoordinate } = (window as any).validationUtils;
        return validateCoordinate(37.5665, 126.9780);
      });

      expect(result.success).toBe(true);
    });

    test('validateCoordinate - latitude 범위 초과 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateCoordinate } = (window as any).validationUtils;
        return validateCoordinate(91, 126.9780);
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('위도는 -90에서 90 사이여야 합니다.');
    });

    test('validateCoordinate - longitude 범위 초과 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateCoordinate } = (window as any).validationUtils;
        return validateCoordinate(37.5665, 181);
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('경도는 -180에서 180 사이여야 합니다.');
    });

    test('validateTags - 유효한 태그 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateTags } = (window as any).validationUtils;
        return validateTags(['tag1', 'tag2', 'tag3']);
      });

      expect(result.success).toBe(true);
    });

    test('validateTags - 중복 태그 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateTags } = (window as any).validationUtils;
        return validateTags(['tag1', 'tag2', 'tag1']);
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('중복된 태그가 있습니다.');
    });

    test('validateTags - 문자열 중복 태그 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateTags } = (window as any).validationUtils;
        return validateTags('tag1, tag2, tag1');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('중복된 태그가 있습니다.');
    });

    test('validateTags - 최대 개수 초과 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateTags } = (window as any).validationUtils;
        return validateTags(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10', 'tag11']);
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('태그는 최대 10개까지만 등록할 수 있습니다.');
    });

    test('validateLength - 유효한 길이 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateLength } = (window as any).validationUtils;
        return validateLength('테스트 제목', 'title', 100);
      });

      expect(result.success).toBe(true);
    });

    test('validateLength - 최대 길이 초과 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateLength } = (window as any).validationUtils;
        return validateLength('a'.repeat(101), 'title', 100);
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('title은(는) 100자 이하여야 합니다.');
    });

    test('validateLength - 최소 길이 미달 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(() => {
        const { validateLength } = (window as any).validationUtils;
        return validateLength('ab', 'title', 100, 5);
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('title은(는) 5자 이상이어야 합니다.');
    });
  });

  test.describe('비동기 유효성 검사 함수 테스트', () => {
    test('validateAsync - 비동기 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(async () => {
        const { validateAsync } = (window as any).validationUtils;
        return await validateAsync(async () => true, '비동기 검증 에러');
      });

      expect(result.success).toBe(true);
    });

    test('validateAsync - 비동기 검증 실패', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(async () => {
        const { validateAsync } = (window as any).validationUtils;
        return await validateAsync(async () => false, '비동기 검증 에러');
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('비동기 검증 에러');
    });
  });

  test.describe('병렬 검증 테스트', () => {
    test('validateAllFields - 모든 필드 검증 성공', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(async () => {
        const { validateAllFields, validateRequired, validatePrice, validateLength } = (window as any).validationUtils;
        
        const formData = {
          title: '  테스트 제목  ',
          price: '50000',
          description: '테스트 설명',
        };

        const rules = {
          title: {
            sync: [
              (v: any) => validateRequired(v, 'title'),
              (v: any) => validateLength(v, 'title', 100),
            ],
          },
          price: {
            sync: [(v: any) => validatePrice(v, 'price')],
          },
          description: {
            sync: [(v: any) => validateLength(v, 'description', 500)],
          },
        };

        return await validateAllFields(formData, rules);
      });

      expect(result.isValid).toBe(true);
      expect(result.normalizedData?.title).toBe('테스트 제목');
      expect(result.normalizedData?.price).toBe(50000);
    });

    test('validateAllFields - 실패한 필드만 에러 반환', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(async () => {
        const { validateAllFields, validateRequired, validatePrice } = (window as any).validationUtils;
        
        const formData = {
          title: '',
          price: -1000,
        };

        const rules = {
          title: {
            sync: [(v: any) => validateRequired(v, 'title')],
          },
          price: {
            sync: [(v: any) => validatePrice(v, 'price')],
          },
        };

        return await validateAllFields(formData, rules);
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('title은(는) 필수 입력 항목입니다.');
      expect(result.errors.price).toBe('price은(는) 0 이상이어야 합니다.');
    });

    test('validateAllFields - 태그 정규화 테스트', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(async () => {
        const { validateAllFields, validateTags } = (window as any).validationUtils;
        
        const formData = {
          tags: ' tag1, tag2 , tag3  ',
        };

        const rules = {
          tags: {
            sync: [(v: any) => validateTags(v)],
          },
        };

        return await validateAllFields(formData, rules);
      });

      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.normalizedData?.tags)).toBe(true);
      expect(result.normalizedData?.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('validateAllFields - 숫자 문자열 정규화', async ({ page }) => {
      await page.goto('/test-validation');
      await page.waitForSelector('[data-testid="validation-test-container"]');

      const result = await page.evaluate(async () => {
        const { validateAllFields, validateRequired } = (window as any).validationUtils;

        const formData = {
          stock: ' 150 ',
        };

        const rules = {
          stock: {
            sync: [(v: any) => validateRequired(v, 'stock')],
          },
        };

        return await validateAllFields(formData, rules);
      });

      expect(result.isValid).toBe(true);
      expect(result.normalizedData?.stock).toBe(150);
      expect(typeof result.normalizedData?.stock).toBe('number');
    });
  });
});
