import type {
  ValidationResult,
  ValidationRules,
  ValidationResultSet,
  ValidationErrors,
} from './validation.types';

/**
 * 필수 필드 검증
 * @param value - 검증할 값
 * @param fieldName - 필드 이름
 * @returns 검증 결과
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return {
      success: false,
      errorMessage: `${fieldName}은(는) 필수 입력 항목입니다.`,
    };
  }

  return {
    success: true,
    value,
  };
}

/**
 * 가격 형식 검증
 * @param price - 검증할 가격
 * @param fieldName - 필드 이름
 * @returns 검증 결과
 */
export function validatePrice(
  price: number | string,
  fieldName: string
): ValidationResult {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return {
      success: false,
      errorMessage: `${fieldName}은(는) 유효한 숫자여야 합니다.`,
    };
  }

  if (numPrice < 0) {
    return {
      success: false,
      errorMessage: `${fieldName}은(는) 0 이상이어야 합니다.`,
    };
  }

  if (numPrice > 100000000) {
    return {
      success: false,
      errorMessage: `${fieldName}은(는) 100000000 이하여야 합니다.`,
    };
  }

  return {
    success: true,
    value: numPrice,
  };
}

/**
 * 좌표 값 검증
 * @param latitude - 위도
 * @param longitude - 경도
 * @returns 검증 결과
 */
export function validateCoordinate(
  latitude: number,
  longitude: number
): ValidationResult {
  if (latitude < -90 || latitude > 90) {
    return {
      success: false,
      errorMessage: '위도는 -90에서 90 사이여야 합니다.',
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      success: false,
      errorMessage: '경도는 -180에서 180 사이여야 합니다.',
    };
  }

  return {
    success: true,
    value: { latitude, longitude },
  };
}

/**
 * 태그 검증
 * @param tags - 태그 배열 또는 문자열
 * @returns 검증 결과
 */
export function validateTags(tags: string[] | string): ValidationResult {
  const tagList = Array.isArray(tags)
    ? tags
    : tags.split(',');

  const cleanedTags = tagList.map((tag) => tag.trim()).filter((tag) => tag);
  const uniqueTags = Array.from(new Set(cleanedTags));

  if (cleanedTags.length !== uniqueTags.length) {
    return {
      success: false,
      errorMessage: '중복된 태그가 있습니다.',
    };
  }

  if (cleanedTags.length > 10) {
    return {
      success: false,
      errorMessage: '태그는 최대 10개까지만 등록할 수 있습니다.',
    };
  }

  return {
    success: true,
    value: uniqueTags,
  };
}

/**
 * 글자 수 제한 검증
 * @param value - 검증할 문자열
 * @param fieldName - 필드 이름
 * @param max - 최대 길이
 * @param min - 최소 길이 (선택)
 * @returns 검증 결과
 */
export function validateLength(
  value: string,
  fieldName: string,
  max: number,
  min?: number
): ValidationResult {
  const length = value.length;

  if (min !== undefined && length < min) {
    return {
      success: false,
      errorMessage: `${fieldName}은(는) ${min}자 이상이어야 합니다.`,
    };
  }

  if (length > max) {
    return {
      success: false,
      errorMessage: `${fieldName}은(는) ${max}자 이하여야 합니다.`,
    };
  }

  return {
    success: true,
    value,
  };
}

/**
 * 비동기 검증 함수 래퍼
 * @param validatorFn - 비동기 검증 함수
 * @param errorMessage - 에러 메시지
 * @returns 검증 결과
 */
export async function validateAsync(
  validatorFn: () => Promise<boolean>,
  errorMessage: string
): Promise<ValidationResult> {
  try {
    const isValid = await validatorFn();
    if (isValid) {
      return { success: true };
    }
    return { success: false, errorMessage };
  } catch (error) {
    return { success: false, errorMessage };
  }
}

const NUMERIC_PATTERN = /^-?\d+(?:\.\d+)?$/;

function isNumericString(value: string): boolean {
  return NUMERIC_PATTERN.test(value.trim());
}

function isTagField(fieldName: string): boolean {
  return fieldName.toLowerCase().includes('tag');
}

/**
 * 값 정규화 (문자열 trim)
 */
function normalizeString(value: any): any {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

/**
 * 값 정규화 (숫자 변환)
 */
function normalizeNumber(value: any): any {
  if (typeof value === 'string' && isNumericString(value)) {
    const parsed = Number(value.trim());
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}

/**
 * 값 정규화 (배열 변환 및 중복 제거)
 */
function normalizeArray(value: any): any {
  const toUniqueList = (items: string[]): string[] =>
    Array.from(new Set(items.map((item) => item.trim()).filter((item) => item)));

  if (typeof value === 'string') {
    return toUniqueList(value.split(','));
  }

  if (Array.isArray(value)) {
    return toUniqueList(value);
  }

  return value;
}

/**
 * 필드 값 정규화
 */
function normalizeValue(value: any, fieldName: string): any {
  if (isTagField(fieldName)) {
    return normalizeArray(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  const normalized = normalizeString(value);

  if (normalized === null) {
    return null;
  }

  if (typeof normalized === 'string') {
    const numericValue = normalizeNumber(normalized);
    if (typeof numericValue === 'number' && !Number.isNaN(numericValue)) {
      return numericValue;
    }
    return normalized;
  }

  if (typeof normalized === 'number') {
    return normalized;
  }

  return normalized;
}

/**
 * 모든 필드를 병렬로 검증
 * @param data - 검증할 데이터
 * @param rules - 검증 규칙
 * @returns 검증 결과
 */
export async function validateAllFields<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules<T>
): Promise<ValidationResultSet<T>> {
  const errors: ValidationErrors<T> = {} as ValidationErrors<T>;
  const normalizedData: Partial<T> = {};
  let hasErrors = false;

  // 모든 필드 검증을 병렬로 실행
  const validationPromises = Object.keys(rules).map(async (fieldName) => {
    const field = fieldName as keyof T;
    const rule = rules[field];
    if (!rule) return;

    const value = data[field];
    let currentValue = value;

    // 동기 검증
    const syncValidators = rule.sync ?? [];
    for (const validator of syncValidators) {
      const result = validator(currentValue);
      if (!result.success) {
        errors[field] = result.errorMessage!;
        hasErrors = true;
        return;
      }
      if (result.value !== undefined) {
        currentValue = result.value;
      }
    }

    // 비동기 검증
    if (rule.async) {
      for (const validator of rule.async) {
        const result = await validator(currentValue);
        if (!result.success) {
          errors[field] = result.errorMessage!;
          hasErrors = true;
          return;
        }
        if (result.value !== undefined) {
          currentValue = result.value;
        }
      }
    }

    // 정규화 - currentValue가 이미 validator에 의해 정규화되었을 수 있음
    normalizedData[field] = normalizeValue(currentValue, String(field));
  });

  await Promise.all(validationPromises);

  const isValid = !hasErrors;

  return {
    isValid,
    errors,
    normalizedData: isValid ? (normalizedData as T) : undefined,
  };
}
