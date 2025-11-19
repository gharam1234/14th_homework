'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePhonesStore, Phone } from '@/commons/stores/phones.store';
import { isTestEnv } from '@/commons/utils/is-test-env';
import { PHONE_RECORDS } from '@/tests/fixtures/supabase';

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

  if ((window as any).__TEST_SUPABASE_USER__) {
    return (window as any).__TEST_SUPABASE_USER__;
  }

  return null;
};

/**
 * 페이징 훅 반환 타입
 */
export interface UsePaginationReturn {
  phones: Phone[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * 로컬스토리지 키
 */
const LOCAL_STORAGE_KEY = 'test_phones_pagination_data';

/**
 * 로컬스토리지에서 테스트 데이터 로드
 */
const loadLocalTestData = (): Phone[] | null => {
  if (typeof window === 'undefined') {
    console.log('🔍 [로컬스토리지] 서버 사이드 렌더링 환경 - 건너뜀');
    return null;
  }
  
  try {
    console.log(`🔍 [로컬스토리지] 키 확인: ${LOCAL_STORAGE_KEY}`);
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!data) {
      console.log('🔍 [로컬스토리지] 데이터 없음 - Supabase 또는 Fixture 사용');
      return null;
    }
    
    const phones = JSON.parse(data);
    console.log(`🔍 [로컬스토리지] ${phones.length}개 데이터 발견!`);
    
    return phones.map((phone: any) => ({
      id: phone.id,
      title: phone.title,
      price: phone.price,
      currency: phone.currency,
      categories: phone.categories,
      sale_state: phone.sale_state,
      available_from: phone.available_from,
      available_until: phone.available_until,
      main_image_url: phone.main_image_url,
      model_name: phone.model_name,
      storage_capacity: phone.storage_capacity,
      device_condition: phone.device_condition,
      address: phone.address,
      tags: phone.tags,
    }));
  } catch (error) {
    console.error('❌ [로컬스토리지] 데이터 로드 실패:', error);
    return null;
  }
};

/**
 * Fixture 데이터를 Phone 타입으로 매핑
 */
const mapFixturesToPhones = (): Phone[] => {
  return PHONE_RECORDS.map((record) => ({
    id: record.id,
    title: record.title,
    price: record.price,
    currency: record.currency,
    categories: record.categories,
    sale_state: record.sale_state,
    available_from: record.available_from,
    available_until: record.available_until,
    main_image_url: record.main_image_url,
    model_name: record.model_name,
    storage_capacity: record.storage_capacity,
    device_condition: record.device_condition,
    address: record.address,
    tags: record.tags,
  }));
};

/**
 * 페이징 기능을 제공하는 커스텀 훅
 * @description Supabase에서 페이징된 데이터를 조회하고 Zustand 스토어로 관리
 * @returns 페이징 상태 및 액션
 */
export const usePagination = (): UsePaginationReturn => {
  const {
    phones,
    currentPage,
    pageSize,
    totalCount,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    setPhones,
    setCurrentPage,
    setPageSize: storeSetPageSize,
    setTotalCount,
    setIsLoading,
    setError,
    goToPage: storeGoToPage,
    nextPage: storeNextPage,
    previousPage: storePreviousPage,
  } = usePhonesStore();

  /**
   * Supabase에서 페이징된 데이터 조회
   */
  const fetchPaginatedPhones = useCallback(async (page: number, size: number) => {
    const shouldFallbackToFixtures = isTestEnv();
    setIsLoading(true);
    setError(null);

    // 🔥 최우선: 로컬스토리지 데이터 확인
    const localData = loadLocalTestData();
    if (localData && localData.length > 0) {
      console.log(`✅ 로컬스토리지에서 ${localData.length}개 데이터 발견! (페이지 ${page})`);
      
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = localData.slice(startIndex, endIndex);

      setPhones(paginatedData);
      setTotalCount(localData.length);
      setCurrentPage(page);
      setIsLoading(false);
      return;
    }

    const hydrateWithFixtures = () => {
      const allFixtures = mapFixturesToPhones();
      
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = allFixtures.slice(startIndex, endIndex);

      setPhones(paginatedData);
      setTotalCount(allFixtures.length);
      setCurrentPage(page);
    };

    if (!supabaseClient) {
      hydrateWithFixtures();
      setIsLoading(false);
      return;
    }

    try {
      // 현재 사용자 정보 조회 (찜 상태 확인용)
      const currentUser = getStoredSessionUser();
      const userId = currentUser?.id;

      // 전체 개수 조회
      const { count } = await supabaseClient
        .from('phones')
        .select('*', { count: 'exact', head: true });

      const totalCount = count || 0;
      setTotalCount(totalCount);

      // 페이징된 데이터 조회
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size - 1;

      const { data, error: supabaseError } = await supabaseClient
        .from('phones')
        .select('id, title, price, currency, categories, sale_state, available_from, available_until, main_image_url, model_name, storage_capacity, device_condition, address, tags')
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (supabaseError) {
        throw supabaseError;
      }

      // 찜 상태 조회 (로그인한 사용자인 경우)
      let favoritePhoneIds: Set<string> = new Set();
      if (userId && data && data.length > 0) {
        const phoneIds = data.map((row: any) => String(row.id));
        const { data: favorites } = await supabaseClient
          .from('phone_reactions')
          .select('phone_id')
          .eq('user_id', userId)
          .eq('type', 'favorite')
          .in('phone_id', phoneIds)
          .is('deleted_at', null);

        if (favorites) {
          favoritePhoneIds = new Set(favorites.map((f: any) => String(f.phone_id)));
        }
      }

      const formattedData: Phone[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        price: row.price,
        currency: row.currency,
        categories: row.categories,
        sale_state: row.sale_state,
        available_from: row.available_from,
        available_until: row.available_until,
        main_image_url: row.main_image_url,
        model_name: row.model_name,
        storage_capacity: row.storage_capacity,
        device_condition: row.device_condition,
        address: row.address,
        tags: row.tags,
        isFavorite: userId ? favoritePhoneIds.has(String(row.id)) : false,
      }));

      if (formattedData.length === 0 && shouldFallbackToFixtures) {
        hydrateWithFixtures();
      } else {
        setPhones(formattedData);
        setCurrentPage(page);
      }
    } catch (err) {
      setError('데이터를 불러올 수 없습니다. 다시 시도해주세요.');
      if (shouldFallbackToFixtures) {
        hydrateWithFixtures();
      }
    } finally {
      setIsLoading(false);
    }
  }, [setPhones, setCurrentPage, setTotalCount, setIsLoading, setError]);

  /**
   * 페이지 이동
   */
  const goToPage = useCallback((page: number) => {
    storeGoToPage(page);
    fetchPaginatedPhones(page, pageSize);
  }, [storeGoToPage, fetchPaginatedPhones, pageSize]);

  /**
   * 다음 페이지
   */
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      const nextPageNumber = currentPage + 1;
      goToPage(nextPageNumber);
    }
  }, [hasNextPage, currentPage, goToPage]);

  /**
   * 이전 페이지
   */
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      const prevPageNumber = currentPage - 1;
      goToPage(prevPageNumber);
    }
  }, [hasPreviousPage, currentPage, goToPage]);

  /**
   * 페이지 크기 변경
   */
  const setPageSize = useCallback((size: number) => {
    storeSetPageSize(size);
    fetchPaginatedPhones(1, size);
  }, [storeSetPageSize, fetchPaginatedPhones]);

  /**
   * 데이터 새로고침
   */
  const refresh = useCallback(() => {
    fetchPaginatedPhones(currentPage, pageSize);
  }, [fetchPaginatedPhones, currentPage, pageSize]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    fetchPaginatedPhones(currentPage, pageSize);
  }, []);

  return {
    phones,
    currentPage,
    pageSize,
    totalCount,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    refresh,
  };
};
