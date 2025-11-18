'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuth } from './auth.provider';
import { findRouteKeyByPath, isAccessible, getPath } from '@/commons/constants/url';
import Modal from '@commons/ui/src/modal';
import styles from './styles.module.css';

/**
 * AuthGuard Props
 */
interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard 컴포넌트
 * 페이지 접근 권한을 검증하고, 권한이 없는 경우 모달을 표시합니다.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasShownModalForPath, setHasShownModalForPath] = useState<string | null>(null);

  /**
   * 테스트 환경 여부 확인
   */
  const isTestEnv = process.env.NEXT_PUBLIC_TEST_ENV === 'test';

  /**
   * AuthProvider 초기화 후 권한 검증
   */
  useEffect(() => {
    // 마운트되지 않았거나 AuthProvider가 초기화되지 않았으면 대기
    if (!mounted || loading) {
      return;
    }

    // 테스트 환경인 경우 항상 인가 성공
    if (isTestEnv) {
      setIsAuthorized(true);
      return;
    }

    // 현재 경로에 해당하는 라우트 키 찾기
    const routeKey = findRouteKeyByPath(pathname);

    // 라우트 키가 없으면 (알 수 없는 경로) 인가 성공 (404는 Next.js가 처리)
    if (!routeKey) {
      setIsAuthorized(true);
      return;
    }

    // 권한 검증
    const accessible = isAccessible(routeKey, isAuthenticated);

    if (accessible) {
      setIsAuthorized(true);
      setShowLoginModal(false);
    } else {
      // 권한이 없으면 인가 실패
      setIsAuthorized(false);
      // 현재 경로에 대해 모달이 아직 표시되지 않았으면 표시
      if (hasShownModalForPath !== pathname) {
        setShowLoginModal(true);
        setHasShownModalForPath(pathname);
      }
    }
  }, [mounted, loading, isAuthenticated, pathname, isTestEnv, hasShownModalForPath]);

  /**
   * 컴포넌트 마운트 확인
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 로그인 모달 확인 버튼 클릭 핸들러
   */
  const handleLoginModalConfirm = useCallback(() => {
    // 모달 닫기
    setShowLoginModal(false);
    
    // 로그인 페이지로 이동
    router.push(getPath('LOGIN'));
  }, [router]);

  /**
   * 모달을 portal에 렌더링
   */
  const renderModal = () => {
    if (!mounted || typeof window === 'undefined') {
      return null;
    }

    const modalPortal = document.getElementById('modal-portal');
    if (!modalPortal || !showLoginModal) {
      return null;
    }

    return createPortal(
      <div
        className={styles.modalOverlay}
        data-testid="modal-overlay"
      >
        <Modal
          variant="info"
          actions="single"
          title="로그인해주세요"
          description="이 페이지에 접근하려면 로그인이 필요합니다."
          onConfirm={handleLoginModalConfirm}
        />
      </div>,
      modalPortal
    );
  };

  // AuthProvider가 초기화되지 않았거나 인가가 완료되지 않았으면 빈 화면 표시
  if (!mounted || loading || !isAuthorized) {
    return (
      <>
        <div
          className={styles.blankScreen}
          data-testid="auth-guard-blank"
        />
        {renderModal()}
      </>
    );
  }

  // 인가 성공 시 children 표시
  return (
    <>
      {children}
      {renderModal()}
    </>
  );
}

