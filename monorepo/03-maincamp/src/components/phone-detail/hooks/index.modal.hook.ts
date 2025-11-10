import { useCallback, useMemo, useState } from 'react';

interface UsePhoneDetailModalHookOptions {
  phoneId?: string;
  phonePrice?: number;
  userEmail?: string;
}

interface PurchaseGuidePayload {
  phoneId: string;
  phonePrice: number;
  userEmail: string;
  steps: string[];
}

interface UsePhoneDetailModalHookResult {
  isModalOpen: boolean;
  modalMessage: string;
  payload: PurchaseGuidePayload | null;
  openPurchaseGuideModal: () => void;
  closeModal: () => void;
}

const formatter = new Intl.NumberFormat('ko-KR');

function buildGuidePayload({ phoneId, phonePrice, userEmail }: UsePhoneDetailModalHookOptions): PurchaseGuidePayload {
  const normalizedId = phoneId?.trim() || '미지정 상품';
  const normalizedPrice = typeof phonePrice === 'number' ? phonePrice : 0;
  const normalizedEmail = userEmail?.trim() || '로그인 필요';

  return {
    phoneId: normalizedId,
    phonePrice: normalizedPrice,
    userEmail: normalizedEmail,
    steps: [
      '에스크로(안전결제) 링크인지 주소창을 꼭 확인하세요.',
      '직거래 시 밝은 장소에서 신분 확인 후 진행하세요.',
      '결제 전 기기 상태, 수리 이력, 통신사 잠금 여부를 다시 확인하세요.',
    ],
  };
}

function buildModalMessage(payload: PurchaseGuidePayload): string {
  const priceText = payload.phonePrice > 0 ? `${formatter.format(payload.phonePrice)}원` : '가격 미정';
  const steps = payload.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');

  return [
    `[${payload.phoneId}] 구매 전 확인 사항`,
    `예상 결제 금액: ${priceText}`,
    `문의 계정: ${payload.userEmail}`,
    '',
    steps,
  ].join('\n');
}

/**
 * 구매 가이드 모달을 관리하는 커스텀 훅.
 * 실제 모달 UI가 없을 경우 alert로 대체하여 사용자에게 정보를 제공한다.
 */
export function usePhoneDetailModalHook(options: UsePhoneDetailModalHookOptions): UsePhoneDetailModalHookResult {
  const payload = useMemo(() => buildGuidePayload(options), [options]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openPurchaseGuideModal = useCallback(() => {
    const message = buildModalMessage(payload);
    setModalMessage(message);
    setIsModalOpen(true);

    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
      setIsModalOpen(false);
    } else {
      console.info(message);
    }
  }, [payload]);

  return {
    isModalOpen,
    modalMessage,
    payload,
    openPurchaseGuideModal,
    closeModal,
  };
}
