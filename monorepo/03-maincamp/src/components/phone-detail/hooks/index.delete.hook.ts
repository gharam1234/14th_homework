'use client';

import { useCallback, useState } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { supabase } from '@/commons/libraries/supabaseClient';

/**
 * 삭제 기능 훅
 * @description 중고폰 상품 삭제 기능을 제공합니다.
 * 삭제 모달 표시, Supabase 동기화, 에러 처리를 포함합니다.
 * @param phoneId - 삭제할 상품 ID
 * @returns { isDeleting, deletePhone, showDeleteModal, hideDeleteModal, isModalOpen }
 */
export function useDelete(phoneId: string) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  /**
   * 삭제 모달 표시
   */
  const showDeleteModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  /**
   * 삭제 모달 닫기
   */
  const hideDeleteModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * 삭제 실행
   * @description
   * 1. 삭제 확인 모달 표시
   * 2. Supabase phones 테이블에서 삭제
   * 3. 성공 메시지 표시
   * 4. /phones 페이지로 이동
   * 5. 실패 시 에러 메시지 표시
   */
  const deletePhone = useCallback(async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // Supabase에서 상품 삭제
      const { error } = await supabase
        .from('phones')
        .delete()
        .eq('id', phoneId);

      if (error) {
        throw error;
      }

      // 성공 메시지 표시
      message.success('판매 글이 삭제되었습니다.');

      // 모달 닫기
      setIsModalOpen(false);

      // /phones 페이지로 이동 (300ms 딜레이로 메시지가 표시되도록 함)
      setTimeout(() => {
        router.push('/phones');
      }, 300);
    } catch (error) {
      setIsModalOpen(false);
      message.error('삭제에 실패하였습니다. 다시 시도해주세요.');
      console.error('삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, phoneId, router]);

  return {
    isDeleting,
    deletePhone,
    showDeleteModal,
    hideDeleteModal,
    isModalOpen,
  };
}
