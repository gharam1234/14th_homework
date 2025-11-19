'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/commons/libraries/supabaseClient';
import { getPath } from '@/commons/constants/url';

/**
 * AuthContext 인터페이스
 */
interface AuthContextType {
  // 로그인 여부
  isAuthenticated: boolean;
  // 현재 로그인한 유저 정보
  user: User | null;
  // 초기 로딩 / 동기화 중인지
  loading: boolean;
  // 로그인 페이지로 이동
  loginPageRedirect: () => void;
  // 로그아웃 처리
  logout: () => Promise<void>;
  // Supabase에서 최신 유저 정보 다시 가져오기
  refreshUser: () => Promise<void>;
}

/**
 * AuthContext 생성
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider 컴포넌트
 * 로그인 상태 관리 및 인증 관련 기능 제공
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * localStorage에서 user 정보 읽기
   */
  const getUserFromLocalStorage = useCallback((): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.warn('[AuthProvider] localStorage의 user 정보를 파싱할 수 없습니다.', error);
      localStorage.removeItem('user');
      return null;
    }
  }, []);

  /**
   * localStorage에 user 정보 저장
   */
  const setUserToLocalStorage = useCallback((userData: User | null) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  /**
   * localStorage에 accessToken 저장
   */
  const setAccessTokenToLocalStorage = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, []);

  /**
   * 세션 정보로 상태 업데이트
   */
  const updateAuthState = useCallback(
    (session: { access_token: string; user: User } | null) => {
      if (session) {
        // 세션이 있으면 로그인 상태로 설정
        setAccessTokenToLocalStorage(session.access_token);
        setUserToLocalStorage(session.user);
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        // 세션이 없으면 비로그인 상태로 설정
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    },
    [setAccessTokenToLocalStorage, setUserToLocalStorage]
  );

  /**
   * Supabase에서 최신 유저 정보 다시 가져오기
   */
  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('[AuthProvider] 유저 정보를 가져오는 중 오류 발생:', error);
        updateAuthState(null);
        return;
      }

      if (data.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          updateAuthState({
            access_token: sessionData.session.access_token,
            user: data.user,
          });
        } else {
          updateAuthState(null);
        }
      } else {
        updateAuthState(null);
      }
    } catch (error) {
      console.warn('[AuthProvider] 유저 정보 갱신 중 오류 발생:', error);
      updateAuthState(null);
    }
  }, [updateAuthState]);

  /**
   * 로그인 페이지로 이동
   */
  const loginPageRedirect = useCallback(() => {
    router.push(getPath('LOGIN'));
  }, [router]);

  /**
   * 로그아웃 처리
   */
  const logout = useCallback(async () => {
    try {
      // 1. Supabase 세션 종료
      await supabase.auth.signOut();

      // 2. localStorage 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // 3. Context 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);

      // 4. 로그인 페이지로 이동
      // replace를 사용하여 뒤로가기로 다시 못 돌아가게 함
      router.replace(getPath('LOGIN'));
    } catch (error) {
      console.error('[AuthProvider] 로그아웃 중 오류 발생:', error);
      // 오류가 발생해도 상태는 초기화
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      router.replace(getPath('LOGIN'));
    }
  }, [router]);

  /**
   * 초기 세션 확인 및 실시간 상태 감지
   */
  useEffect(() => {
    let isMounted = true;

    /**
     * 초기 세션 확인
     */
    const checkInitialSession = async () => {
      try {
        // localStorage로 1차 확인
        const accessToken = localStorage.getItem('accessToken');
        const localUser = getUserFromLocalStorage();

        if (accessToken && localUser) {
          // localStorage에 정보가 있으면 일단 로그인 상태로 설정
          setIsAuthenticated(true);
          setUser(localUser);
        }

        // 테스트 환경에서는 localStorage만으로 인증 완료
        if (process.env.NEXT_PUBLIC_TEST_ENV === 'test') {
          setLoading(false);
          return;
        }

        // Supabase 세션으로 2차 확인
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.warn('[AuthProvider] 세션 확인 중 오류 발생:', error);
          updateAuthState(null);
          setLoading(false);
          return;
        }

        if (data.session) {
          // 세션이 있으면 상태 업데이트
          updateAuthState({
            access_token: data.session.access_token,
            user: data.session.user,
          });
        } else {
          // 세션이 없으면 비로그인 상태로 초기화
          updateAuthState(null);
        }
      } catch (error) {
        console.warn('[AuthProvider] 초기 세션 확인 중 오류 발생:', error);
        if (isMounted) {
          updateAuthState(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // 초기 세션 확인 실행
    checkInitialSession();

    /**
     * onAuthStateChange로 실시간 감지
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (session) {
        // 세션이 생기면 상태 업데이트
        updateAuthState({
          access_token: session.access_token,
          user: session.user,
        });
      } else {
        // 세션이 없어지면 비로그인 상태로 변경
        updateAuthState(null);
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [getUserFromLocalStorage, updateAuthState]);

  /**
   * Context 값
   */
  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    loginPageRedirect,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth 훅
 * AuthContext를 반환하며, Provider 밖에서 사용 시 에러를 throw
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}


