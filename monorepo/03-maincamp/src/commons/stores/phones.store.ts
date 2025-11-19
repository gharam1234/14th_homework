import { create } from 'zustand';

/**
 * Phone 데이터 타입
 */
export interface Phone {
  id: string | number;
  title: string | null;
  price: number | string | null;
  currency: string | null;
  categories: string[] | null;
  sale_state: 'available' | 'reserved' | 'sold' | null;
  available_from: string | null;
  available_until: string | null;
  main_image_url: string | null;
  model_name: string | null;
  storage_capacity: string | null;
  device_condition: string | null;
  address: string | null;
  tags: string[] | null;
  isFavorite?: boolean; // 찜 상태 (phone_reactions 테이블에서 조회)
}

/**
 * 페이징 상태를 관리하는 Zustand 스토어
 */
interface PhonesStore {
  // 상태
  phones: Phone[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // 찜 기능 상태
  favoritePhoneIds: Set<string>;

  // 액션
  setPhones: (phones: Phone[]) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;

  // 찜 기능 액션
  setFavorites: (phoneIds: string[]) => void;
  toggleFavorite: (phoneId: string) => void;
  addFavorite: (phoneId: string) => void;
  removeFavorite: (phoneId: string) => void;
}

/**
 * Zustand 스토어 초기 상태
 */
const initialState = {
  phones: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isLoading: false,
  error: null,
  hasNextPage: false,
  hasPreviousPage: false,
  favoritePhoneIds: new Set<string>(),
};

/**
 * Phones 페이징 스토어
 */
export const usePhonesStore = create<PhonesStore>((set, get) => ({
  ...initialState,

  setPhones: (phones) => set({ phones }),

  setCurrentPage: (page) => {
    const { pageSize, totalCount } = get();
    const totalPages = Math.ceil(totalCount / pageSize);

    set({
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  },

  setPageSize: (size) => {
    const { totalCount } = get();
    const totalPages = Math.ceil(totalCount / size);

    set({
      pageSize: size,
      currentPage: 1,
      hasNextPage: totalPages > 1,
      hasPreviousPage: false,
    });
  },

  setTotalCount: (count) => {
    const { currentPage, pageSize } = get();
    const totalPages = Math.ceil(count / pageSize);

    set({
      totalCount: count,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    });
  },

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  goToPage: (page) => {
    const { pageSize, totalCount } = get();
    const totalPages = Math.ceil(totalCount / pageSize);

    if (page < 1 || page > totalPages) {
      return;
    }

    set({
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  },

  nextPage: () => {
    const { currentPage, hasNextPage } = get();

    if (hasNextPage) {
      get().goToPage(currentPage + 1);
    }
  },

  previousPage: () => {
    const { currentPage, hasPreviousPage } = get();

    if (hasPreviousPage) {
      get().goToPage(currentPage - 1);
    }
  },

  reset: () => set(initialState),

  // 찜 기능 액션 구현
  setFavorites: (phoneIds) => {
    set({ favoritePhoneIds: new Set(phoneIds) });
  },

  toggleFavorite: (phoneId) => {
    const { favoritePhoneIds } = get();
    const newFavorites = new Set(favoritePhoneIds);

    if (newFavorites.has(phoneId)) {
      newFavorites.delete(phoneId);
    } else {
      newFavorites.add(phoneId);
    }

    set({ favoritePhoneIds: newFavorites });
  },

  addFavorite: (phoneId) => {
    const { favoritePhoneIds } = get();
    const newFavorites = new Set(favoritePhoneIds);
    newFavorites.add(phoneId);
    set({ favoritePhoneIds: newFavorites });
  },

  removeFavorite: (phoneId) => {
    const { favoritePhoneIds } = get();
    const newFavorites = new Set(favoritePhoneIds);
    newFavorites.delete(phoneId);
    set({ favoritePhoneIds: newFavorites });
  },
}));
