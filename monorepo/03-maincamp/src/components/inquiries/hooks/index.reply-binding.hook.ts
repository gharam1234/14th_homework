'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/commons/libraries/supabaseClient';
import { InquiryItem, UserProfile } from '../types';

// 상수 정의
const TABLE_NAME = 'phone_inquiries';
const DEFAULT_USERNAME = '알 수 없음';

const ERROR_MESSAGES = {
  LOAD_FAILED: '문의 목록을 불러오는데 실패했습니다.',
} as const;

/**
 * Supabase phone_inquiries 테이블 응답 타입
 */
interface PhoneInquiryRecord {
  id: string;
  phone_id: string;
  parent_id: string | null;
  thread_path: string;
  author_id: string;
  content: string;
  is_answer: boolean;
  status: string;
  created_at: string;
  updated_at: string;
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
 * @param currentUserId - 현재 로그인한 사용자 ID
 * @returns InquiryItem 객체
 */
const mapRecordToInquiryItem = (
  record: PhoneInquiryRecord,
  currentUserId?: string
): InquiryItem => {
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
      role: record.is_answer ? 'seller' : 'user',
    },
    content: record.content,
    createdAt: formatDateToYYYYMMDD(record.created_at),
    parentId: record.parent_id ?? undefined,
    canEdit: currentUserId === record.author_id,
    canDelete: currentUserId === record.author_id,
    updatedAt: record.updated_at ? formatDateToYYYYMMDD(record.updated_at) : undefined,
  };
};

/**
 * 문의 데이터 바인딩 Hook 옵션
 */
export interface UseReplyBindingOptions {
  /** 문의 대상 상품 ID */
  phoneId: string;
  /** 현재 로그인한 사용자 ID (선택) */
  currentUserId?: string;
}

/**
 * 문의 데이터 바인딩 Hook 반환값
 */
export interface UseReplyBindingReturn {
  /** 문의 목록 */
  data: InquiryItem[];
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 데이터 새로고침 함수 */
  refetch: () => Promise<void>;
}

/**
 * 답변 바인딩 Hook
 * @description
 * Supabase phone_inquiries 테이블에서 특정 상품의 모든 문의/답변을 조회합니다.
 * thread_path 기준으로 정렬하여 트리 구조를 유지합니다.
 * 
 * 주요 기능:
 * 1. phone_id로 필터링된 문의/답변 목록 조회
 * 2. thread_path 기준 오름차순 정렬 (트리 구조 유지)
 * 3. parent_id 기반 계층 구조 데이터
 * 4. 날짜를 YYYY.MM.DD 형식으로 변환
 * 5. is_answer 필드로 판매자 답변 구분
 * 6. 로딩 상태 및 에러 처리
 * 
 * @param options - Hook 옵션 객체
 * @param options.phoneId - 문의 대상 상품 ID (UUID)
 * @param options.currentUserId - 현재 로그인한 사용자 ID (canEdit/canDelete 판단용)
 * 
 * @returns Hook 반환 객체
 * @returns data - 문의/답변 목록 배열
 * @returns loading - 로딩 상태 (true: 로딩 중, false: 완료)
 * @returns error - 에러 메시지 (에러 없으면 null)
 * @returns refetch - 데이터 새로고침 함수
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useReplyBinding({
 *   phoneId: 'some-uuid',
 *   currentUserId: 'user-uuid',
 * });
 * 
 * if (loading) return <div>로딩 중...</div>;
 * if (error) return <div>{error}</div>;
 * if (data.length === 0) return <div>문의가 없습니다.</div>;
 * 
 * return (
 *   <>
 *     {data.map(inquiry => (
 *       <div key={inquiry.id}>
 *         {inquiry.author.name}: {inquiry.content}
 *       </div>
 *     ))}
 *   </>
 * );
 * ```
 */
export function useReplyBinding({
  phoneId,
  currentUserId,
}: UseReplyBindingOptions): UseReplyBindingReturn {
  // 상태는 Hook 로컬 상태로 관리 (의존성 단순화)
  const [data, setData] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Supabase에서 문의 데이터 조회
   */
  const fetchReplies = useCallback(async () => {
    if (!phoneId) {
      console.warn('[useReplyBinding] phoneId가 없습니다.');
      return;
    }

    console.log('[useReplyBinding] 데이터 조회 시작:', phoneId);
    setLoading(true);
    setError(null);

    try {
      // Supabase 쿼리: phone_inquiries 조회
      const { data: queryData, error: queryError } = await supabase
        .from(TABLE_NAME)
        .select(`
          id,
          phone_id,
          parent_id,
          thread_path,
          author_id,
          content,
          is_answer,
          status,
          created_at,
          updated_at
        `)
        .eq('phone_id', phoneId)
        .eq('status', 'active')
        .order('thread_path', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      console.log('[useReplyBinding] 조회 결과:', queryData);
      console.log('[useReplyBinding] 조회 결과 개수:', queryData?.length || 0);

      // 데이터가 없는 경우 빈 배열 설정
      if (!queryData || queryData.length === 0) {
        console.warn('[useReplyBinding] 조회된 데이터가 없습니다.');
        setData([]);
        return;
      }

      // Supabase 레코드를 InquiryItem 타입으로 변환
      const mappedReplies = queryData.map((record) =>
        mapRecordToInquiryItem(record as PhoneInquiryRecord, currentUserId)
      );

      setData(mappedReplies);
    } catch (err) {
      console.error('[useReplyBinding] 데이터 조회 실패:', err);
      setError(ERROR_MESSAGES.LOAD_FAILED);
      // 에러 발생 시에도 빈 배열 설정 (빈 상태 메시지 표시용)
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [phoneId, currentUserId]);

  /**
   * 컴포넌트 마운트 시 데이터 조회
   */
  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  return {
    data,
    loading,
    error,
    refetch: fetchReplies,
  };
}
