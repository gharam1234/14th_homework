import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/commons/libraries/supabaseClient';
import { isTestEnv } from '@/commons/utils/is-test-env';
import type { SupabasePhoneRecord } from '@/tests/fixtures/supabase';
import { PHONE_RECORDS } from '@/tests/fixtures/supabase';

/**
 * 중고폰 상세 정보 타입
 */
export interface PhoneDetailData {
  id: string;
  title: string;
  price: number;
  summary: string;
  description: string;
  model_name: string;
  storage_capacity: string;
  device_condition: string;
  address: string | null;
  address_detail: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
  main_image_url: string;
  seller_id: string;
  sale_state: 'available' | 'reserved' | 'sold';
  sale_type: 'immediate' | 'scheduled';
  available_from: string | null;
  available_until: string | null;
  tags: string[];
  categories: string[];
  created_at: string;
}

/**
 * Hook 반환 타입
 */
export interface UseFetchDetailReturn {
  data: PhoneDetailData | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * 중고폰 상세 정보 조회 훅
 * @description phoneId를 이용해 Supabase에서 중고폰 정보를 조회합니다.
 * 로딩, 에러, 재시도 상태를 관리합니다.
 * @param phoneId - 조회할 중고폰 ID
 * @returns { data, isLoading, error, retry }
 */
const SALE_STATES: PhoneDetailData['sale_state'][] = ['available', 'reserved', 'sold'];
const SALE_TYPES: PhoneDetailData['sale_type'][] = ['immediate', 'scheduled'];

const mapFixtureToDetail = (record: SupabasePhoneRecord): PhoneDetailData => ({
  id: record.id,
  title: record.title,
  price: record.price,
  summary: record.summary,
  description: record.description,
  model_name: record.model_name,
  storage_capacity: record.storage_capacity,
  device_condition: record.device_condition,
  address: record.address,
  address_detail: record.address_detail,
  zipcode: record.zipcode,
  latitude: record.latitude ?? null,
  longitude: record.longitude ?? null,
  main_image_url: record.main_image_url ?? '',
  seller_id: record.seller_id,
  sale_state: record.sale_state,
  sale_type: SALE_TYPES.includes(record.sale_type) ? record.sale_type : 'immediate',
  available_from: record.available_from,
  available_until: record.available_until,
  tags: record.tags,
  categories: record.categories,
  created_at: record.created_at,
});

export function useFetchDetail(phoneId: string | null | undefined): UseFetchDetailReturn {
  const [data, setData] = useState<PhoneDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  /**
   * 중고폰 상세 정보 조회 함수
   */
  const fetchPhoneDetail = useCallback(async () => {
    if (!phoneId) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isTestEnv()) {
        const fallback = PHONE_RECORDS.find((record) => record.id === phoneId);
        if (fallback) {
          setData(mapFixtureToDetail(fallback));
          setIsLoading(false);
          return;
        }
      }

      const { data: phoneData, error: fetchError } = await supabase
        .from('phones')
        .select('*')
        .eq('id', phoneId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!phoneData) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const normalizedData: PhoneDetailData = {
        id: phoneData.id,
        title: phoneData.title ?? '',
        price: typeof phoneData.price === 'number' ? phoneData.price : Number(phoneData.price ?? 0),
        summary: phoneData.summary ?? '',
        description: phoneData.description ?? '',
        model_name: phoneData.model_name ?? '',
        storage_capacity: phoneData.storage_capacity ?? '',
        device_condition: phoneData.device_condition ?? '',
        address: phoneData.address ?? null,
        address_detail: phoneData.address_detail ?? null,
        zipcode: phoneData.zipcode ?? null,
        latitude: typeof phoneData.latitude === 'number' ? phoneData.latitude : null,
        longitude: typeof phoneData.longitude === 'number' ? phoneData.longitude : null,
        main_image_url: phoneData.main_image_url ?? '',
        seller_id: phoneData.seller_id ?? '',
        sale_state: SALE_STATES.includes(phoneData.sale_state)
          ? phoneData.sale_state
          : 'available',
        sale_type: SALE_TYPES.includes(phoneData.sale_type)
          ? phoneData.sale_type
          : 'immediate',
        available_from: phoneData.available_from ?? null,
        available_until: phoneData.available_until ?? null,
        tags: Array.isArray(phoneData.tags) ? phoneData.tags : [],
        categories: Array.isArray(phoneData.categories) ? phoneData.categories : [],
        created_at: phoneData.created_at ?? '',
      };

      setData(normalizedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [phoneId]);

  /**
   * 재시도 함수
   */
  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  /**
   * phoneId가 변경되거나 재시도 시 데이터 조회
   */
  useEffect(() => {
    fetchPhoneDetail();
  }, [fetchPhoneDetail, retryCount]);

  return {
    data,
    isLoading,
    error,
    retry,
  };
}
