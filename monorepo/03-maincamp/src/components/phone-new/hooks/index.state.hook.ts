/**
 * usePhoneState 훅
 *
 * 상품 정보를 관리하는 상태 객체와 모드 관리 시스템을 제공하는 커스텀 훅
 * draft(초안), completed(완료), edit(수정) 모드를 지원
 */

'use client';

import { useState, useCallback } from 'react';
import { ProductState, ProductMode } from '../types';

/** 초안 모드 초기값 */
const getDraftInitialState = (): ProductState => ({
  title: '',
  summary: '',
  description: '',
  price: 0,
  tags: [],
  address: '',
  address_detail: '',
  zipcode: '',
  latitude: 0,
  longitude: 0,
  categories: [],
  sale_state: 'available',
  mediaUrls: [],
});

/** usePhoneState 훅 인터페이스 */
export interface IUsePhoneState {
  state: ProductState;
  mode: ProductMode;
  updateField: <K extends keyof ProductState>(fieldName: K, value: ProductState[K]) => void;
  resetState: () => void;
  switchMode: (mode: ProductMode, data?: ProductState) => void;
  setInitialData: (data: ProductState) => void;
}

/**
 * usePhoneState 훅
 */
export function usePhoneState(): IUsePhoneState {
  const [mode, setMode] = useState<ProductMode>('draft');
  const [state, setState] = useState<ProductState>(getDraftInitialState());
  const [modeInitialState, setModeInitialState] = useState<ProductState>(getDraftInitialState());
  const applyState = useCallback((nextState: ProductState) => {
    setModeInitialState(nextState);
    setState(nextState);
  }, []);

  /**
   * 특정 필드 값 변경
   */
  const updateField = useCallback(
    <K extends keyof ProductState>(fieldName: K, value: ProductState[K]) => {
      setState((prev) => {
        if (mode === 'completed') return prev;
        if (prev[fieldName] === value) return prev;
        return {
          ...prev,
          [fieldName]: value,
        };
      });
    },
    [mode]
  );

  /**
   * 전체 값 초기화 (현재 모드의 초기값으로)
   */
  const resetState = useCallback(() => {
    setState(modeInitialState);
  }, [modeInitialState]);

  /**
   * 모드 전환
   */
  const switchMode = useCallback(
    (newMode: ProductMode, data?: ProductState) => {
      if (newMode === 'draft') {
        setMode('draft');
        const draftState = getDraftInitialState();
        applyState(draftState);
        return;
      }

      if (newMode === 'edit') {
        if (!data) return;
        setMode('edit');
        applyState(data);
        return;
      }

      if (newMode === 'completed') {
        setMode('completed');
        const completedState = data ?? state;
        applyState(completedState);
      }
    },
    [applyState, state]
  );

  /**
   * 외부 데이터로 초기화 (수정 모드용)
   */
  const setInitialData = useCallback(
    (data: ProductState) => {
      applyState(data);
    },
    [applyState]
  );

  return {
    state,
    mode,
    updateField,
    resetState,
    switchMode,
    setInitialData,
  };
}
