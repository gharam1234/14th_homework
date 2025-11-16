'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProviderProps {
  children: React.ReactNode;
}

export default function ModalProvider({ children }: ModalProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // modal-portal ID를 가진 div가 없으면 생성
    if (!document.getElementById('modal-portal')) {
      const modalPortal = document.createElement('div');
      modalPortal.id = 'modal-portal';
      document.body.appendChild(modalPortal);
    }

    return () => {
      // 필요시 cleanup
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const modalPortal = document.getElementById('modal-portal');

  return (
    <>
      {children}
      {modalPortal && createPortal(<div className="modal-container" />, modalPortal)}
    </>
  );
}
