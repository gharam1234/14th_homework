'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { validate as uuidValidate } from 'uuid';
import { supabase } from '@/commons/libraries/supabaseClient';

// 상수 정의
const TABLE_NAME = 'phone_inquiries';
const MAX_CONTENT_LENGTH = 100;

const ERROR_MESSAGES = {
  EMPTY_CONTENT: '문의 내용을 입력해주세요.',
  CONTENT_TOO_LONG: '문의 내용은 100자 이내로 작성해주세요.',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  INVALID_PHONE: '유효하지 않은 상품입니다.',
  SUBMIT_FAILED: '문의 등록에 실패했습니다. 다시 시도해주세요.',
} as const;

const SUCCESS_MESSAGES = {
  SUBMIT_SUCCESS: '문의가 등록되었습니다.',
} as const;

// 타입 정의
/**
 * 인증된 사용자 정보
 */
interface AuthUser {
  /** 사용자 ID (UUID) */
  id: string;
}

// 유틸리티 함수
/**
 * Supabase 스토리지 키 추출
 * @description 환경변수에서 Supabase URL을 파싱하여 localStorage 키를 생성
 * @returns Supabase 스토리지 키 또는 null
 */
const getSupabaseStorageKey = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;
  return `sb-${projectRef}-auth-token`;
};

/**
 * UUID 유효성 검증
 * @description uuid 라이브러리를 사용하여 UUID 형식 검증
 * @param value - 검증할 문자열
 * @returns UUID 유효성 여부 (true: 유효, false: 무효)
 */
const isValidUuid = (value?: string | null) => {
  if (!value) return false;
  return uuidValidate(value);
};

/**
 * localStorage에서 Supabase 세션 사용자 정보 추출
 * @description Playwright 테스트 환경에서 설정한 세션 정보를 조회
 * @returns 사용자 정보 객체 또는 null
 */
const getStoredSessionUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const storageKey = getSupabaseStorageKey();
  if (!storageKey) return null;

  const rawSession =
    window.localStorage.getItem(storageKey) ?? window.sessionStorage?.getItem(storageKey);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    const storedUser = parsed?.currentSession?.user ?? parsed?.user;
    if (storedUser?.id) {
      return { id: storedUser.id };
    }
  } catch (error) {
    console.warn('세션 정보 파싱 실패:', error);
  }

  return null;
};

/**
 * 문의 제출 훅 옵션
 */
export interface UseInquirySubmitOptions {
  /** 문의 대상 상품 ID */
  phoneId: string;
  /** 제출 성공 시 콜백 */
  onSuccess?: () => void;
  /** 제출 실패 시 콜백 */
  onError?: (error: unknown) => void;
}

/**
 * 문의 제출 훅 반환값
 */
export interface UseInquirySubmitReturn {
  /** 제출 중 상태 */
  isSubmitting: boolean;
  /** 문의 제출 함수 */
  submitInquiry: (content: string) => Promise<boolean>;
}

/**
 * 문의 제출 훅
 * @description
 * 사용자의 문의 사항을 Supabase에 저장하는 기능을 제공합니다.
 * 
 * 주요 기능:
 * 1. 입력 유효성 검증 (빈값, 100자 제한)
 * 2. 사용자 인증 확인 (Supabase 세션 + localStorage 폴백)
 * 3. phone_inquiries 테이블에 데이터 저장
 * 4. 성공/실패 메시지 표시
 * 5. 콜백 함수 호출 (onSuccess, onError)
 * 
 * @param options - 훅 옵션 객체
 * @param options.phoneId - 문의 대상 상품 ID (UUID)
 * @param options.onSuccess - 제출 성공 시 콜백 함수
 * @param options.onError - 제출 실패 시 콜백 함수
 * 
 * @returns 훅 반환 객체
 * @returns isSubmitting - 제출 중 상태 (true: 제출 중, false: 대기)
 * @returns submitInquiry - 문의 제출 함수 (content: string) => Promise<boolean>
 * 
 * @example
 * ```tsx
 * const { isSubmitting, submitInquiry } = useInquirySubmit({
 *   phoneId: 'some-uuid',
 *   onSuccess: () => router.refresh(),
 *   onError: (error) => console.error(error),
 * });
 * 
 * await submitInquiry('문의 내용입니다.');
 * ```
 */
export function useInquirySubmit({
  phoneId,
  onSuccess,
  onError,
}: UseInquirySubmitOptions): UseInquirySubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 사용자 인증 확인
   * @description Supabase 세션을 확인하고, 없으면 localStorage를 확인
   * @returns 인증된 사용자 정보 또는 null
   */
  const checkAuth = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      if (isValidUuid(sessionUser?.id)) {
        return { id: sessionUser!.id };
      }
    } catch (error) {
      console.warn('Supabase 세션 조회 실패:', error);
    }

    const stored = getStoredSessionUser();
    console.log('[useInquirySubmit] stored session user', stored);
    if (isValidUuid(stored?.id)) {
      return stored;
    }

    return null;
  }, []);

  /**
   * 문의 제출 함수
   * @description
   * 1. 유효성 검증 (phoneId, content 길이, 로그인)
   * 2. Supabase에 insert
   * 3. 성공/실패 메시지 표시
   * 
   * @param rawContent - 사용자가 입력한 문의 내용
   * @returns 제출 성공 여부 (true: 성공, false: 실패)
   */
  const submitInquiry = useCallback(
    async (rawContent: string): Promise<boolean> => {
      console.log('[useInquirySubmit] submit invoked', rawContent);
      if (!phoneId || !isValidUuid(phoneId)) {
        message.error(ERROR_MESSAGES.INVALID_PHONE);
        return false;
      }

      if (isSubmitting) {
        return false;
      }

      const content = (rawContent ?? '').trim();

      if (!content) {
        message.error(ERROR_MESSAGES.EMPTY_CONTENT);
        return false;
      }

      if (content.length > MAX_CONTENT_LENGTH) {
        message.error(ERROR_MESSAGES.CONTENT_TOO_LONG);
        return false;
      }

      const user = await checkAuth();
      if (!user || !isValidUuid(user.id)) {
        message.warning(ERROR_MESSAGES.LOGIN_REQUIRED);
        return false;
      }
      console.log('[useInquirySubmit] validation passed');

      setIsSubmitting(true);

      try {
        const { error } = await supabase.from(TABLE_NAME).insert([
          {
            content,
            phone_id: phoneId,
            author_id: user.id,
            parent_id: null,
            status: 'active',
            is_answer: false,
          },
        ]);

        if (error) {
          throw error;
        }

        console.log('[useInquirySubmit] insert succeeded');
        message.success(SUCCESS_MESSAGES.SUBMIT_SUCCESS);
        onSuccess?.();
        return true;
      } catch (error) {
        console.error('문의 등록 실패:', error);
        message.error(ERROR_MESSAGES.SUBMIT_FAILED);
        onError?.(error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [checkAuth, isSubmitting, onError, onSuccess, phoneId]
  );

  return {
    isSubmitting,
    submitInquiry,
  };
}
