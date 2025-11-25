"use client"
import styles from './styles.module.css'
import { useAccessTokenStore } from '@/stores/use-access-token'
import { RightOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useRouter } from 'next/navigation';
import { supabase } from '@/commons/libraries/supabaseClient'
import ChargePopup from '@/components/point-charge-popup'
import { createPortal } from 'react-dom'

export default function LayoutNavigation(){
    const router = useRouter()
  const onClickToLogin = () => {
    router.push("/")
  }

    const { setAccessToken } = useAccessTokenStore()
    const clearAccessToken = useAccessTokenStore((state) => state.clearAccessToken)
    const [userEmail, setUserEmail] = useState<string | null>(null)

    // 포인트 충전 모달 상태
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState('')
    const [mounted, setMounted] = useState(false)

    // Portal을 위한 mounted 상태
    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      let isMounted = true;

      const syncSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        const session = data.session;
        if (session?.user) {
          setUserEmail(session.user.email ?? null);
          setAccessToken(session.access_token);
        } else {
          setUserEmail(null);
          clearAccessToken();
        }
      };

      syncSession();

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session) {
          setUserEmail(session.user?.email ?? null);
          setAccessToken(session.access_token);
        } else {
          setUserEmail(null);
          clearAccessToken();
        }
      });

      return () => {
        isMounted = false;
        listener.subscription.unsubscribe();
      };
    }, [setAccessToken, clearAccessToken])

    const onClickLogout = async () => {
        await supabase.auth.signOut();
        clearAccessToken();
        setUserEmail(null);
        router.push("/")
    }

    // 포인트 충전 모달 핸들러
    const handleOpenChargeModal = () => {
      setIsChargeModalOpen(true)
      setSelectedAmount('')
    }

    const handleCloseChargeModal = () => {
      setIsChargeModalOpen(false)
      setSelectedAmount('')
    }

    const handleConfirmCharge = async () => {
      if (!selectedAmount) {
        alert('충전 금액을 선택해주세요.')
        return
      }

      try {
        // 결제 API 호출
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            billingKey: 'test_billing_key_' + Date.now(), // TODO: 실제 빌링키 사용
            orderName: '포인트 충전',
            amount: parseInt(selectedAmount),
            customer: {
              id: userEmail || 'guest', // 로그인된 사용자 이메일 사용
            },
          }),
        })

        const result = await response.json()

        if (result.success) {
          alert(`${parseInt(selectedAmount).toLocaleString()}원 충전이 완료되었습니다.`)
          handleCloseChargeModal()
        } else {
          alert(`충전에 실패했습니다: ${result.error || '알 수 없는 오류'}`)
        }
      } catch (error) {
        console.error('결제 오류:', error)
        alert('충전 중 오류가 발생했습니다.')
      }
    }

    // 충전 금액 옵션
    const chargeOptions = [
      { value: '10000', label: '10,000원' },
      { value: '30000', label: '30,000원' },
      { value: '50000', label: '50,000원' },
      { value: '100000', label: '100,000원' },
    ]

     const items: MenuProps['items'] = [
  {
    label: (
      <div>23,000P</div>
    ),
    key: '0',
  },
  {
    label: (
      <div onClick={handleOpenChargeModal}>포인트충전</div>
    ),
    key: '1',
  },
  {
    type: 'divider',
  },
  {
    label: (
      <div onClick={onClickLogout}>로그아웃</div>
    ),
    key: '3',
    
  },
];
    
    return (
        <>
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div className={styles.main}>

                        <img className={styles.main__logo} src="/images/logo.png" alt="" />
                        <ul className={styles.main__menu}>
                            <li className={styles.main__menu__item}>트립토크</li>
                            <li className={styles.main__menu__item}>숙박권 구매</li>
                            <li className={styles.main__menu__item}>마이 페이지</li>
                        </ul>


                </div>
                <div className={styles.login}>
                    { userEmail ?
                    <div>

                    <Dropdown menu={{ items }}>
    <a onClick={(e) => e.preventDefault()}>
        <button className={styles.login__profileBtn}>
                        <img src="/images/user.png" alt="user" />
                        <img src="/images/down_arrow.png" alt="down_arrow" />
                    </button>
    </a>
  </Dropdown>
                    </div>

                        : <button onClick={onClickToLogin} className={styles.login__loginBtn}>로그인<RightOutlined className={styles.anticon} /></button>}
                </div>
            </div>
        </div>

        {/* 포인트 충전 모달 */}
        {mounted && isChargeModalOpen && createPortal(
          <div
            className={styles.modalOverlay}
            onClick={handleCloseChargeModal}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ChargePopup
                options={chargeOptions}
                selectedValue={selectedAmount}
                cancelText="취소"
                confirmText="충전하기"
                onChangeAmount={setSelectedAmount}
                onCancel={handleCloseChargeModal}
                onConfirm={handleConfirmCharge}
              />
            </div>
          </div>,
          document.body
        )}
        </>
    )
}
