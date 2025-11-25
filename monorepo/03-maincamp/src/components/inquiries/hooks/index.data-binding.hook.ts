'use client';

import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { supabase } from '@/commons/libraries/supabaseClient';
import { InquiryItem } from '../types';

// 상수 정의
const TABLE_NAME = 'phone_inquiries';
const DEFAULT_USERNAME = '알 수 없음';

const ERROR_MESSAGES = {
  LOAD_FAILED: '문의 목록을 불러오는데 실패했습니다.',
} as const;

/**
 * Supabase phone_inquiries 테이블 응답 타입
 * @description profiles 테이블이 없어 JOIN 불가, author 정보는 기본값 사용
 */
interface PhoneInquiryRecord {
  id: string;
  phone_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  status: string;
  link_title?: string | null;
  link_url?: string | null;
  author?: {
    id?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

/**
 * 문의 데이터 Zustand 스토어 타입
 */
interface InquiriesStore {
  /** 문의 목록 */
  inquiries: InquiryItem[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  
  /** 액션: 문의 목록 설정 */
  setInquiries: (inquiries: InquiryItem[]) => void;
  /** 액션: 로딩 상태 설정 */
  setIsLoading: (isLoading: boolean) => void;
  /** 액션: 에러 설정 */
  setError: (error: string | null) => void;
  /** 액션: 초기화 */
  reset: () => void;
}

/**
 * 문의 데이터 Zustand 스토어
 * @description phone_inquiries 테이블의 데이터를 관리하는 전역 상태 스토어
 */
export const useInquiriesStore = create<InquiriesStore>((set) => ({
  inquiries: [],
  isLoading: false,
  error: null,
  
  setInquiries: (inquiries) => set({ inquiries }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ inquiries: [], isLoading: false, error: null }),
}));

/**
 * 날짜를 YYYY.MM.DD 형식으로 변환
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns YYYY.MM.DD 형식의 날짜 문자열
 * @description UTC 시간을 그대로 사용하여 타임존 이슈를 방지합니다.
 */
const formatDateToYYYYMMDD = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // UTC 날짜를 사용하여 타임존 이슈 방지
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('날짜 포맷팅 실패:', error);
    return '';
  }
};

/**
 * Supabase 레코드를 InquiryItem 타입으로 변환
 * @param record - Supabase phone_inquiries 레코드
 * @returns InquiryItem 객체
 * @description profiles 테이블이 없어 기본값만 사용
 */
const mapRecordToInquiryItem = (record: PhoneInquiryRecord): InquiryItem => {
  const authorProfile = record.author;
  const authorName =
    record.link_title?.trim() ||
    authorProfile?.username?.trim() ||
    DEFAULT_USERNAME;
  const authorId = authorProfile?.id || record.author_id;
  const authorAvatar = authorProfile?.avatar_url || undefined;
  const derivedId = record.link_url?.trim() || record.id;

  return {
    id: derivedId,
    author: {
      id: authorId,
      name: authorName,
      avatar: authorAvatar,
    },
    content: record.content,
    createdAt: formatDateToYYYYMMDD(record.created_at),
    parentId: record.parent_id ?? undefined,
    canEdit: false,
    canDelete: false,
  };
};

/**
 * 문의 데이터 바인딩 Hook 옵션
 */
export interface UseInquiryDataBindingOptions {
  /** 문의 대상 상품 ID */
  phoneId: string;
}

/**
 * 문의 데이터 바인딩 Hook 반환값
 */
