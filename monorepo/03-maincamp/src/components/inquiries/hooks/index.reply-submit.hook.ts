'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { validate as uuidValidate } from 'uuid';
import { supabase } from '@/commons/libraries/supabaseClient';
import { resolveTestSupabaseUser } from '@/commons/utils/test-session';

// 상수 정의
const TABLE_NAME = 'phone_inquiries';
const MAX_CONTENT_LENGTH = 100;

const ERROR_MESSAGES = {
  EMPTY_CONTENT: '답변 내용을 입력해주세요.',
  CONTENT_TOO_LONG: '답변 내용은 100자 이내로 작성해주세요.',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  INVALID_PHONE: '유효하지 않은 상품입니다.',
  INVALID_INQUIRY: '유효하지 않은 문의입니다.',
  SUBMIT_FAILED: '답변 등록에 실패하였습니다. 다시 시도해주세요.',
} as const;

const SUCCESS_MESSAGES = {
  SUBMIT_SUCCESS: '답변 등록에 성공하였습니다.',
} as const;

// 타입 정의
/**
 * 인증된 사용자 정보
 */
interface AuthUser {
  /** 사용자 ID (UUID) */
  id: string;
}

/**
 * 부모 문의 정보
 */
interface ParentInquiry {
  id: string;
  thread_path: string | null;
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
  const testUser = resolveTestSupabaseUser() as AuthUser | null;
  if (typeof window === 'undefined') {
    return testUser;
  }
  const storageKey = getSupabaseStorageKey();
  if (!storageKey) return testUser;

  const rawSession =
    window.localStorage.getItem(storageKey) ?? window.sessionStorage?.getItem(storageKey);
  if (!rawSession) return testUser;

  try {
    const parsed = JSON.parse(rawSession);
    const storedUser = parsed?.currentSession?.user ?? parsed?.user;
    if (storedUser?.id) {
      return { id: storedUser.id };
    }
  } catch (error) {
    console.warn('세션 정보 파싱 실패:', error);
  }

  return testUser;
};

/**
 * 답변 제출 훅 옵션
 */
export interface UseReplySubmitOptions {
  /** 문의 대상 상품 ID */
  phoneId: string;
  /** 부모 문의 ID */
  inquiryId: string;
  /** 제출 성공 시 콜백 */
  onSuccess?: () => void;
  /** 제출 실패 시 콜백 */
  onError?: (error: unknown) => void;
}

/**
 * 답변 제출 훅 반환값
 */
export interface UseReplySubmitReturn {
  /** 제출 중 상태 */
  isSubmitting: boolean;
  /** 답변 제출 함수 */
  submitReply: (content: string) => Promise<boolean>;
  /** 유효성 검증 에러 메시지 */
  validationError: string | null;
}

/**
 * 답변 제출 훅
 * @description
 * 판매자의 답변을 Supabase에 저장하는 기능을 제공합니다.
 * 
 * 주요 기능:
 * 1. 입력 유효성 검증 (빈값, 100자 제한)
 * 2. 사용자 인증 확인 (Supabase 세션 + localStorage 폴백)
 * 3. 부모 문의의 thread_path 조회
 * 4. phone_inquiries 테이블에 답변 데이터 저장
 * 5. 성공/실패 메시지 표시
 * 6. 콜백 함수 호출 (onSuccess, onError)
 * 
 * @param options - 훅 옵션 객체
 * @param options.phoneId - 문의 대상 상품 ID (UUID)
 * @param options.inquiryId - 부모 문의 ID (UUID)
 * @param options.onSuccess - 제출 성공 시 콜백 함수
 * @param options.onError - 제출 실패 시 콜백 함수
 * 
 * @returns 훅 반환 객체
 * @returns isSubmitting - 제출 중 상태 (true: 제출 중, false: 대기)
 * @returns submitReply - 답변 제출 함수 (content: string) => Promise<boolean>
 * @returns validationError - 유효성 검증 에러 메시지
 * 
 * @example
 * ```tsx
 * const { isSubmitting, submitReply, validationError } = useReplySubmit({
 *   phoneId: 'some-uuid',
 *   inquiryId: 'parent-inquiry-uuid',
 *   onSuccess: () => router.refresh(),
 *   onError: (error) => console.error(error),
 * });
 * 
 * await submitReply('답변 내용입니다.');
 * ```
 */
