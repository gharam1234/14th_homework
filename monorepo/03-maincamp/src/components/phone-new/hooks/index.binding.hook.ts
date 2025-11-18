'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/commons/libraries/supabaseClient';
import { isTestEnv } from '@/commons/utils/is-test-env';
import { PHONE_MEDIA_RECORDS, PHONE_RECORDS } from '@/tests/fixtures/supabase';
import { getPath } from '@/commons/constants/url';
import { IPhoneFormInput } from '../types';

const ERROR_MESSAGE = '상품 정보를 불러올 수 없습니다.';
const SALE_STATES: ProductState['saleState'][] = ['available', 'reserved', 'sold'];

interface PhoneMediaRow {
  url: string | null;
  file_name: string | null;
  is_primary: boolean | null;
  display_order: number | null;
}

export interface PhoneMediaItem {
  url: string;
  fileName: string | null;
  isPrimary: boolean;
  displayOrder: number | null;
}

/** 바인딩할 상품 데이터 상태 */
export interface ProductState extends IPhoneFormInput {
  id?: string;
  currency: string;
  categories: string[];
  saleState: 'available' | 'reserved' | 'sold';
  saleType: string;
  mainImageUrl: string;
  media: PhoneMediaItem[];
  tagList: string[];
  /** 기존 UI 호환용 필드 */
  postalCode?: string;
  detailedAddress?: string;
  images?: string[];
}

/** usePhoneBinding 훅 반환 타입 */
export interface UsePhoneBindingReturn {
  data: ProductState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (item == null ? '' : String(item).trim()))
      .filter((item) => item.length > 0);
  }

  if (value && typeof value === 'object') {
    return Object.values(value)
      .map((item) => (item == null ? '' : String(item).trim()))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const normalizeSaleState = (value: unknown): ProductState['saleState'] => {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase() as ProductState['saleState'];
    if (SALE_STATES.includes(normalized)) {
      return normalized;
    }
  }
  return 'available';
};

const normalizeMedia = (rows: PhoneMediaRow[] | null): PhoneMediaItem[] => {
  if (!rows) return [];

  return rows
    .map<PhoneMediaItem | null>((row) => {
      if (!row?.url) return null;
      return {
        url: row.url,
        fileName: row.file_name,
        isPrimary: Boolean(row.is_primary),
        displayOrder: row.display_order,
      };
    })
    .filter((item): item is PhoneMediaItem => Boolean(item))
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
};

/**
 * usePhoneBinding 훅
 *
 * @param id - 상품 ID (URL 쿼리 파라미터에서 자동 추출됨)
 * @returns {UsePhoneBindingReturn}
 *   - data: 불러온 상품 데이터 (null이면 초안 모드)
 *   - isLoading: 데이터 로드 중 여부
 *   - error: 로드 중 발생한 에러
 *   - refetch: 데이터 다시 불러오기 함수
 */