export interface UseInquiryDataBindingReturn {
  /** 문의 목록 */
  inquiries: InquiryItem[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 데이터 새로고침 함수 */
  refetch: () => Promise<void>;
}

/**
 * 문의 데이터 바인딩 Hook
 * @description
 * Supabase phone_inquiries 테이블에서 데이터를 조회하고,
 * profiles 테이블과 JOIN하여 작성자 정보를 포함한 문의 목록을 반환합니다.
 * 
 * 주요 기능:
 * 1. phone_id로 필터링된 문의 목록 조회
 * 2. profiles 테이블과 JOIN하여 작성자 프로필 정보 포함
 * 3. 날짜를 YYYY.MM.DD 형식으로 변환
 * 4. Zustand 스토어를 통한 상태 관리
 * 5. 로딩 상태 및 에러 처리
 * 
 * @param options - Hook 옵션 객체
 * @param options.phoneId - 문의 대상 상품 ID (UUID)
 * 
 * @returns Hook 반환 객체
 * @returns inquiries - 문의 목록 배열
 * @returns isLoading - 로딩 상태 (true: 로딩 중, false: 완료)
 * @returns error - 에러 메시지 (에러 없으면 null)
 * @returns refetch - 데이터 새로고침 함수
 * 
 * @example
 * ```tsx
 * const { inquiries, isLoading, error, refetch } = useInquiryDataBinding({
 *   phoneId: 'some-uuid',
 * });
 * 
 * // 문의 목록 렌더링
 * {inquiries.map(inquiry => (
 *   <div key={inquiry.id}>
 *     {inquiry.author.name}: {inquiry.content}
 *   </div>
 * ))}
 * ```
 */
export function useInquiryDataBinding({
  phoneId,
}: UseInquiryDataBindingOptions): UseInquiryDataBindingReturn {
  // Zustand 스토어에서 상태 가져오기
  const inquiries = useInquiriesStore((state) => state.inquiries);
  const isLoading = useInquiriesStore((state) => state.isLoading);
  const error = useInquiriesStore((state) => state.error);
  const setInquiries = useInquiriesStore((state) => state.setInquiries);
  const setIsLoading = useInquiriesStore((state) => state.setIsLoading);
  const setError = useInquiriesStore((state) => state.setError);

  /**
   * Supabase에서 문의 데이터 조회
   * @description
   * phone_inquiries 테이블에서 phone_id로 필터링하고,
   * profiles 테이블과 JOIN하여 작성자 정보를 가져옵니다.
   */
  const fetchInquiries = useCallback(async () => {
    if (!phoneId) {
      console.warn('[useInquiryDataBinding] phoneId가 없습니다.');
      return;
    }

    console.log('[useInquiryDataBinding] 데이터 조회 시작:', phoneId);
    setIsLoading(true);
    setError(null);

    try {
      // Supabase 쿼리: phone_inquiries 조회 (profiles 테이블 없음)
      const { data, error: queryError } = await supabase
        .from(TABLE_NAME)
        .select(`
          id,
          phone_id,
          author_id,
          content,
          created_at,
          parent_id,
          status
        `)
        .eq('phone_id', phoneId)
        .in('status', ['active', 'edited'])
        .order('thread_path', { ascending: true })
        .order('created_at', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      console.log('[useInquiryDataBinding] 조회 결과:', data);
      console.log('[useInquiryDataBinding] 조회 결과 개수:', data?.length || 0);

      // 데이터가 없는 경우 빈 배열 설정
      if (!data || data.length === 0) {
        console.warn('[useInquiryDataBinding] 조회된 데이터가 없습니다.');
        setInquiries([]);
        return;
      }

      // Supabase 레코드를 InquiryItem 타입으로 변환
      const mappedInquiries = data.map((record) => 
        mapRecordToInquiryItem(record as PhoneInquiryRecord)
      );

      setInquiries(mappedInquiries);
    } catch (error) {
      console.error('[useInquiryDataBinding] 데이터 조회 실패:', error);
      setError(ERROR_MESSAGES.LOAD_FAILED);
      // 에러 발생 시에도 빈 배열 설정 (빈 상태 메시지 표시용)
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  }, [phoneId, setInquiries, setIsLoading, setError]);

  /**
   * 컴포넌트 마운트 시 데이터 조회
   */
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return {
    inquiries,
    isLoading,
    error,
    refetch: fetchInquiries,
  };
}
