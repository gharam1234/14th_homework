import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseBookmarkHookOptions {
  phoneId?: string;
  userId?: string;
  /** SSR 대비 초기 즐겨찾기 상태 */
  initialIsBookmarked?: boolean;
  /** 서버에서 내려온 초기 즐겨찾기 수 */
  initialBookmarkCount?: number;
  /** 테스트 및 스토리북 편의를 위한 로딩 시뮬레이션 딜레이 */
  mockDelayMs?: number;
}

interface UseBookmarkHookResult {
  isBookmarked: boolean;
  bookmarkCount: number;
  isLoading: boolean;
  error: string | null;
  toggleBookmark: () => Promise<void>;
}

const DEFAULT_DELAY_MS = 350;

/**
 * 중고폰 상세 페이지의 북마크 상태를 관리하는 커스텀 훅.
 * 실제 API 연동 전까지는 낙관적 업데이트 방식으로 동작한다.
 */
export function useBookmarkHook({
  phoneId = '',
  userId = '',
  initialIsBookmarked = false,
  initialBookmarkCount = 0,
  mockDelayMs = DEFAULT_DELAY_MS,
}: UseBookmarkHookOptions = {}): UseBookmarkHookResult {
  const sanitizedInitialCount = useMemo(() => Math.max(0, initialBookmarkCount), [initialBookmarkCount]);

  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(sanitizedInitialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
    setBookmarkCount(sanitizedInitialCount);
    setError(null);
  }, [initialIsBookmarked, sanitizedInitialCount, phoneId]);

  const toggleBookmark = useCallback(async () => {
    if (!phoneId) {
      setError('상품 정보를 찾을 수 없어 북마크를 변경할 수 없습니다.');
      return;
    }

    if (!userId) {
      setError('로그인 후 이용 가능한 기능입니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, mockDelayMs));

      setIsBookmarked(prev => {
        const next = !prev;
        setBookmarkCount(prevCount => Math.max(0, prevCount + (next ? 1 : -1)));
        return next;
      });
    } catch {
      setError('북마크 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [mockDelayMs, phoneId, userId]);

  return {
    isBookmarked,
    bookmarkCount,
    isLoading,
    error,
    toggleBookmark,
  };
}
