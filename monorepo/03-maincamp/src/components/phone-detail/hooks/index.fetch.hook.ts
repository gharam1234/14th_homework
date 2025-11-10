'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/commons/libraries/supabaseClient';
import { PhoneWithSeller, Seller, UseFetchPhoneDetailResult } from '../types';

type RawPhoneDetail = Omit<PhoneWithSeller, 'images_urls' | 'battery_health' | 'hashtags' | 'main_image_url' | 'original_price' | 'bookmark_count' | 'seller'> & {
  images_urls: string[] | null;
  hashtags?: string[] | null;
  main_image_url?: string | null;
  original_price?: number | null;
  battery_health?: number | null;
  bookmark_count?: number | null;
  sellers?: Seller | null;
};

const buildErrorMessage = (message?: string) => message || '중고폰 정보를 불러오는 중 문제가 발생했습니다.';

const mapPhoneRowToEntity = (row: RawPhoneDetail): PhoneWithSeller => {
  const { sellers, ...phoneWithoutSeller } = row;
  const fallbackHashtags = Array.isArray(row.hashtags) ? row.hashtags : [];
  const fallbackImages = Array.isArray(row.images_urls) ? row.images_urls : [];
  const fallbackBattery = typeof row.battery_health === 'number' ? row.battery_health : null;
  const bookmarkCount = typeof row.bookmark_count === 'number' ? row.bookmark_count : 0;

  return {
    ...phoneWithoutSeller,
    description: row.description ?? '',
    hashtags: fallbackHashtags,
    original_price: row.original_price ?? null,
    main_image_url: row.main_image_url ?? null,
    images_urls: fallbackImages,
    battery_health: fallbackBattery,
    bookmark_count: bookmarkCount,
    seller: sellers
      ? {
          id: sellers.id,
          nickname: sellers.nickname,
          location: sellers.location ?? null,
          profile_image_url: sellers.profile_image_url ?? null,
        }
      : null,
  } as PhoneWithSeller;
};

/**
 * 중고폰 상세 정보를 Supabase에서 조회하는 훅
 * @param phoneId - 폰 ID (URL 파라미터에서 가져옴)
 * @returns 폰 데이터, 로딩 상태, 에러 상태
 */
export function useFetchPhoneDetail(phoneId: string): UseFetchPhoneDetailResult {
  const [phone, setPhone] = useState<PhoneWithSeller | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phoneId) {
      setIsLoading(false);
      setError('폰 ID가 없습니다.');
      return;
    }

    let isMounted = true;
    const fetchPhoneDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: phoneData, error: phoneError } = await supabase
          .from('phones')
          .select(
            `
            id,
            model_name,
            title,
            description,
            hashtags,
            condition,
            price,
            original_price,
            main_image_url,
            images_urls,
            battery_health,
            seller_id,
            bookmark_count,
            created_at,
            updated_at,
            sellers (
              id,
              nickname,
              location,
              profile_image_url
            )
          `,
          )
          .eq('id', phoneId)
          .maybeSingle<RawPhoneDetail>();

        if (phoneError) {
          throw new Error(buildErrorMessage(phoneError.message));
        }

        if (!phoneData) {
          throw new Error('요청하신 중고폰 정보를 찾을 수 없습니다.');
        }

        if (isMounted) {
          setPhone(mapPhoneRowToEntity(phoneData));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '중고폰 정보를 불러오지 못했습니다.');
          setPhone(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPhoneDetail();

    // cleanup: 컴포넌트 언마운트 시 요청 상태 유지 방지
    return () => {
      isMounted = false;
    };
  }, [phoneId]);

  return { phone, isLoading, error };
}