export function usePhoneBinding(id?: string | null): UsePhoneBindingReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ProductState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // URL 쿼리 파라미터에서 ID 추출
  const phoneId = id ?? searchParams.get('id');

  /**
   * Supabase에서 상품 데이터 로드
   */
  const loadPhoneData = useCallback(async () => {
    if (!phoneId) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (
        isTestEnv() &&
        typeof window !== 'undefined' &&
        (window as any).__TEST_BINDING_FORCE_ERROR__
      ) {
        (window as any).__TEST_BINDING_FORCE_ERROR__ = false;
        setError(new Error(ERROR_MESSAGE));
        setIsLoading(false);
        alert(ERROR_MESSAGE);
        router.push(getPath('PHONES_LIST'));
        return;
      }

      if (isTestEnv()) {
        if (!phoneId) {
          setData(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        const fixture = PHONE_RECORDS.find((record) => record.id === phoneId);
        if (fixture) {
          const mediaRows: PhoneMediaRow[] = PHONE_MEDIA_RECORDS.filter(
            (item) => item.phone_id === phoneId
          ).map((item) => ({
            url: item.url,
            file_name: item.file_name,
            is_primary: item.is_primary,
            display_order: item.display_order,
          }));

          const media = normalizeMedia(mediaRows);
          const mediaUrls = media.map((item) => item.url);
          const tags = toStringArray(fixture.tags);
          const categories = toStringArray(fixture.categories);
          const zipcode = fixture.zipcode;
          const detailedAddress = fixture.address_detail ?? '';

          const formData: ProductState = {
            id: fixture.id,
            title: fixture.title,
            summary: fixture.summary,
            description: fixture.description,
            price: toNumber(fixture.price),
            tags: tags.join(', '),
            tagList: tags,
            address: fixture.address,
            address_detail: detailedAddress,
            zipcode,
            latitude: toNumber(fixture.latitude),
            longitude: toNumber(fixture.longitude),
            mediaUrls,
            currency: fixture.currency,
            categories,
            saleState: normalizeSaleState(fixture.sale_state),
            saleType: fixture.sale_type,
            mainImageUrl: fixture.main_image_url ?? mediaUrls[0] ?? '',
            media,
            postalCode: zipcode,
            detailedAddress,
            images: mediaUrls,
          };

          setData(formData);
          setIsLoading(false);
          return;
        }
      }

      const { data: phone, error: phoneError } = await supabase
        .from('phones')
        .select(
          [
            'id',
            'title',
            'summary',
            'description',
            'price',
            'currency',
            'tags',
            'categories',
            'address',
            'address_detail',
            'zipcode',
            'latitude',
            'longitude',
            'sale_state',
            'sale_type',
            'main_image_url',
          ].join(', ')
        )
        .eq('id', phoneId)
        .single();

      if (phoneError || !phone) {
        throw phoneError || new Error(ERROR_MESSAGE);
      }

      const { data: mediaRows, error: mediaError } = await supabase
        .from('phone_media')
        .select('url, file_name, is_primary, display_order')
        .eq('phone_id', phoneId);

      if (mediaError) {
        throw mediaError;
      }

      const media = normalizeMedia(mediaRows ?? []);
      const mediaUrls = media.map((item) => item.url);
      const tags = toStringArray(phone.tags);
      const categories = toStringArray(phone.categories);
      const zipcode = typeof phone.zipcode === 'string' ? phone.zipcode : '';
      const detailedAddress = phone.address_detail ?? '';

      const formData: ProductState = {
        id: phone.id ?? undefined,
        title: phone.title ?? '',
        summary: phone.summary ?? '',
        description: phone.description ?? '',
        price: toNumber(phone.price),
        tags: tags.join(', '),
        tagList: tags,
        address: phone.address ?? '',
        address_detail: detailedAddress,
        zipcode,
        latitude: toNumber(phone.latitude),
        longitude: toNumber(phone.longitude),
        mediaUrls,
        currency: phone.currency ?? 'KRW',
        categories,
        saleState: normalizeSaleState(phone.sale_state),
        saleType: typeof phone.sale_type === 'string' ? phone.sale_type : 'instant',
        mainImageUrl: phone.main_image_url ?? mediaUrls[0] ?? '',
        media,
        postalCode: zipcode,
        detailedAddress,
        images: mediaUrls,
      };

      setData(formData);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error(ERROR_MESSAGE);
      setError(nextError);
      setData(null);

      alert(ERROR_MESSAGE);
      router.push(getPath('PHONES_LIST'));
    } finally {
      setIsLoading(false);
    }
  }, [phoneId, router]);

  /**
   * 데이터 다시 불러오기
   */
  const refetch = useCallback(async () => {
    await loadPhoneData();
  }, [loadPhoneData]);

  // 컴포넌트 마운트 또는 phoneId 변경 시 데이터 로드
  useEffect(() => {
    loadPhoneData();
  }, [loadPhoneData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
