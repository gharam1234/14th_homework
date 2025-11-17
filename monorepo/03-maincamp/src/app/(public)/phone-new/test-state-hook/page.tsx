'use client';

/**
 * usePhoneState 훅 테스트 페이지
 */

import { usePhoneState } from '@/components/phone-new/hooks/index.state.hook';
import { ProductState } from '@/components/phone-new/types';

export default function TestStateHookPage() {
  const { state, mode, updateField, resetState, switchMode, setInitialData } = usePhoneState();

  const editModeData: ProductState = {
    title: '수정용 상품',
    summary: '수정용 요약',
    description: '수정용 설명',
    price: 100000,
    tags: ['수정', '테스트'],
    address: '서울시 강남구',
    address_detail: '테헤란로 123',
    zipcode: '06234',
    latitude: 37.5665,
    longitude: 126.978,
    categories: ['전자기기'],
    sale_state: 'available',
    mediaUrls: ['https://example.com/image1.jpg'],
  };

  const completedModeData: ProductState = {
    title: '완료된 상품',
    summary: '완료된 요약',
    description: '완료된 설명',
    price: 150000,
    tags: ['완료'],
    address: '서울시 서초구',
    address_detail: '서초대로 456',
    zipcode: '06590',
    latitude: 37.4833,
    longitude: 127.0322,
    categories: ['가전'],
    sale_state: 'sold',
    mediaUrls: ['https://example.com/image2.jpg'],
  };

  const externalData: ProductState = {
    title: '외부 데이터 상품',
    summary: '외부 데이터 요약',
    description: '외부 데이터 설명',
    price: 200000,
    tags: ['외부'],
    address: '서울시 종로구',
    address_detail: '종로 789',
    zipcode: '03181',
    latitude: 37.5707,
    longitude: 126.9794,
    categories: ['기타'],
    sale_state: 'reserved',
    mediaUrls: ['https://example.com/image3.jpg'],
  };

  return (
    <div data-testid="phone-state-test-container">
      <h1>usePhoneState 훅 테스트</h1>

      {/* 현재 모드 */}
      <div>
        <strong>현재 모드:</strong>
        <span data-testid="current-mode">{mode}</span>
      </div>

      {/* 상태 표시 */}
      <div>
        <h2>현재 상태</h2>
        <div data-testid="state-title">{state.title}</div>
        <div data-testid="state-summary">{state.summary}</div>
        <div data-testid="state-description">{state.description}</div>
        <div data-testid="state-price">{state.price}</div>
        <div data-testid="state-tags">{JSON.stringify(state.tags)}</div>
        <div data-testid="state-address">{state.address}</div>
        <div data-testid="state-address-detail">{state.address_detail}</div>
        <div data-testid="state-zipcode">{state.zipcode}</div>
        <div data-testid="state-latitude">{state.latitude}</div>
        <div data-testid="state-longitude">{state.longitude}</div>
        <div data-testid="state-categories">{JSON.stringify(state.categories)}</div>
        <div data-testid="state-sale-state">{state.sale_state}</div>
        <div data-testid="state-media-urls">{JSON.stringify(state.mediaUrls)}</div>
      </div>

      {/* 필드 업데이트 버튼 */}
      <div>
        <h2>필드 업데이트</h2>
        <button data-testid="update-title" onClick={() => updateField('title', '테스트 상품명')}>
          title 업데이트
        </button>
        <button data-testid="update-summary" onClick={() => updateField('summary', '테스트 요약')}>
          summary 업데이트
        </button>
        <button data-testid="update-price" onClick={() => updateField('price', 50000)}>
          price 업데이트
        </button>
        <button
          data-testid="update-tags"
          onClick={() => updateField('tags', ['태그1', '태그2'])}
        >
          tags 업데이트
        </button>
        <button
          data-testid="update-sale-state"
          onClick={() => updateField('sale_state', 'reserved')}
        >
          sale_state 업데이트
        </button>
      </div>

      {/* 리셋 버튼 */}
      <div>
        <h2>리셋</h2>
        <button data-testid="reset-state" onClick={resetState}>
          상태 리셋
        </button>
      </div>

      {/* 모드 전환 버튼 */}
      <div>
        <h2>모드 전환</h2>
        <button data-testid="switch-to-draft" onClick={() => switchMode('draft')}>
          draft 모드로 전환
        </button>
        <button data-testid="switch-to-edit" onClick={() => switchMode('edit', editModeData)}>
          edit 모드로 전환
        </button>
        <button
          data-testid="switch-to-completed"
          onClick={() => switchMode('completed', completedModeData)}
        >
          completed 모드로 전환
        </button>
      </div>

      {/* 외부 데이터 설정 */}
      <div>
        <h2>외부 데이터 설정</h2>
        <button data-testid="set-initial-data" onClick={() => setInitialData(externalData)}>
          setInitialData 호출
        </button>
      </div>
    </div>
  );
}
