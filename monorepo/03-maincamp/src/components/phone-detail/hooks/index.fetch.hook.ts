'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/commons/libraries/supabaseClient';
import { PhoneWithSeller, UseFetchPhoneDetailResult } from '../types';

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

        // phones 테이블에서 seller_id를 통해 sellers 테이블과 JOIN
        const { data: phoneData, error: phoneError } = await supabase
          .from('phones')
          .select('*')
          .eq('id', phoneId)
          .single();

        if (phoneError) {
          throw new Error(phoneError.message);
        }

        if (!phoneData) {
          throw new Error('폰 정보를 찾을 수 없습니다.');
        }

        // sellers 테이블에서 판매자 정보 조회
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('id', phoneData.seller_id)
          .single();

        if (sellerError) {
          throw new Error(`판매자 정보 조회 실패: ${sellerError.message}`);
        }

        if (!sellerData) {
          throw new Error('판매자 정보를 찾을 수 없습니다.');
        }

        if (isMounted) {
          setPhone({
            ...phoneData,
            seller: sellerData,
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
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
