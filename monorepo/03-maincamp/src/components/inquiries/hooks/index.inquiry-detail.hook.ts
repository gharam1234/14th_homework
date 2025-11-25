'use client';

import { useEffect, useCallback, useState } from 'react';
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
 * @description 최상위 문의와 답변 모두 조회하며, is_answer 필드 포함
 */
interface PhoneInquiryDetailRecord {
  id: string;
  phone_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  is_answer: boolean;
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
 * @description is_answer 필드를 포함하여 변환
 */
const mapRecordToInquiryItem = (record: PhoneInquiryDetailRecord): InquiryItem => {
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
    isAnswer: record.is_answer,
    canEdit: false,
    canDelete: false,
  };
};

/**
 * 문의 상세 데이터 바인딩 Hook 옵션
 */
export interface UseInquiryDetailOptions {
  /** 문의 대상 상품 ID */
  phoneId: string;
}

/**
 * 문의 상세 데이터 바인딩 Hook 반환값
 */
export interface UseInquiryDetailReturn {
  /** 문의 목록 (최상위 문의와 답변 모두 포함, parentId로 구분) */
  inquiries: InquiryItem[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 데이터 새로고침 함수 */
  refetch: () => Promise<void>;
}

/**
 * 문의 상세 데이터 바인딩 Hook
 * @description
 * Supabase phone_inquiries 테이블에서 parent_id가 NULL인 최상위 문의와
 * 각 문의의 답변을 모두 조회하여 반환합니다.
 * 
 * 주요 기능:
 * 1. phone_id로 필터링된 문의 목록 조회
 * 2. parent_id가 NULL인 최상위 문의 조회
 * 3. 각 최상위 문의의 답변 조회 (parent_id가 최상위 문의 ID인 레코드)
 * 4. is_answer 필드 포함하여 답변 여부 확인
 * 5. 날짜를 YYYY.MM.DD 형식으로 변환
 * 6. 로딩 상태 및 에러 처리
 * 
 * @param options - Hook 옵션 객체
 * @param options.phoneId - 문의 대상 상품 ID (UUID)
 * 
 * @returns Hook 반환 객체
 * @returns inquiries - 문의 목록 배열 (최상위 문의와 답변 모두 포함, parentId로 구분)
 * @returns isLoading - 로딩 상태 (true: 로딩 중, false: 완료)
 * @returns error - 에러 메시지 (에러 없으면 null)
 * @returns refetch - 데이터 새로고침 함수
 * 
 * @example
 * ```tsx
 * const { inquiries, isLoading, error, refetch } = useInquiryDetail({
 *   phoneId: 'some-uuid',
 * });
 * 
 * // 최상위 문의만 필터링하여 렌더링
 * {inquiries.filter(item => !item.parentId).map(inquiry => (
 *   <div key={inquiry.id}>
 *     {inquiry.author.name}: {inquiry.content}
 *     {!inquiry.isAnswer && <button>답변 하기</button>}
 *     // 답변 표시
 *     {inquiries.filter(reply => reply.parentId === inquiry.id).map(reply => (
 *       <div key={reply.id}>{reply.content}</div>
 *     ))}
 *   </div>
 * ))}
 * ```
 */
export function useInquiryDetail({
  phoneId,
}: UseInquiryDetailOptions): UseInquiryDetailReturn {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Supabase에서 문의 데이터 조회
   * @description
   * phone_inquiries 테이블에서 phone_id로 필터링하고,
   * parent_id가 NULL인 최상위 문의와 각 문의의 답변을 모두 조회합니다.
   */
  const fetchInquiries = useCallback(async () => {
    if (!phoneId) {
      console.warn('[useInquiryDetail] phoneId가 없습니다.');
      return;
    }

    console.log('[useInquiryDetail] 데이터 조회 시작:', phoneId);
    setIsLoading(true);
    setError(null);

    try {
      // 1. 최상위 문의 조회 (parent_id가 NULL인 문의만)
      const { data: parentData, error: parentError } = await supabase
        .from(TABLE_NAME)
        .select(`
          id,
          phone_id,
          author_id,
          content,
          created_at,
          parent_id,
          is_answer,
          status
        `)
        .eq('phone_id', phoneId)
        .is('parent_id', null) // parent_id가 NULL인 최상위 문의만
        .in('status', ['active', 'edited'])
        .order('created_at', { ascending: true });

      if (parentError) {
        throw parentError;
      }

      console.log('[useInquiryDetail] 최상위 문의 조회 결과:', parentData);
      console.log('[useInquiryDetail] 최상위 문의 개수:', parentData?.length || 0);

      // 최상위 문의가 없는 경우 빈 배열 설정
      if (!parentData || parentData.length === 0) {
        console.warn('[useInquiryDetail] 조회된 최상위 문의가 없습니다.');
        setInquiries([]);
        return;
      }

      // 2. 각 최상위 문의의 답변 조회
      const parentIds = parentData.map((record) => record.id);
      const { data: replyData, error: replyError } = await supabase
        .from(TABLE_NAME)
        .select(`
          id,
          phone_id,
          author_id,
          content,
          created_at,
          parent_id,
          is_answer,
          status
        `)
        .eq('phone_id', phoneId)
        .in('parent_id', parentIds) // parent_id가 최상위 문의 ID 중 하나인 답변들
        .in('status', ['active', 'edited'])
        .order('created_at', { ascending: true });

      if (replyError) {
        throw replyError;
      }

      console.log('[useInquiryDetail] 답변 조회 결과:', replyData);
      console.log('[useInquiryDetail] 답변 개수:', replyData?.length || 0);

      // 3. 최상위 문의와 답변을 모두 InquiryItem으로 변환하여 합치기
      const mappedParentInquiries = parentData.map((record) => 
        mapRecordToInquiryItem(record as PhoneInquiryDetailRecord)
      );

      const mappedReplies = (replyData || []).map((record) => 
        mapRecordToInquiryItem(record as PhoneInquiryDetailRecord)
      );

      // 최상위 문의와 답변을 합쳐서 반환 (컴포넌트에서 parentId로 구분)
      const allInquiries = [...mappedParentInquiries, ...mappedReplies];

      console.log('[useInquiryDetail] 전체 문의/답변 개수:', allInquiries.length);
      setInquiries(allInquiries);
    } catch (error) {
      console.error('[useInquiryDetail] 데이터 조회 실패:', error);
      setError(ERROR_MESSAGES.LOAD_FAILED);
      // 에러 발생 시에도 빈 배열 설정 (빈 상태 메시지 표시용)
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  }, [phoneId]);

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
