import { useCallback, useState } from 'react';
import { message } from 'antd';
import { supabase } from '@/commons/libraries/supabaseClient';

const REACTIONS_TABLE = 'phone_reactions';
const FAVORITE_TYPE = 'favorite';

/**
 * Supabase 스토리지 키 추출
 */
const getSupabaseStorageKey = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;
  return `sb-${projectRef}-auth-token`;
};

/**
 * Supabase에서 저장된 세션의 사용자 정보를 조회
 * @description 테스트 환경에서 setItem으로 넣어둔 세션 정보를 활용하기 위해 추가
 */
const getStoredSessionUser = () => {
  if (typeof window === 'undefined') return null;
  const storageKey = getSupabaseStorageKey();
  if (!storageKey) return null;

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

  return null;
};

/**
 * 북마크 상태 관리 훅
 * @description 즐겨찾기 토글 기능을 제공합니다.
 * 로그인 검증, Supabase 동기화, 에러 처리를 포함합니다.
 * @param phoneId - 상품 ID
 * @param initialBookmarked - 초기 북마크 상태 (기본값: false)
 * @returns { isBookmarked, toggleBookmark, isLoading }
 */
export function useBookmark(phoneId: string, initialBookmarked = false) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 로그인 상태 확인
   * @returns 로그인된 유저 정보 또는 null
   */
  const checkAuth = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      return session.user;
    }

    return getStoredSessionUser();
  }, []);

  /**
   * 북마크 상태 토글
   * @description
   * 1. 로그인 검증
   * 2. 현재 상태의 반대로 업데이트
   * 3. 성공/실패 메시지 표시
   * 4. 실패 시 이전 상태로 롤백
   */
  const toggleBookmark = useCallback(async () => {
    if (isLoading) return;

    const user = await checkAuth();
    if (!user) {
      message.warning('로그인이 필요합니다.');
      return;
    }

    const previousState = isBookmarked;

    try {
      setIsLoading(true);

      const { data: reaction, error: reactionError } = await supabase
        .from(REACTIONS_TABLE)
        .select('id, deleted_at, metadata')
        .eq('phone_id', phoneId)
        .eq('user_id', user.id)
        .eq('type', FAVORITE_TYPE)
        .limit(1)
        .maybeSingle();

      if (reactionError && (reactionError as { code?: string }).code !== 'PGRST116') {
        throw reactionError;
      }

      const isActive = Boolean(reaction && !reaction.deleted_at);
      const targetState = isActive ? false : true;
      setIsBookmarked(targetState);

      if (isActive && reaction?.id) {
        const { error: deactivateError } = await supabase
          .from(REACTIONS_TABLE)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', reaction.id)
          .eq('phone_id', phoneId)
          .eq('user_id', user.id)
          .eq('type', FAVORITE_TYPE);

        if (deactivateError) {
          throw deactivateError;
        }

        message.success('관심상품에서 제거되었습니다.');
        return;
      }

      const metadata = (reaction?.metadata as Record<string, unknown> | null) ?? {};
      const payload = {
        phone_id: phoneId,
        user_id: user.id,
        type: FAVORITE_TYPE,
        deleted_at: null,
        metadata,
      };

      const { error: upsertError } = await supabase
        .from(REACTIONS_TABLE)
        .upsert(payload, { onConflict: 'phone_id,user_id,type' });

      if (upsertError) {
        throw upsertError;
      }

      message.success('관심상품에 추가되었습니다.');
    } catch (error) {
      setIsBookmarked(previousState);
      message.error('작업에 실패했습니다. 다시 시도해주세요.');
      console.error('북마크 업데이트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, isBookmarked, isLoading, phoneId]);

  return {
    isBookmarked,
    toggleBookmark,
    isLoading,
  };
}
