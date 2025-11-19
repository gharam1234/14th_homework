'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/commons/libraries/supabaseClient';
import { usePhonesStore } from '@/commons/stores/phones.store';
import { getPath } from '@/commons/constants/url';

// 상수 정의
const REACTIONS_TABLE = 'phone_reactions';
const FAVORITE_TYPE = 'favorite';
const TOAST_AUTO_CLOSE_DELAY = 3000;

// 토스트 메시지
const TOAST_MESSAGES = {
  ADD_SUCCESS: '관심상품에 추가되었습니다.',
  REMOVE_SUCCESS: '관심상품에서 제거되었습니다.',
  ERROR: '관심상품 처리에 실패하였습니다. 다시 시도해주세요.',
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
  type: 'success' | 'error';
  message: string;
}

/**
 * 찜 기능 훅 반환 타입
 */
export interface UseFavoriteReturn {
  /** 찜 처리 중 여부 */
  isLoading: boolean;
  /** 토스트 메시지 */
  toastMessage: ToastMessage | null;
  /** 찜 토글 함수 */
  toggleFavorite: (phoneId: string) => Promise<void>;
  /** 특정 상품이 찜 상태인지 확인 */
  isFavorite: (phoneId: string) => boolean;
  /** 토스트 메시지 닫기 */
  closeToast: () => void;
}

/**
 * 찜(관심상품) 기능 훅
 * 
 * @description
 * - 로그인 여부 체크
 * - 낙관적 업데이트 (UI 즉시 반영)
 * - Supabase phone_reactions 테이블 연동
 * - 토스트 메시지 표시
 * - 실패 시 롤백
 * 
 * @example
 * ```tsx
 * const { toggleFavorite, isFavorite, toastMessage, isLoading } = useFavorite();
 * 
 * <button onClick={() => toggleFavorite(phoneId)}>
 *   {isFavorite(phoneId) ? '❤️' : '🤍'}
 * </button>
 * ```
 */
export function useFavorite(): UseFavoriteReturn {
  const router = useRouter();
  const { favoritePhoneIds, addFavorite, removeFavorite, setFavorites } = usePhonesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  /**
   * 초기 로드 시 사용자의 찜 목록 가져오기
   */
  useEffect(() => {
    const loadFavorites = async () => {
      const user = getStoredSessionUser();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from(REACTIONS_TABLE)
          .select('phone_id')
          .eq('user_id', user.id)
          .eq('type', FAVORITE_TYPE)
          .is('deleted_at', null);

        if (error) {
          console.warn('찜 목록 로드 실패:', error);
          return;
        }

        if (data) {
          const phoneIds = data.map((item) => String(item.phone_id));
          setFavorites(phoneIds);
        }
      } catch (error) {
        console.warn('찜 목록 로드 중 오류:', error);
      }
    };

    loadFavorites();
  }, [setFavorites]);

  /**
   * 토스트 메시지 표시 함수
   * @description 사용자에게 피드백 메시지를 표시하고 일정 시간 후 자동으로 닫힘
   * @param type - 메시지 타입 ('success' | 'error')
   * @param message - 표시할 메시지 내용
   * @returns void
   */
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
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
   * 특정 상품이 찜 상태인지 확인
   * @param phoneId - 확인할 상품 ID
   * @returns 찜 상태 여부 (true: 찜됨, false: 찜 안됨)
   */
  const isFavorite = useCallback(
    (phoneId: string) => {
      return favoritePhoneIds.has(phoneId);
    },
    [favoritePhoneIds]
  );

  /**
   * 찜 토글 함수
   * @description
   * 1. 로그인 여부 확인 (미로그인 시 로그인 페이지로 리다이렉트)
   * 2. 낙관적 업데이트 (UI 즉시 반영)
   * 3. Supabase API 호출 (insert 또는 update)
   * 4. 실패 시 UI 롤백 및 에러 토스트
   * @param phoneId - 찜할 상품 ID
   * @returns Promise<void>
   */
  const toggleFavorite = useCallback(
    async (phoneId: string) => {
      // 1. 로그인 여부 체크
      const user = getStoredSessionUser();
      if (!user) {
        // 미로그인 시 로그인 페이지로 이동
        const loginPath = getPath('LOGIN');
        router.push(loginPath);
        return;
      }

      // 2. 로딩 중이면 중복 요청 방지
      if (isLoading) return;

      setIsLoading(true);

      // 3. 현재 찜 상태 확인
      const currentIsFavorite = favoritePhoneIds.has(phoneId);

      // 4. 낙관적 업데이트 (UI 즉시 반영)
      if (currentIsFavorite) {
        removeFavorite(phoneId);
      } else {
        addFavorite(phoneId);
      }

      try {
        if (currentIsFavorite) {
          // 찜 제거: deleted_at 업데이트
          const { error: deleteError } = await supabase
            .from(REACTIONS_TABLE)
            .update({ deleted_at: new Date().toISOString() })
            .eq('phone_id', phoneId)
            .eq('user_id', user.id)
            .eq('type', FAVORITE_TYPE)
            .is('deleted_at', null);

          if (deleteError) throw deleteError;

          // 성공 토스트
          showToast('success', TOAST_MESSAGES.REMOVE_SUCCESS);
        } else {
          // 찜 추가: insert
          const { error: insertError } = await supabase
            .from(REACTIONS_TABLE)
            .insert({
              phone_id: phoneId,
              user_id: user.id,
              type: FAVORITE_TYPE,
              created_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;

          // 성공 토스트
          showToast('success', TOAST_MESSAGES.ADD_SUCCESS);
        }
      } catch (error) {
        console.error('찜 처리 실패:', error);

        // 5. 실패 시 롤백 (UI 원래대로 복구)
        if (currentIsFavorite) {
          addFavorite(phoneId);
        } else {
          removeFavorite(phoneId);
        }

        // 에러 토스트
        showToast('error', TOAST_MESSAGES.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [
      router,
      favoritePhoneIds,
      addFavorite,
      removeFavorite,
      isLoading,
      showToast,
    ]
  );

  return {
    isLoading,
    toastMessage,
    toggleFavorite,
    isFavorite,
    closeToast,
  };
}

