'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/commons/libraries/supabaseClient';

// 상수 정의
const REACTIONS_TABLE = 'phone_reactions';
const FAVORITE_TYPE = 'favorite';
const TOAST_AUTO_CLOSE_DELAY = 3000;

// 토스트 메시지
const TOAST_MESSAGES = {
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  ADD_SUCCESS: '관심상품에 추가되었습니다.',
  REMOVE_SUCCESS: '관심상품에서 제거되었습니다.',
  ERROR: '작업에 실패했습니다. 다시 시도해주세요.',
} as const;

/**
 * Supabase 세션에서 사용자 ID 추출
 * @description localStorage에서 Supabase 세션 정보를 조회하여 사용자 정보를 반환
 * @returns 사용자 정보 객체 또는 null
 */
const getStoredSessionUser = () => {
  if (typeof window === 'undefined') return null;

  // Supabase 스토리지 키 생성
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;

  const storageKey = `sb-${projectRef}-auth-token`;
  const rawSession = window.localStorage.getItem(storageKey);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    if (parsed?.currentSession?.user) {
      return parsed.currentSession.user;
    }
    if (parsed?.user) {
      return parsed.user;
    }
  } catch (error) {
    console.warn('세션 정보 파싱 실패:', error);
  }

  // 테스트 환경 지원
  if ((window as any).__TEST_SUPABASE_USER__) {
    return (window as any).__TEST_SUPABASE_USER__;
  }

  return null;
};

/**
 * 토스트 메시지 타입
 */
export interface ToastMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
}

/**
 * 북마크 훅 반환 타입
 */
export interface UseBookmarkReturn {
  /** 북마크 상태 */
  isBookmarked: boolean;
  /** 북마크 처리 중 여부 */
  isLoading: boolean;
  /** 토스트 메시지 */
  toastMessage: ToastMessage | null;
  /** 북마크 토글 함수 */
  toggleBookmark: () => Promise<void>;
  /** 토스트 메시지 닫기 */
  closeToast: () => void;
}

/**
 * 북마크(즐겨찾기) 기능 훅
 * 
 * @description
 * - 로그인 여부 체크 (Supabase Auth session/user 정보)
 * - Supabase phone_reactions 테이블 연동
 * - 토글 로직: insert/update (deleted_at)
 * - 토스트 메시지 표시
 * - 낙관적 업데이트 및 에러 시 롤백
 * 
 * @param phoneId - 상품 ID
 * @param initialBookmarked - 초기 북마크 상태 (기본값: false)
 * @returns UseBookmarkReturn
 * 
 * @example
 * ```tsx
 * const { isBookmarked, toggleBookmark, toastMessage } = useBookmark('phone-123');
 * 
 * <button onClick={toggleBookmark}>
 *   {isBookmarked ? '❤️' : '🤍'}
 * </button>
 * ```
 */
export function useBookmark(
  phoneId: string | undefined,
  initialBookmarked = false
): UseBookmarkReturn {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  /**
   * 초기 로드 시 북마크 상태 조회
   */
  useEffect(() => {
    if (!phoneId) return;

    const loadBookmarkStatus = async () => {
      const user = getStoredSessionUser();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from(REACTIONS_TABLE)
          .select('id, deleted_at')
          .eq('phone_id', phoneId)
          .eq('user_id', user.id)
          .eq('type', FAVORITE_TYPE)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.warn('북마크 상태 조회 실패:', error);
          return;
        }

        // 데이터가 존재하고 deleted_at이 null이면 북마크된 상태
        if (data && !data.deleted_at) {
          setIsBookmarked(true);
        } else {
          setIsBookmarked(false);
        }
      } catch (error) {
        console.warn('북마크 상태 조회 중 오류:', error);
      }
    };

    loadBookmarkStatus();
  }, [phoneId]);

  /**
   * 토스트 메시지 표시 함수
   * @param type - 메시지 타입 ('success' | 'error' | 'warning')
   * @param message - 표시할 메시지 내용
   */
  const showToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setToastMessage({ type, message });

    // 자동으로 토스트 닫기
    setTimeout(() => {
      setToastMessage(null);
    }, TOAST_AUTO_CLOSE_DELAY);
  }, []);

  /**
   * 토스트 메시지 닫기
   */
  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  /**
   * 북마크 토글 함수
   * @description
   * 1. 로그인 여부 확인 (미로그인 시 경고 토스트)
   * 2. 낙관적 업데이트 (UI 즉시 반영)
   * 3. Supabase API 호출 (insert 또는 update)
   * 4. 실패 시 UI 롤백 및 에러 토스트
   */
  const toggleBookmark = useCallback(async () => {
    if (!phoneId) return;

    // 1. 로그인 여부 체크
    const user = getStoredSessionUser();
    if (!user) {
      // 미로그인 시 경고 토스트
      showToast('warning', TOAST_MESSAGES.LOGIN_REQUIRED);
      return;
    }

    // 2. 로딩 중이면 중복 요청 방지
    if (isLoading) return;

    setIsLoading(true);

    // 3. 현재 북마크 상태 저장 (롤백용)
    const previousBookmarked = isBookmarked;

    // 4. 낙관적 업데이트 (UI 즉시 반영)
    setIsBookmarked(!isBookmarked);

    try {
      if (isBookmarked) {
        // 북마크 제거: deleted_at 업데이트
        const { error: updateError } = await supabase
          .from(REACTIONS_TABLE)
          .update({ 
            deleted_at: new Date().toISOString(),
            metadata: { updated_by: 'bookmark_hook' }
          })
          .eq('phone_id', phoneId)
          .eq('user_id', user.id)
          .eq('type', FAVORITE_TYPE)
          .is('deleted_at', null);

        if (updateError) throw updateError;

        // 성공 토스트
        showToast('success', TOAST_MESSAGES.REMOVE_SUCCESS);
      } else {
        // 기존 레코드 확인
        const { data: existingData, error: selectError } = await supabase
          .from(REACTIONS_TABLE)
          .select('id, deleted_at')
          .eq('phone_id', phoneId)
          .eq('user_id', user.id)
          .eq('type', FAVORITE_TYPE)
          .maybeSingle();

        if (selectError && selectError.code !== 'PGRST116') {
          throw selectError;
        }

        if (existingData) {
          // 기존 레코드가 있으면 deleted_at을 null로 업데이트
          const { error: updateError } = await supabase
            .from(REACTIONS_TABLE)
            .update({ 
              deleted_at: null,
              metadata: { updated_by: 'bookmark_hook' }
            })
            .eq('id', existingData.id);

          if (updateError) throw updateError;
        } else {
          // 기존 레코드가 없으면 새로 생성
          const { error: insertError } = await supabase
            .from(REACTIONS_TABLE)
            .insert({
              phone_id: phoneId,
              user_id: user.id,
              type: FAVORITE_TYPE,
              deleted_at: null,
              metadata: { created_by: 'bookmark_hook' },
              created_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // 성공 토스트
        showToast('success', TOAST_MESSAGES.ADD_SUCCESS);
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);

      // 5. 실패 시 롤백 (UI 원래대로 복구)
      setIsBookmarked(previousBookmarked);

      // 에러 토스트
      showToast('error', TOAST_MESSAGES.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [phoneId, isBookmarked, isLoading, showToast]);

  return {
    isBookmarked,
    isLoading,
    toastMessage,
    toggleBookmark,
    closeToast,
  };
}
