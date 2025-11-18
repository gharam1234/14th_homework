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

export default function LayoutNavigation(){
    const router = useRouter()
  const onClickToLogin = () => {
    router.push("/")
  }

    const { setAccessToken } = useAccessTokenStore()
    const clearAccessToken = useAccessTokenStore((state) => state.clearAccessToken)
    const [userEmail, setUserEmail] = useState<string | null>(null)

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

     const items: MenuProps['items'] = [
  {
    label: (
      <div>23,000P</div>
    ),
    key: '0',
  },
  {
    label: (
      <div>포인트충전</div>
      
      
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
    )
}
