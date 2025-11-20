'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { validate as uuidValidate } from 'uuid';
import { supabase } from '@/commons/libraries/supabaseClient';
import { resolveTestSupabaseUser } from '@/commons/utils/test-session';

// 상수 정의
const TABLE_NAME = 'phone_inquiries';
const MAX_CONTENT_LENGTH = 100;
const MIN_CONTENT_LENGTH = 1;

const ERROR_MESSAGES = {
  EMPTY_CONTENT: '답변 내용을 입력해주세요.',
  CONTENT_TOO_LONG: '답변 내용은 100자 이내로 작성해주세요.',
  CONTENT_TOO_SHORT: '답변 내용은 최소 1자 이상 입력해주세요.',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  INVALID_REPLY_ID: '유효하지 않은 답변입니다.',
  UPDATE_FAILED: '수정에 실패했습니다. 다시 시도해주세요.',
} as const;

const SUCCESS_MESSAGES = {
  UPDATE_SUCCESS: '답변이 수정되었습니다.',
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
 * 답변 수정 훅 옵션
 */
export interface UseReplyEditOptions {
  /** 수정 성공 시 콜백 */
  onSuccess?: (replyId: string, updatedContent: string) => void;
  /** 수정 실패 시 콜백 */
  onError?: (error: unknown) => void;
}

/**
 * 답변 수정 훅 반환값
 */
export interface UseReplyEditReturn {
  /** 현재 수정 중인 답변 ID (null = 수정 모드 아님) */
  isEditingId: string | null;
  /** 수정 입력값 */
  editContent: string;
  /** Supabase 업데이트 중 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 수정 모드 시작 */
  startEdit: (replyId: string, currentContent: string) => void;
  /** 수정 모드 취소 */
  cancelEdit: () => void;
  /** 입력값 업데이트 */
  updateContent: (newContent: string) => void;
  /** Supabase 업데이트 실행 */
  submitEdit: (replyId: string) => Promise<boolean>;
}

// 유틸리티 함수
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
 * 답변 수정 훅
 * @description
 * 판매자의 답변을 수정하는 기능을 제공합니다.
 * 
 * 주요 기능:
 * 1. 수정 모드 토글 (시작/취소)
 * 2. 입력값 유효성 검증 (빈값, 1-100자 제한)
 * 3. 사용자 인증 확인 (Supabase 세션 + localStorage 폴백)
 * 4. phone_inquiries 테이블에 답변 데이터 업데이트
 * 5. 성공/실패 메시지 표시
 * 6. 콜백 함수 호출 (onSuccess, onError)
 * 
 * @param options - 훅 옵션 객체
 * @param options.onSuccess - 수정 성공 시 콜백 함수
 * @param options.onError - 수정 실패 시 콜백 함수
 * 
 * @returns 훅 반환 객체
 * @returns isEditingId - 현재 수정 중인 답변 ID (null = 수정 모드 아님)
 * @returns editContent - 수정 입력값
 * @returns isLoading - Supabase 업데이트 중 상태
 * @returns error - 에러 메시지
 * @returns startEdit - 수정 모드 시작 함수
 * @returns cancelEdit - 수정 모드 취소 함수
 * @returns updateContent - 입력값 업데이트 함수
 * @returns submitEdit - Supabase 업데이트 실행 함수
 * 
 * @example
 * ```tsx
 * const { isEditingId, editContent, isLoading, error, startEdit, cancelEdit, updateContent, submitEdit } = useReplyEdit({
 *   onSuccess: (replyId, updatedContent) => {
 *     console.log('수정 완료:', replyId, updatedContent);
 *   },
 *   onError: (error) => console.error(error),
 * });
 * 
 * // 수정 모드 시작
 * startEdit('reply-id', '기존 내용');
 * 
 * // 입력값 업데이트
 * updateContent('새로운 내용');
 * 
 * // 수정 제출
 * await submitEdit('reply-id');
 * ```
 */
export function useReplyEdit({
  onSuccess,
  onError,
}: UseReplyEditOptions = {}): UseReplyEditReturn {
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    console.log('[useReplyEdit] stored session user', stored);
    if (isValidUuid(stored?.id)) {
      return stored;
    }

    return null;
  }, []);

  /**
   * 수정 모드 시작
   * @description 수정 모드를 시작하고 기존 내용으로 초기화
   * @param replyId - 수정할 답변 ID
   * @param currentContent - 현재 답변 내용
   */
  const startEdit = useCallback((replyId: string, currentContent: string) => {
    if (!replyId || !isValidUuid(replyId)) {
      console.warn('[useReplyEdit] 유효하지 않은 replyId:', replyId);
      return;
    }
    setIsEditingId(replyId);
    setEditContent(currentContent || '');
    setError(null);
  }, []);

  /**
   * 수정 모드 취소
   * @description 수정 모드를 종료하고 입력값 초기화
   */
  const cancelEdit = useCallback(() => {
    setIsEditingId(null);
    setEditContent('');
    setError(null);
  }, []);

  /**
   * 입력값 업데이트
   * @description 수정 입력값을 업데이트 (최대 100자 제한)
   * @param newContent - 새로운 입력값
   */
  const updateContent = useCallback((newContent: string) => {
    // 최대 100자로 제한
    const limitedContent = newContent.slice(0, MAX_CONTENT_LENGTH);
    setEditContent(limitedContent);
    // 입력값이 변경되면 에러 메시지 초기화
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Supabase 업데이트 실행
   * @description
   * 1. 유효성 검증 (replyId, content 길이, 로그인)
   * 2. Supabase에 update
   * 3. 성공/실패 메시지 표시
   * 
   * @param replyId - 수정할 답변 ID
   * @returns 업데이트 성공 여부 (true: 성공, false: 실패)
   */
  const submitEdit = useCallback(
    async (replyId: string): Promise<boolean> => {
      console.log('[useReplyEdit] submitEdit invoked', replyId);
      
      // 유효성 검증: replyId
      if (!replyId || !isValidUuid(replyId)) {
        message.error(ERROR_MESSAGES.INVALID_REPLY_ID);
        setError(ERROR_MESSAGES.INVALID_REPLY_ID);
        return false;
      }

      if (isLoading) {
        return false;
      }

      const content = (editContent ?? '').trim();

      // 유효성 검증: 내용 빈값 체크
      if (!content) {
        message.error(ERROR_MESSAGES.EMPTY_CONTENT);
        setError(ERROR_MESSAGES.EMPTY_CONTENT);
        return false;
      }

      // 유효성 검증: 내용 최소 길이 체크
      if (content.length < MIN_CONTENT_LENGTH) {
        message.error(ERROR_MESSAGES.CONTENT_TOO_SHORT);
        setError(ERROR_MESSAGES.CONTENT_TOO_SHORT);
        return false;
      }

      // 유효성 검증: 내용 길이 체크
      if (content.length > MAX_CONTENT_LENGTH) {
        message.error(ERROR_MESSAGES.CONTENT_TOO_LONG);
        setError(ERROR_MESSAGES.CONTENT_TOO_LONG);
        return false;
      }

      // 유효성 검증 통과 시 에러 메시지 초기화
      setError(null);

      // 사용자 인증 확인
      const user = await checkAuth();
      if (!user || !isValidUuid(user.id)) {
        message.warning(ERROR_MESSAGES.LOGIN_REQUIRED);
        setError(ERROR_MESSAGES.LOGIN_REQUIRED);
        return false;
      }
      console.log('[useReplyEdit] validation passed');

      setIsLoading(true);

      try {
        // 답변 데이터 update
        const { data: updatedData, error: updateError } = await supabase
          .from(TABLE_NAME)
          .update({
            content,
            status: 'edited',
            updated_at: new Date().toISOString(),
          })
          .eq('id', replyId)
          .select('id, content, updated_at')
          .single();

        if (updateError) {
          throw updateError;
        }

        if (!updatedData) {
          throw new Error('업데이트된 데이터를 받지 못했습니다.');
        }

        console.log('[useReplyEdit] update succeeded');
        message.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
        
        // 수정 모드 종료
        setIsEditingId(null);
        setEditContent('');
        
        // 성공 콜백 호출
        onSuccess?.(replyId, content);
        return true;
      } catch (error) {
        console.error('답변 수정 실패:', error);
        message.error(ERROR_MESSAGES.UPDATE_FAILED);
        setError(ERROR_MESSAGES.UPDATE_FAILED);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuth, editContent, isLoading, onError, onSuccess]
  );

  return {
    isEditingId,
    editContent,
    isLoading,
    error,
    startEdit,
    cancelEdit,
    updateContent,
    submitEdit,
  };
}

