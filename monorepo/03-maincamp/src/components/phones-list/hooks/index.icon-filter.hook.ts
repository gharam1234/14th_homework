'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { isTestEnv } from '@/commons/utils/is-test-env';
import { PHONE_RECORDS } from '@/tests/fixtures/supabase';

/**
 * 필터링된 휴대폰 데이터 타입
 */
export interface Phone {
  id: string | number;
  title: string | null;
  price: number | string | null;
  categories: string[] | null;
  sale_state: 'available' | 'reserved' | 'sold' | null;
  available_from: string | null;
  available_until: string | null;
  main_image_url: string | null;
}

/**
 * useIconFilter 훅 반환 타입
 */
export interface UseIconFilterReturn {
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
  phonesList: Phone[];
  toggleCategory: (category: string) => void;
}

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const FILTER_ERROR_MESSAGE = '필터를 불러올 수 없습니다.';

/**
 * 아이콘 필터링 기능을 제공하는 커스텀 훅
 * @description 선택된 카테고리에 따라 휴대폰 데이터를 필터링하여 API에서 조회
 * @returns 선택된 카테고리, 로딩 상태, 에러, 필터링된 휴대폰 목록, 토글 함수
 */
export const useIconFilter = (): UseIconFilterReturn => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phonesList, setPhonesList] = useState<Phone[]>([]);

  /**
   * Supabase에서 필터링된 휴대폰 데이터 조회
   */
  const fetchFilteredPhones = useCallback(async (category: string | null) => {
    setIsLoading(true);
    setError(null);

    if (isTestEnv()) {
      const fixtures = PHONE_RECORDS.map<Phone>((record) => ({
        id: record.id,
        title: record.title,
        price: record.price,
        categories: record.categories,
        sale_state: record.sale_state,
        available_from: record.available_from,
        available_until: record.available_until,
        main_image_url: record.main_image_url,
      }));

      const filtered = category
        ? fixtures.filter((item) => item.categories?.includes(category))
        : fixtures;

      setPhonesList(filtered);
      setIsLoading(false);
      return;
    }

    if (!supabaseClient) {
      setError(FILTER_ERROR_MESSAGE);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabaseClient
        .from('phones')
        .select('id, title, price, categories, sale_state, available_from, available_until, main_image_url')
        .order('id', { ascending: false });

      // 카테고리가 선택된 경우, categories 필드에서 해당 값 필터링
      if (category) {
        // Supabase의 JSON 배열 필터링
        // categories가 배열이고, 해당 카테고리를 포함하는 레코드만 선택
        query = query.filter('categories', 'cs', `["${category}"]`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      // 응답 데이터 처리
      const formattedData = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        price: row.price,
        categories: row.categories,
        sale_state: row.sale_state,
        available_from: row.available_from,
        available_until: row.available_until,
        main_image_url: row.main_image_url,
      }));

      setPhonesList(formattedData);
    } catch (err) {
      setError(FILTER_ERROR_MESSAGE);
      // 에러 발생 후에도 이전 phonesList는 유지
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 선택된 카테고리 변경 시 API 호출
   */
  useEffect(() => {
    fetchFilteredPhones(selectedCategory);
  }, [selectedCategory, fetchFilteredPhones]);

  /**
   * 카테고리 토글 함수
   * - 같은 카테고리 재클릭 시: selectedCategory = null로 설정
   * - 다른 카테고리 클릭 시: selectedCategory = category로 설정
   */
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }, []);

  return {
    selectedCategory,
    isLoading,
    error,
    phonesList,
    toggleCategory,
  };
};
