/**
 * 유효성 검사 결과 타입
 */
export interface ValidationResult {
  success: boolean;
  errorMessage?: string;
  value?: any;
}

/**
 * 동기 검증 함수 타입
 */
export type SyncValidatorFn<T = any> = (value: T) => ValidationResult;

/**
 * 비동기 검증 함수 타입
 */
export type AsyncValidatorFn<T = any> = (value: T) => Promise<ValidationResult>;

/**
 * 필드별 검증 규칙
 */
export interface FieldValidationRule<T = any> {
  sync: SyncValidatorFn<T>[];
  async?: AsyncValidatorFn<T>[];
}

/**
 * 전체 필드 검증 규칙
 */
export type ValidationRules<T> = {
  [K in keyof T]?: FieldValidationRule<T[K]>;
};

export type ValidationErrors<T> = Record<keyof T, string | undefined>;

/**
 * 병렬 검증 결과
 */
export interface ValidationResultSet<T> {
  isValid: boolean;
  errors: ValidationErrors<T>;
  normalizedData?: T;
}
