"use client"
import styles from './styles.module.css'
import { useAccessTokenStore } from '@/stores/use-access-token'
import { RightOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { use, useEffect } from 'react'

import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { useRouter } from 'next/navigation';

const FETCH_USER_LOGGED_IN = gql`
  query {
    fetchUserLoggedIn {
      _id
      email
      name
    }
  }
`;

export default function LayoutNavigation(){
    const router = useRouter()
  const onClickToLogin = () => {
    router.push("/")
  }

   
    const { setAccessToken, accessToken } = useAccessTokenStore()
    useEffect(() => {
      const accessTokenByLocal =localStorage.getItem("accessToken")
      if(accessTokenByLocal){
            setAccessToken(accessTokenByLocal)
        }
    }, [])
    const { data } = useQuery(FETCH_USER_LOGGED_IN);
    const clearAccessToken = useAccessTokenStore((state) => state.clearAccessToken)

    const onClickLogout =() => {
        clearAccessToken()
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
                    { accessToken ? 
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