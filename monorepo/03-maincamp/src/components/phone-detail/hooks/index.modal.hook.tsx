'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModal } from '../../../commons/providers/modal/modal.provider';
import { getPath } from '../../../commons/constants/url';
import { graphql } from '../../../gql';

const PORTONE_CONFIG = {
  storeId: 'store-abc39db7-8ee1-4898-919e-0af603a68317',
  channelKey: 'channel-key-1dc10cea-ec89-471d-aedf-f4bd68993f33',
  currency: 'KRW' as const,
};

const MIN_CHARGE_AMOUNT = 100;
const MAX_CHARGE_AMOUNT = 10_000_000;

interface PortOneRequestParams {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: string;
  redirectUrl: string;
  payMethod: {
    kakaoPay: {
      checkout: {
        redirectUrl: string;
      };
    };
  };
  customer: {
    customerId: string;
    email: string;
  };
}

interface PortOneSDK {
  requestPayment: (params: PortOneRequestParams) => Promise<PortOnePaymentResult>;
}

declare global {
  interface Window {
    PortOne?: PortOneSDK;
  }
}

let portOneLoaderPromise: Promise<PortOneSDK> | null = null;

const loadPortOne = (): Promise<PortOneSDK> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('결제는 브라우저 환경에서만 이용 가능합니다.'));
  }

  if (window.PortOne) {
    return Promise.resolve(window.PortOne);
  }

  if (!portOneLoaderPromise) {
    portOneLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.portone.io/v2/browser-sdk.js';
      script.async = true;
      script.onload = () => {
        if (window.PortOne) {
          resolve(window.PortOne);
        } else {
          portOneLoaderPromise = null;
          reject(new Error('PortOne SDK 로드 결과를 확인할 수 없습니다.'));
        }
      };
      script.onerror = () => {
        portOneLoaderPromise = null;
        reject(new Error('PortOne SDK 스크립트를 불러오지 못했습니다.'));
      };
      document.head.appendChild(script);
    });
  }

  return portOneLoaderPromise;
};

const chargeSchema = z.object({
  amount: z
    .number({ invalid_type_error: '숫자로 입력해주세요.' })
    .int('포인트 단위로 입력해주세요.')
    .positive('1포인트 이상 입력해주세요.')
    .min(MIN_CHARGE_AMOUNT, `${MIN_CHARGE_AMOUNT.toLocaleString()}P 이상 충전해주세요.`)
    .max(
      MAX_CHARGE_AMOUNT,
      `${MAX_CHARGE_AMOUNT.toLocaleString()}P 이하로 충전해주세요.`,
    ),
});

type ChargeFormValues = z.infer<typeof chargeSchema>;

type FlowModalKey = 'purchase-guide' | 'point-insufficiency' | 'point-charge' | null;

interface PortOnePaymentResult {
  code: string;
  message?: string;
  paymentId?: string;
}

interface UsePhoneDetailModalHookProps {
  phoneId: string;
  phonePrice: number;
  userEmail: string;
}

interface UsePhoneDetailModalHookReturn {
  openPurchaseGuideModal: () => void;
  isPurchaseGuideModalOpen: boolean;
  isPointInsufficiencyModalOpen: boolean;
  isPointChargeModalOpen: boolean;
}

const FETCH_USER_INFO = graphql(`
  query FetchUserLoggedIn {
    fetchUserLoggedIn {
      _id
      name
      picture
      email
      userPoint {
        amount
      }
    }
  }
`);

const CREATE_POINT_TRANSACTION = graphql(`
  mutation createPointTransactionOfLoading($paymentId: ID!) {
    createPointTransactionOfLoading(paymentId: $paymentId) {
      _id
      amount
      balance
      status
      impUid
    }
  }
`);

const modalStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    minWidth: '320px',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  description: {
    fontSize: '15px',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontWeight: 600,
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #111827',
    backgroundColor: '#ffffff',
    color: '#111827',
    cursor: 'pointer',
    fontWeight: 600,
  },
  errorText: {
    color: '#dc2626',
    fontSize: '13px',
    margin: 0,
    textAlign: 'left',
  },
} as const;

