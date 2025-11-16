/**
 * 중고폰 필터 상태 관리 스토어
 * @description Zustand 기반의 전역 필터 상태 관리
 */

import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

type FilterState = {
  // 상태
  availableNow: boolean;
  dateRange: DateRange;
  keyword: string;
};

interface FilterStore extends FilterState {
  // 액션 함수
  setAvailableNow: (value: boolean) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setKeyword: (value: string) => void;
  resetFilters: () => void;
}

const createInitialState = (): FilterState => ({
  availableNow: true,
  dateRange: { startDate: null, endDate: null },
  keyword: '',
});

const fallbackStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const resolveStorage = (): StateStorage => {
  if (typeof window === 'undefined') {
    return fallbackStorage;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('localStorage 접근 중 오류가 발생했습니다. 기본값으로 동작합니다.', error);
    return fallbackStorage;
  }
};

/**
 * Zustand 기반 필터 상태 스토어
 * localStorage에 자동 저장됨
 */
export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      // 초기 상태
      ...createInitialState(),

      // 액션 함수들
      setAvailableNow: (value: boolean) =>
        set({ availableNow: value }),

      setDateRange: (startDate: string | null, endDate: string | null) =>
        set({ dateRange: { startDate, endDate } }),

      setKeyword: (value: string) =>
        set({ keyword: value }),

      resetFilters: () =>
        set(createInitialState()),
    }),
    {
      name: 'phone-filters',
      storage: createJSONStorage(resolveStorage),
    }
  )
);