export function useReplySubmit({
  phoneId,
  inquiryId,
  onSuccess,
  onError,
}: UseReplySubmitOptions): UseReplySubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
    console.log('[useReplySubmit] stored session user', stored);
    if (isValidUuid(stored?.id)) {
      return stored;
    }

    return null;
  }, []);

  /**
   * 부모 문의의 thread_path 조회
   * @description 부모 문의의 thread_path를 조회하여 답변의 thread_path 생성에 사용
   * @returns 부모 문의 정보 또는 null
   */
  const fetchParentInquiry = useCallback(async (): Promise<ParentInquiry | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, thread_path')
        .eq('id', inquiryId)
        .single();

      if (error) {
        console.error('[useReplySubmit] 부모 문의 조회 실패:', error);
        return null;
      }

      return data as ParentInquiry;
    } catch (error) {
      console.error('[useReplySubmit] 부모 문의 조회 중 예외 발생:', error);
      return null;
    }
  }, [inquiryId]);

  /**
   * 답변 제출 함수
   * @description
   * 1. 유효성 검증 (phoneId, inquiryId, content 길이, 로그인)
   * 2. 부모 문의의 thread_path 조회
   * 3. Supabase에 insert
   * 4. insert 후 thread_path 업데이트 (필요한 경우)
   * 5. 성공/실패 메시지 표시
   * 
   * @param rawContent - 사용자가 입력한 답변 내용
   * @returns 제출 성공 여부 (true: 성공, false: 실패)
   */
  const submitReply = useCallback(
    async (rawContent: string): Promise<boolean> => {
      console.log('[useReplySubmit] submit invoked', rawContent);
      
      // 유효성 검증: phoneId
      if (!phoneId || !isValidUuid(phoneId)) {
        message.error(ERROR_MESSAGES.INVALID_PHONE);
        setValidationError(ERROR_MESSAGES.INVALID_PHONE);
        return false;
      }

      // 유효성 검증: inquiryId
      if (!inquiryId || !isValidUuid(inquiryId)) {
        message.error(ERROR_MESSAGES.INVALID_INQUIRY);
        setValidationError(ERROR_MESSAGES.INVALID_INQUIRY);
        return false;
      }

      if (isSubmitting) {
        return false;
      }

      const content = (rawContent ?? '').trim();

      // 유효성 검증: 내용 빈값 체크
      if (!content) {
        message.error(ERROR_MESSAGES.EMPTY_CONTENT);
        setValidationError(ERROR_MESSAGES.EMPTY_CONTENT);
        return false;
      }

      // 유효성 검증: 내용 길이 체크
      if (content.length > MAX_CONTENT_LENGTH) {
        message.error(ERROR_MESSAGES.CONTENT_TOO_LONG);
        setValidationError(ERROR_MESSAGES.CONTENT_TOO_LONG);
        return false;
      }

      // 유효성 검증 통과 시 에러 메시지 초기화
      setValidationError(null);

      // 사용자 인증 확인
      const user = await checkAuth();
      if (!user || !isValidUuid(user.id)) {
        message.warning(ERROR_MESSAGES.LOGIN_REQUIRED);
        setValidationError(ERROR_MESSAGES.LOGIN_REQUIRED);
        return false;
      }
      console.log('[useReplySubmit] validation passed');

      setIsSubmitting(true);

      try {
        // 부모 문의의 thread_path 조회
        const parentInquiry = await fetchParentInquiry();
        if (!parentInquiry) {
          throw new Error('부모 문의를 찾을 수 없습니다.');
        }

        // thread_path 생성: 부모 thread_path가 있으면 부모 thread_path + '/' + 현재 ID, 없으면 부모 ID만
        // 현재 ID는 insert 후에 생성되므로, 먼저 임시 thread_path로 insert하고 나중에 업데이트
        const baseThreadPath = parentInquiry.thread_path || parentInquiry.id;

        // 답변 데이터 insert
        const { data: insertedData, error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert([
            {
              content,
              phone_id: phoneId,
              parent_id: inquiryId,
              author_id: user.id,
              status: 'active',
              is_answer: true,
              link_url: null,
              link_title: null,
              link_description: null,
              link_image: null,
              thread_path: baseThreadPath, // 임시로 부모 thread_path 사용
            },
          ])
          .select('id')
          .single();

        if (insertError) {
          throw insertError;
        }

        // insert 후 생성된 ID로 thread_path 업데이트: 부모 thread_path + '/' + 현재 ID
        if (insertedData?.id) {
          const finalThreadPath = `${baseThreadPath}/${insertedData.id}`;
          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update({ thread_path: finalThreadPath })
            .eq('id', insertedData.id);

          if (updateError) {
            console.warn('[useReplySubmit] thread_path 업데이트 실패:', updateError);
            // thread_path 업데이트 실패는 치명적이지 않으므로 계속 진행
          }
        }

        console.log('[useReplySubmit] insert succeeded');
        message.success(SUCCESS_MESSAGES.SUBMIT_SUCCESS);
        onSuccess?.();
        return true;
      } catch (error) {
        console.error('답변 등록 실패:', error);
        message.error(ERROR_MESSAGES.SUBMIT_FAILED);
        onError?.(error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [checkAuth, fetchParentInquiry, inquiryId, isSubmitting, onError, onSuccess, phoneId]
  );

  return {
    isSubmitting,
    submitReply,
    validationError,
  };
}