interface ModalScaffoldProps {
  testId: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

const ModalScaffold = ({ testId, title, description, children }: ModalScaffoldProps) => (
  <section data-testid={testId} style={modalStyles.container}>
    <div>
      <h3 style={modalStyles.title}>{title}</h3>
      {description ? <p style={modalStyles.description}>{description}</p> : null}
    </div>
    {children}
  </section>
);

export const usePhoneDetailModalHook = ({
  phoneId,
  phonePrice,
  userEmail,
}: UsePhoneDetailModalHookProps): UsePhoneDetailModalHookReturn => {
  const router = useRouter();
  const { openModal, isOpen: isAnyModalOpen } = useModal();
  const [activeFlowModal, setActiveFlowModal] = useState<FlowModalKey>(null);
  const [isPortOneRequesting, setIsPortOneRequesting] = useState(false);

  useEffect(() => {
    if (!isAnyModalOpen) {
      setActiveFlowModal(null);
    }
  }, [isAnyModalOpen]);

  const {
    register,
    handleSubmit,
    reset: resetChargeForm,
    formState: { errors, isValid },
  } = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: { amount: phonePrice },
    mode: 'onChange',
  });

  const isPurchaseGuideModalOpen = activeFlowModal === 'purchase-guide';
  const isPointInsufficiencyModalOpen = activeFlowModal === 'point-insufficiency';
  const isPointChargeModalOpen = activeFlowModal === 'point-charge';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { refetch: refetchUser } = useQuery(FETCH_USER_INFO as any, {
    skip: true,
  });

  const openSingleActionModal = useCallback(
    ({
      testId,
      title,
      description,
      actionLabel = '확인',
      onClose,
      subText,
      closeTestId,
    }: {
      testId: string;
      title: string;
      description: ReactNode;
      actionLabel?: string;
      onClose?: () => void;
      subText?: ReactNode;
      closeTestId?: string;
    }) => {
      openModal(({ close }) => (
        <ModalScaffold
          testId={testId}
          title={title}
          description={
            subText ? (
              <>
                {description}
                <br />
                {subText}
              </>
            ) : (
              description
            )
          }
        >
          <div style={modalStyles.buttonRow}>
            <button
              type="button"
              style={modalStyles.primaryButton}
              data-testid={closeTestId}
              onClick={() => {
                close();
                onClose?.();
              }}
            >
              {actionLabel}
            </button>
          </div>
        </ModalScaffold>
      ));
    },
    [openModal],
  );

  const openPaymentFailureModal = useCallback(
    (message: string) => {
      setActiveFlowModal(null);
      openSingleActionModal({
        testId: 'payment-failure-modal',
        title: '결제 실패',
        description: message,
        closeTestId: 'payment-failure-close-btn',
      });
    },
    [openSingleActionModal],
  );

  const openPointChargeSuccessModal = useCallback(
    (balance: number) => {
      setActiveFlowModal(null);
      openSingleActionModal({
        testId: 'point-charge-success-modal',
        title: '포인트 충전 완료',
        description: `포인트 충전이 완료되었습니다.`,
        subText: `현재 보유 포인트: ${balance.toLocaleString()}P`,
        closeTestId: 'point-charge-success-close-btn',
      });
    },
    [openSingleActionModal],
  );

  const openNotImplementedModal = useCallback(() => {
    openSingleActionModal({
      testId: 'not-implemented-modal',
      title: '구현 예정입니다',
      description: '해당 기능은 준비 중입니다.',
      closeTestId: 'not-implemented-close-btn',
    });
  }, [openSingleActionModal]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createPointTransaction, { loading: isPointTransactionLoading }] = useMutation<any, any>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CREATE_POINT_TRANSACTION as any,
    {
      onCompleted: async (data) => {
        if (userEmail) {
          await refetchUser();
        }
        resetChargeForm({ amount: phonePrice });
        openPointChargeSuccessModal(data.createPointTransactionOfLoading.balance);
      },
      onError: (error) => {
        openPaymentFailureModal(error.message);
      },
    },
  );

  const handlePointCharge = useCallback(
    async (chargeAmount: number) => {
      if (!userEmail) {
        openPaymentFailureModal('로그인 후 이용해주세요.');
        return;
      }

      setIsPortOneRequesting(true);
      const paymentId = `phone-${phoneId}-${Date.now()}`;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('portone:payment-request', {
            detail: { amount: chargeAmount, paymentId },
          }),
        );
      }

      try {
        const portOne = await loadPortOne();
        const paymentResult = (await portOne.requestPayment({
          storeId: PORTONE_CONFIG.storeId,
          channelKey: PORTONE_CONFIG.channelKey,
          paymentId,
          orderName: `숙박권 포인트 충전 - ${phoneId}`,
          totalAmount: chargeAmount,
          currency: PORTONE_CONFIG.currency,
          redirectUrl: window.location.href,
          payMethod: {
            kakaoPay: {
              checkout: {
                redirectUrl: window.location.href,
              },
            },
          },
          customer: {
            customerId: userEmail,
            email: userEmail,
          },
        })) as PortOnePaymentResult;

        if (paymentResult.code === 'SUCCESS') {
          await createPointTransaction({
            variables: { paymentId },
          });
        } else {
          openPaymentFailureModal(paymentResult.message ?? '결제가 취소되었습니다.');
        }
      } catch (error) {
        openPaymentFailureModal(
          error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.',
        );
      } finally {
        setIsPortOneRequesting(false);
      }
    },
    [createPointTransaction, openPaymentFailureModal, phoneId, userEmail],
  );

  const openPointChargeModal = useCallback(() => {
    if (isPointChargeModalOpen) return;
    setActiveFlowModal('point-charge');
    resetChargeForm({ amount: phonePrice });

    openModal(({ close }) => {
      const submitHandler = handleSubmit(async ({ amount }) => {
        await handlePointCharge(amount);
      });

      return (
        <ModalScaffold
          testId="point-charge-modal"
          title="포인트 충전"
          description="충전할 포인트 금액을 입력하세요."
        >
          <form
            onSubmit={submitHandler}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
          >
            <label
              htmlFor="point-charge-amount-input"
              style={{ fontSize: '14px', textAlign: 'left', fontWeight: 600 }}
            >
              충전 금액(P)
            </label>
            <input
              id="point-charge-amount-input"
              type="number"
              min={MIN_CHARGE_AMOUNT}
              max={MAX_CHARGE_AMOUNT}
              step={100}
              data-testid="point-charge-amount-input"
              {...register('amount', { valueAsNumber: true })}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '15px',
              }}
            />
            {errors.amount ? (
              <p style={modalStyles.errorText} data-testid="point-charge-error">
                {errors.amount.message}
              </p>
            ) : null}
            <div style={modalStyles.buttonRow}>
              <button
                type="button"
                style={modalStyles.secondaryButton}
                data-testid="point-charge-cancel-btn"
                onClick={() => {
                  setActiveFlowModal(null);
                  close();
                }}
              >
                취소
              </button>
              <button
                type="submit"
                style={modalStyles.primaryButton}
                data-testid="point-charge-confirm-btn"
                disabled={!isValid || isPortOneRequesting || isPointTransactionLoading}
              >
                {isPortOneRequesting || isPointTransactionLoading ? '결제 요청 중...' : '충전'}
              </button>
            </div>
          </form>
        </ModalScaffold>
      );
    });
  }, [
    handlePointCharge,
    handleSubmit,
    isPointChargeModalOpen,
    isPointTransactionLoading,
    isPortOneRequesting,
    openModal,
    phonePrice,
    register,
    resetChargeForm,
    errors.amount,
    isValid,
  ]);

  const openPointInsufficiencyModal = useCallback(() => {
    if (isPointInsufficiencyModalOpen) return;
    setActiveFlowModal('point-insufficiency');

    openModal(({ close }) => (
      <ModalScaffold
        testId="point-insufficiency-modal"
        title="포인트가 부족합니다"
        description={`구매 금액 ${phonePrice.toLocaleString()}P가 필요합니다.`}
      >
        <div style={modalStyles.buttonRow}>
          <button
            type="button"
            style={modalStyles.secondaryButton}
            data-testid="point-insufficiency-cancel-btn"
            onClick={() => {
              setActiveFlowModal(null);
              close();
            }}
          >
            닫기
          </button>
          <button
            type="button"
            style={modalStyles.primaryButton}
            data-testid="point-insufficiency-charge-btn"
            onClick={() => {
              setActiveFlowModal(null);
              close();
              openPointChargeModal();
            }}
          >
            충전하기
          </button>
        </div>
      </ModalScaffold>
    ));
  }, [isPointInsufficiencyModalOpen, openModal, openPointChargeModal, phonePrice]);

  const handlePurchaseConfirm = useCallback(async () => {
    if (!userEmail) {
      openPaymentFailureModal('로그인 후 이용해주세요.');
      return;
    }

    try {
      const { data } = await refetchUser();
      const userPoint = data?.fetchUserLoggedIn?.userPoint?.amount ?? 0;

      if (userPoint >= phonePrice) {
        setActiveFlowModal(null);
        openNotImplementedModal();
      } else {
        openPointInsufficiencyModal();
      }
    } catch (error) {
      console.error('포인트 조회 오류:', error);
      openPointInsufficiencyModal();
    }
  }, [
    openNotImplementedModal,
    openPaymentFailureModal,
    openPointInsufficiencyModal,
    phonePrice,
    refetchUser,
    userEmail,
  ]);

  const openPurchaseGuideModal = useCallback(() => {
    if (isPurchaseGuideModalOpen) return;
    setActiveFlowModal('purchase-guide');

    openModal(({ close }) => (
      <ModalScaffold
        testId="purchase-guide-modal"
        title="숙박권 구매 안내"
        description={`총 결제 금액은 ${phonePrice.toLocaleString()}P 입니다.\n구매 절차를 진행할까요?`}
      >
        <div style={modalStyles.buttonRow}>
          <button
            type="button"
            style={modalStyles.secondaryButton}
            data-testid="purchase-guide-cancel-btn"
            onClick={() => {
              setActiveFlowModal(null);
              close();
              router.push(getPath('PHONES_LIST'));
            }}
          >
            취소
          </button>
          <button
            type="button"
            style={modalStyles.primaryButton}
            data-testid="purchase-guide-confirm-btn"
            onClick={async () => {
              setActiveFlowModal(null);
              close();
              await handlePurchaseConfirm();
            }}
          >
            구매
          </button>
        </div>
      </ModalScaffold>
    ));
  }, [handlePurchaseConfirm, isPurchaseGuideModalOpen, openModal, phonePrice, router]);

  return {
    openPurchaseGuideModal,
    isPurchaseGuideModalOpen,
    isPointInsufficiencyModalOpen,
    isPointChargeModalOpen,
  };
};
