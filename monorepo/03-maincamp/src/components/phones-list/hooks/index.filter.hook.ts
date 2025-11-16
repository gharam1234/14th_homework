/**
 * 중고폰 필터 관리 hook
 * @description 필터 상태 관리 및 검증 로직을 제공합니다.
 */

'use client';

import { useFilterStore } from '@/stores/filterStore';

interface UsePhoneFiltersReturn {
  availableNow: boolean;
  dateRange: { startDate: string | null; endDate: string | null };
  keyword: string;
  setAvailableNow: (value: boolean) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setKeyword: (value: string) => void;
  resetFilters: () => void;
  isSearchEnabled: boolean;
}

/**
 * 중고폰 필터 관리 hook
 * @returns 필터 상태 및 액션 함수
 */
export const usePhoneFilters = (): UsePhoneFiltersReturn => {
  const availableNow = useFilterStore((state) => state.availableNow);
  const dateRange = useFilterStore((state) => state.dateRange);
  const keyword = useFilterStore((state) => state.keyword);
  const setAvailableNow = useFilterStore((state) => state.setAvailableNow);
  const setDateRange = useFilterStore((state) => state.setDateRange);
  const setKeyword = useFilterStore((state) => state.setKeyword);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  // 검색 활성화 조건: 키워드 2자 이상
  const isSearchEnabled = keyword.trim().length >= 2;

  return {
    availableNow,
    dateRange,
    keyword,
    setAvailableNow,
    setDateRange,
    setKeyword,
    resetFilters,
    isSearchEnabled,
  };
};
