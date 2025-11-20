'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { validate as uuidValidate } from 'uuid';
import { supabase } from '@/commons/libraries/supabaseClient';
import { resolveTestSupabaseUser } from '@/commons/utils/test-session';

// 상수 정의
const TABLE_NAME = 'phone_inquiries';

const ERROR_MESSAGES = {
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  INVALID_REPLY_ID: '유효하지 않은 답변입니다.',
  DELETE_FAILED: '삭제에 실패했습니다. 다시 시도해주세요.',
} as const;

const SUCCESS_MESSAGES = {
  DELETE_SUCCESS: '답변이 삭제되었습니다.',
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
 * 답변 삭제 훅 옵션
 */
export interface UseReplyDeleteOptions {
  /** 삭제 성공 시 콜백 */
  onSuccess?: (replyId: string) => void;
  /** 삭제 실패 시 콜백 */
  onError?: (error: unknown) => void;
}

/**
 * 답변 삭제 훅 반환값
 */
export interface UseReplyDeleteReturn {
  /** 삭제 확인 모달 열림 상태 */
  isDeleteModalOpen: boolean;
  /** 삭제 대상 답변 ID */
  deleteTargetId: string | null;
  /** Supabase 삭제 중 상태 */
  isDeleting: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 삭제 확인 모달 열기 */
  openDeleteModal: (replyId: string) => void;
  /** 삭제 확인 모달 닫기 */
  closeDeleteModal: () => void;
  /** Supabase 삭제 실행 */
  confirmDelete: (replyId: string) => Promise<boolean>;
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
 * 답변 삭제 훅
 * @description
 * 판매자의 답변을 삭제하는 기능을 제공합니다.
 * 
 * 주요 기능:
 * 1. 삭제 확인 모달 관리 (열기/닫기)
 * 2. 사용자 인증 확인 (Supabase 세션 + localStorage 폴백)
 * 3. phone_inquiries 테이블에 답변 status를 'deleted'로 업데이트 (소프트 삭제)
 * 4. 성공/실패 메시지 표시
 * 5. 콜백 함수 호출 (onSuccess, onError)
 * 
 * @param options - 훅 옵션 객체
 * @param options.onSuccess - 삭제 성공 시 콜백 함수
 * @param options.onError - 삭제 실패 시 콜백 함수
 * 
 * @returns 훅 반환 객체
 * @returns isDeleteModalOpen - 삭제 확인 모달 열림 상태
 * @returns deleteTargetId - 삭제 대상 답변 ID
 * @returns isDeleting - Supabase 삭제 중 상태
 * @returns error - 에러 메시지
 * @returns openDeleteModal - 삭제 확인 모달 열기 함수
 * @returns closeDeleteModal - 삭제 확인 모달 닫기 함수
 * @returns confirmDelete - Supabase 삭제 실행 함수
 * 
 * @example
 * ```tsx
 * const { isDeleteModalOpen, deleteTargetId, isDeleting, error, openDeleteModal, closeDeleteModal, confirmDelete } = useReplyDelete({
 *   onSuccess: (replyId) => {
 *     console.log('삭제 완료:', replyId);
 *   },
 *   onError: (error) => console.error(error),
 * });
 * 
 * // 삭제 확인 모달 열기
 * openDeleteModal('reply-id');
 * 
 * // 삭제 실행
 * await confirmDelete('reply-id');
 * ```
 */
export function useReplyDelete({
  onSuccess,
  onError,
}: UseReplyDeleteOptions = {}): UseReplyDeleteReturn {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    console.log('[useReplyDelete] stored session user', stored);
    if (isValidUuid(stored?.id)) {
      return stored;
    }

    return null;
  }, []);

  /**
   * 삭제 확인 모달 열기
   * @description 삭제 확인 모달을 열고 삭제 대상 ID를 설정
   * @param replyId - 삭제할 답변 ID
   */
  const openDeleteModal = useCallback((replyId: string) => {
    if (!replyId || !isValidUuid(replyId)) {
      console.warn('[useReplyDelete] 유효하지 않은 replyId:', replyId);
      return;
    }
    setDeleteTargetId(replyId);
    setIsDeleteModalOpen(true);
    setError(null);
  }, []);

  /**
   * 삭제 확인 모달 닫기
   * @description 삭제 확인 모달을 닫고 삭제 대상 ID 초기화
   */
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
    setError(null);
  }, []);

  /**
   * Supabase 삭제 실행
   * @description
   * 1. 유효성 검증 (replyId, 로그인)
   * 2. Supabase에 status를 'deleted'로 update (소프트 삭제)
   * 3. 성공/실패 메시지 표시
   * 
   * @param replyId - 삭제할 답변 ID
   * @returns 삭제 성공 여부 (true: 성공, false: 실패)
   */
  const confirmDelete = useCallback(
    async (replyId: string): Promise<boolean> => {
      console.log('[useReplyDelete] confirmDelete invoked', replyId);
      
      // 유효성 검증: replyId
      if (!replyId || !isValidUuid(replyId)) {
        message.error(ERROR_MESSAGES.INVALID_REPLY_ID);
        setError(ERROR_MESSAGES.INVALID_REPLY_ID);
        return false;
      }

      if (isDeleting) {
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
      console.log('[useReplyDelete] validation passed');

      setIsDeleting(true);

      try {
        // 답변 데이터 update (소프트 삭제: status를 'deleted'로 변경)
        const { data: updatedData, error: updateError } = await supabase
          .from(TABLE_NAME)
          .update({
            status: 'deleted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', replyId)
          .select('id, status, updated_at')
          .single();

        if (updateError) {
          throw updateError;
        }

        if (!updatedData) {
          throw new Error('업데이트된 데이터를 받지 못했습니다.');
        }

        console.log('[useReplyDelete] update succeeded');
        message.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
        
        // 삭제 확인 모달 종료
        setIsDeleteModalOpen(false);
        setDeleteTargetId(null);
        
        // 성공 콜백 호출
        onSuccess?.(replyId);
        return true;
      } catch (error) {
        console.error('답변 삭제 실패:', error);
        message.error(ERROR_MESSAGES.DELETE_FAILED);
        setError(ERROR_MESSAGES.DELETE_FAILED);
        onError?.(error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [checkAuth, isDeleting, onError, onSuccess]
  );

  return {
    isDeleteModalOpen,
    deleteTargetId,
    isDeleting,
    error,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}

