# 테스트 조건 재검토 리포트 - Kakao Maps 기능

## 📊 현재 상황 분석

**분석 날짜**: 2025-11-19  
**대상 파일**:
- `src/components/phone-detail/hooks/index.map.hook.ts` (useKakaoMap)
- `src/components/phone-detail/hooks/index.map-link.hook.ts` (useMapLink)
- `src/components/phone-detail/tests/index.map-link.hook.spec.ts`

---

## 🔍 구현 현황

### 1. useKakaoMap Hook (지도 렌더링)

**구현 상태**: ✅ 완료  
**테스트 상태**: ❌ 없음  
**파일 경로**: `src/components/phone-detail/hooks/index.map.hook.ts`

**주요 기능**:
- Kakao Maps API 동적 로드
- 지도 초기화 (중심 좌표, 줌 레벨 5)
- 마커 생성 및 표시
- InfoWindow 생성 (주소 정보)
- 마커 클릭 시 InfoWindow 토글
- 좌표 유효성 검증
- 에러 핸들링

**환경 변수**: `NEXT_PUBLIC_KAKAO_APP_KEY` ✅ (변경 완료)

**반환값**:
- `mapContainerRef`: 지도 컨테이너 DOM 참조
- `isMapLoaded`: 지도 로드 완료 여부
- `mapError`: 에러 메시지 (없으면 null)
- `isValidCoordinates`: 좌표 유효성 검사 결과
- `markerRef`: 마커 객체 참조
- `infoWindowRef`: InfoWindow 객체 참조

---

### 2. useMapLink Hook (지도 링크 열기)

**구현 상태**: ✅ 완료  
**테스트 상태**: ✅ 있음  
**파일 경로**: 
- Hook: `src/components/phone-detail/hooks/index.map-link.hook.ts`
- Test: `src/components/phone-detail/tests/index.map-link.hook.spec.ts`

**주요 기능**:
- Kakao Maps URL 생성
- 좌표 유효성 검증 (latitude: -90~90, longitude: -180~180)
- 주소 인코딩 (encodeURIComponent)
- window.open으로 새 창 열기
- alert으로 에러 메시지 표시

**반환값**:
- `getMapUrl`: () => string
- `openMapLink`: () => void
- `isValidCoordinates`: boolean

---

### 3. 컴포넌트 통합 현황

**파일**: `src/components/phone-detail/index.tsx`

#### useKakaoMap 사용 (Line 215-225)
```typescript
const {
  mapContainerRef,
  isMapLoaded,
  mapError,
  isValidCoordinates: hasValidMapCoordinates,
} = useKakaoMap({
  latitude: fetchedData?.latitude ?? null,
  longitude: fetchedData?.longitude ?? null,
  address: fetchedData?.address ?? phoneData?.seller.location ?? '',
  addressDetail: fetchedData?.address_detail ?? '',
});
```

#### useMapLink 사용 (Line 204-209)
```typescript
const { openMapLink, isValidCoordinates } = useMapLink({
  latitude: phoneData?.seller.latitude || 0,
  longitude: phoneData?.seller.longitude || 0,
  address: phoneData?.seller.location || '',
  addressDetail: '',
});
```

#### UI 렌더링 (Line 440-476)
```typescript
{hasValidMapCoordinates && (
  <section className={styles.locationSection} data-testid="location-section">
    <h2 className={styles.sectionTitle}>거래 희망 지역</h2>
    
    <div 
      ref={mapContainerRef}
      id="kakaoMap"
      className={styles.kakaoMapContainer} 
      data-testid="phone-detail-map-container"
    >
      {!isMapLoaded && !mapError && (
        <div className={styles.mapLoadingOverlay}>
          <p>지도를 불러오는 중...</p>
        </div>
      )}
      
      {mapError && (
        <div className={styles.mapErrorOverlay}>
          <p>{mapError}</p>
        </div>
      )}
    </div>
    
    {fetchedData?.address && (
      <div className={styles.mapAddressInfo} data-testid="phone-detail-map-address">
        <p className={styles.mapAddressText}>
          {fetchedData.address}
          {fetchedData.address_detail && ` ${fetchedData.address_detail}`}
        </p>
      </div>
    )}
  </section>
)}
```

---

## ⚠️ 발견된 문제점

### 1. useKakaoMap Hook 테스트 누락 ❌

**문제**: `useKakaoMap` Hook에 대한 테스트가 전혀 없음

**필요한 테스트**:
1. ✅ API 키 환경 변수 로드 (`NEXT_PUBLIC_KAKAO_APP_KEY`)
2. ✅ 스크립트 동적 로드
3. ✅ 스크립트 중복 로드 방지 (모듈 레벨 변수)
4. ✅ 지도 초기화 (중심 좌표, 줌 레벨)
5. ✅ 마커 생성 및 표시
6. ✅ InfoWindow 생성 및 토글
7. ✅ 좌표 유효성 검증
8. ✅ 에러 핸들링 (API 로드 실패, 초기화 실패)
9. ✅ 좌표 없을 때 처리
10. ✅ Cleanup 로직 (메모리 누수 방지)

### 2. 마커 클릭 이벤트 미구현 ❌

**문제**: 프롬프트(`03prompt.301.routing-map@.txt`)에서 요구하는 마커 클릭 시 링크 열기 기능이 컴포넌트에 통합되지 않음

**프롬프트 요구사항**:
```
핵심요구사항) 지도 요소(마커/지도 전체)를 클릭하면 Kakao Maps 길찾기 링크를 새 창으로 띄우기
  1) 클릭 대상
   - 마커 (data-testid="phone-detail-map-marker")
   - 지도 컨테이너 (data-testid="phone-detail-map-container")
```

**현재 상태**:
- ❌ 마커에 `data-testid="phone-detail-map-marker"` 속성 없음
- ❌ 마커 클릭 이벤트에 `openMapLink` 연결 안 됨
- ❌ 지도 컨테이너 클릭 이벤트 없음
- ❌ 마커에 `role="button"` 속성 없음
- ❌ 키보드 접근성 (Enter, Space) 미구현

### 3. 환경 변수 이름 불일치 ⚠️

**문제**: 프롬프트와 실제 구현의 환경 변수명 차이

- **프롬프트**: `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
- **현재 구현**: `NEXT_PUBLIC_KAKAO_APP_KEY` ✅

**평가**: 사용자가 의도적으로 변경한 것으로 보임 (변경 사항 확인됨)

### 4. 테스트 파일과 구현의 불일치 ⚠️

**파일**: `src/components/phone-detail/tests/index.map-link.hook.spec.ts`

**문제점**:
1. 테스트는 마커 클릭을 가정하지만, 실제로는 마커에 클릭 이벤트가 연결되지 않음
2. `data-testid="phone-detail-map-marker"` 속성이 실제 마커에 없음
3. 접근성 테스트 (role, keyboard) 구현 안 됨
4. 지도 컨테이너 클릭 테스트 구현 안 됨

---

## 📋 테스트 조건 재검토

### A. useKakaoMap Hook 단위 테스트 (신규 작성 필요)

**파일 경로**: `src/components/phone-detail/tests/index.map.hook.spec.ts`

#### 1. API 로드 테스트

```typescript
test.describe('useKakaoMap - Kakao Maps API 로드', () => {
  test('환경 변수에서 API 키를 로드한다', async ({ page }) => {
    // NEXT_PUBLIC_KAKAO_APP_KEY 확인
  });
  
  test('Kakao Maps SDK 스크립트를 동적으로 로드한다', async ({ page }) => {
    // script 태그 생성 확인
    // src 속성 확인: https://dapi.kakao.com/v2/maps/sdk.js?appkey=...&autoload=false
  });
  
  test('스크립트 중복 로드를 방지한다', async ({ page }) => {
    // 여러 컴포넌트에서 동시 호출 시 스크립트 1번만 로드
  });
  
  test('API 키가 없을 때 에러 메시지를 표시한다', async ({ page }) => {
    // mapError: "Kakao Maps API 키가 설정되지 않았습니다."
  });
  
  test('스크립트 로드 실패 시 에러를 처리한다', async ({ page }) => {
    // mapError: "Kakao Maps 스크립트 로드에 실패했습니다."
  });
});
```

#### 2. 좌표 유효성 검증 테스트

```typescript
test.describe('useKakaoMap - 좌표 유효성 검증', () => {
  test('유효한 좌표를 올바르게 판별한다', async ({ page }) => {
    // latitude: 37.5665, longitude: 126.978
    // isValidCoordinates: true
  });
  
  test('위도 범위를 벗어난 좌표를 감지한다', async ({ page }) => {
    // latitude: 100 (범위: -90 ~ 90)
    // isValidCoordinates: false
  });
  
  test('경도 범위를 벗어난 좌표를 감지한다', async ({ page }) => {
    // longitude: 200 (범위: -180 ~ 180)
    // isValidCoordinates: false
  });
  
  test('null 좌표를 감지한다', async ({ page }) => {
    // latitude: null, longitude: null
    // isValidCoordinates: false
  });
  
  test('NaN 좌표를 감지한다', async ({ page }) => {
    // latitude: NaN, longitude: NaN
    // isValidCoordinates: false
  });
});
```

#### 3. 지도 초기화 테스트

```typescript
test.describe('useKakaoMap - 지도 초기화', () => {
  test('지도를 올바른 중심 좌표로 초기화한다', async ({ page }) => {
    // center: new kakao.maps.LatLng(latitude, longitude)
  });
  
  test('기본 줌 레벨 5로 초기화한다', async ({ page }) => {
    // level: 5
  });
  
  test('지도 로드 완료 시 isMapLoaded를 true로 설정한다', async ({ page }) => {
    // isMapLoaded: true
  });
  
  test('지도 초기화 실패 시 에러를 표시한다', async ({ page }) => {
    // mapError: "지도를 표시하는 중 오류가 발생했습니다."
  });
});
```

#### 4. 마커 및 InfoWindow 테스트

```typescript
test.describe('useKakaoMap - 마커 및 InfoWindow', () => {
  test('마커를 좌표에 생성한다', async ({ page }) => {
    // markerRef.current가 존재
  });
  
  test('InfoWindow를 생성한다', async ({ page }) => {
    // infoWindowRef.current가 존재
    // 내용: address + addressDetail
  });
  
  test('마커 클릭 시 InfoWindow를 토글한다', async ({ page }) => {
    // 첫 클릭: InfoWindow 열림
    // 두 번째 클릭: InfoWindow 닫힘
  });
  
  test('addressDetail이 있을 때 전체 주소를 표시한다', async ({ page }) => {
    // InfoWindow 내용: "서울시 중구 명동"
  });
  
  test('addressDetail이 없을 때 기본 주소만 표시한다', async ({ page }) => {
    // InfoWindow 내용: "서울시 중구"
  });
});
```

#### 5. Cleanup 테스트

```typescript
test.describe('useKakaoMap - Cleanup', () => {
  test('컴포넌트 언마운트 시 마커를 제거한다', async ({ page }) => {
    // markerRef.current.setMap(null)
  });
  
  test('컴포넌트 언마운트 시 InfoWindow를 닫는다', async ({ page }) => {
    // infoWindowRef.current.close()
  });
  
  test('컴포넌트 언마운트 시 지도 인스턴스를 정리한다', async ({ page }) => {
    // mapInstanceRef.current = null
  });
});
```

---

### B. useMapLink Hook 통합 테스트 (보완 필요)

**파일 경로**: `src/components/phone-detail/tests/index.map-link.hook.spec.ts` (이미 존재)

#### 보완 사항:

1. **실제 컴포넌트와 통합 테스트**
   - ❌ 현재: 테스트 페이지 직접 생성
   - ✅ 개선: 실제 phone-detail 페이지 사용

2. **마커 클릭 이벤트 테스트**
   - ❌ 현재: 마커 요소가 실제로 존재하지 않음
   - ✅ 개선: useKakaoMap으로 생성된 마커에 이벤트 연결 후 테스트

3. **접근성 테스트 보완**
   - ❌ 현재: role="button" 테스트 있으나 구현 안 됨
   - ✅ 개선: 마커에 role, aria-label, tabindex 추가 후 테스트

4. **에러 처리 테스트**
   - ⚠️ 현재: alert() 사용
   - ✅ 권장: antd message 사용 (프로젝트 표준)

---

### C. 컴포넌트 통합 테스트 (신규 작성 필요)

**파일 경로**: `src/components/phone-detail/tests/index.map-integration.spec.ts`

#### 1. useKakaoMap + useMapLink 통합

```typescript
test.describe('Kakao Maps 통합 테스트', () => {
  test('지도가 렌더링되고 마커가 표시된다', async ({ page }) => {
    // 1. phone-detail 페이지 이동
    // 2. 지도 컨테이너 확인 (data-testid="phone-detail-map-container")
    // 3. 지도 로드 완료 대기
    // 4. 마커 존재 확인
  });
  
  test('마커 클릭 시 Kakao Maps 링크가 새 창으로 열린다', async ({ page }) => {
    // 1. window.open 스파이 설정
    // 2. 마커 클릭
    // 3. URL 확인: https://map.kakao.com/link/map/...
    // 4. target="_blank" 확인
  });
  
  test('지도 컨테이너 클릭 시 Kakao Maps 링크가 열린다', async ({ page }) => {
    // 1. window.open 스파이 설정
    // 2. 지도 컨테이너 클릭
    // 3. URL 확인
  });
  
  test('좌표가 유효하지 않을 때 링크가 열리지 않는다', async ({ page }) => {
    // 1. 유효하지 않은 좌표로 페이지 로드
    // 2. 마커 클릭
    // 3. 경고 메시지 확인: "유효한 위치 정보가 없습니다."
    // 4. window.open 호출 안 됨
  });
  
  test('좌표가 없을 때 지도 섹션이 표시되지 않는다', async ({ page }) => {
    // 1. 좌표 없는 데이터로 페이지 로드
    // 2. data-testid="location-section" 요소 없음
  });
  
  test('지도 로딩 중 메시지를 표시한다', async ({ page }) => {
    // 1. 지도 로드 전
    // 2. "지도를 불러오는 중..." 메시지 확인
  });
  
  test('지도 로드 실패 시 에러 메시지를 표시한다', async ({ page }) => {
    // 1. API 키 없이 로드
    // 2. 에러 메시지 확인
  });
});
```

#### 2. 접근성 테스트

```typescript
test.describe('Kakao Maps 접근성 테스트', () => {
  test('마커에 role="button"이 적용되어 있다', async ({ page }) => {
    // role 속성 확인
  });
  
  test('마커에 aria-label이 적용되어 있다', async ({ page }) => {
    // aria-label="지도에서 위치 확인하기" 확인
  });
  
  test('마커가 키보드로 포커스 가능하다', async ({ page }) => {
    // tabindex="0" 확인
    // tab 키로 포커스 이동
  });
  
  test('Enter 키로 마커를 클릭할 수 있다', async ({ page }) => {
    // 1. 마커에 포커스
    // 2. Enter 키 입력
    // 3. window.open 호출 확인
  });
  
  test('Space 키로 마커를 클릭할 수 있다', async ({ page }) => {
    // 1. 마커에 포커스
    // 2. Space 키 입력
    // 3. window.open 호출 확인
  });
});
```

#### 3. UI 스타일 테스트

```typescript
test.describe('Kakao Maps UI 스타일 테스트', () => {
  test('지도 컨테이너에 cursor: pointer가 적용되어 있다', async ({ page }) => {
    // computed style 확인
  });
  
  test('지도 컨테이너의 크기가 올바르다', async ({ page }) => {
    // width: 100%
    // height: 380px (데스크톱)
  });
  
  test('주소 텍스트가 지도 아래에 표시된다', async ({ page }) => {
    // data-testid="phone-detail-map-address"
    // 주소 텍스트 확인
  });
  
  test('반응형 - 모바일에서 지도 높이가 조정된다', async ({ page }) => {
    // viewport: 768px 이하
    // height: 280px
  });
});
```

---

## 🔧 필요한 구현 작업

### 1. 마커 클릭 이벤트 연결 (긴급)

**파일**: `src/components/phone-detail/hooks/index.map.hook.ts`

```typescript
// 수정: initializeMap 함수 내부

// 기존 마커 클릭 이벤트 (InfoWindow 토글)
let isInfoWindowOpen = false;
kakao.maps.event.addListener(marker, 'click', () => {
  if (isInfoWindowOpen) {
    infoWindow.close();
    isInfoWindowOpen = false;
  } else {
    infoWindow.open(map, marker);
    isInfoWindowOpen = true;
  }
  
  // ✅ 추가: Kakao Maps 링크 열기 (선택적)
  // 만약 마커 클릭 시 링크도 열고 싶다면:
  // if (onMarkerClick) {
  //   onMarkerClick();
  // }
});
```

**파일**: `src/components/phone-detail/index.tsx`

```typescript
// ✅ 추가: useKakaoMap에서 마커 ref를 받아서 DOM 요소로 변환
useEffect(() => {
  if (markerRef.current && mounted) {
    const markerElement = markerRef.current.getElement?.();
    
    if (markerElement) {
      // data-testid 추가
      markerElement.setAttribute('data-testid', 'phone-detail-map-marker');
      
      // role 추가
      markerElement.setAttribute('role', 'button');
      
      // aria-label 추가
      markerElement.setAttribute('aria-label', '지도에서 위치 확인하기');
      
      // tabindex 추가 (키보드 포커스)
      markerElement.setAttribute('tabindex', '0');
      
      // 클릭 이벤트 (Kakao Maps 링크 열기)
      markerElement.addEventListener('click', () => {
        openMapLink();
      });
      
      // 키보드 이벤트
      markerElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMapLink();
        }
      });
    }
  }
}, [markerRef, mounted, openMapLink]);
```

### 2. 지도 컨테이너 클릭 이벤트 추가

**파일**: `src/components/phone-detail/index.tsx`

```typescript
// ✅ 추가: 지도 컨테이너 클릭 시 링크 열기
<div 
  ref={mapContainerRef}
  id="kakaoMap"
  className={styles.kakaoMapContainer} 
  data-testid="phone-detail-map-container"
  onClick={openMapLink}  // ✅ 추가
  style={{ cursor: 'pointer' }}  // ✅ 추가
>
```

### 3. alert() → antd message 변경 (권장)

**파일**: `src/components/phone-detail/hooks/index.map-link.hook.ts`

```typescript
// ❌ 기존
alert('유효한 위치 정보가 없습니다.');

// ✅ 개선
import { message } from 'antd';

message.warning('유효한 위치 정보가 없습니다.');
```

---

## ✅ 테스트 조건 체크리스트

### useKakaoMap Hook

- [ ] **API 로드 테스트**
  - [ ] 환경 변수 로드 (`NEXT_PUBLIC_KAKAO_APP_KEY`)
  - [ ] SDK 스크립트 동적 로드
  - [ ] 스크립트 중복 로드 방지
  - [ ] API 키 없을 때 에러 처리
  - [ ] 스크립트 로드 실패 에러 처리

- [ ] **좌표 유효성 검증**
  - [ ] 유효한 좌표 판별
  - [ ] 위도 범위 초과 감지 (-90 ~ 90)
  - [ ] 경도 범위 초과 감지 (-180 ~ 180)
  - [ ] null 좌표 감지
  - [ ] NaN 좌표 감지

- [ ] **지도 초기화**
  - [ ] 중심 좌표 설정
  - [ ] 줌 레벨 5 설정
  - [ ] 로드 완료 시 isMapLoaded=true
  - [ ] 초기화 실패 시 에러 표시

- [ ] **마커 및 InfoWindow**
  - [ ] 마커 생성
  - [ ] InfoWindow 생성
  - [ ] 마커 클릭 시 InfoWindow 토글
  - [ ] addressDetail 포함 주소 표시
  - [ ] 기본 주소만 표시

- [ ] **Cleanup**
  - [ ] 마커 제거
  - [ ] InfoWindow 닫기
  - [ ] 지도 인스턴스 정리

### useMapLink Hook

- [x] **URL 생성** (테스트 존재)
  - [x] 올바른 URL 형식
  - [x] addressDetail 처리
  - [x] 주소 인코딩

- [x] **좌표 유효성** (테스트 존재)
  - [x] 유효한 좌표 판별
  - [x] 위도/경도 범위 초과 감지
  - [x] 빈 주소 감지

- [ ] **컴포넌트 통합** (구현 필요)
  - [ ] 마커 클릭 시 링크 열기
  - [ ] 지도 컨테이너 클릭 시 링크 열기
  - [ ] 유효하지 않은 좌표 시 경고
  - [ ] URL 구조 검증

- [ ] **접근성** (구현 필요)
  - [ ] role="button"
  - [ ] aria-label
  - [ ] 키보드 포커스 (tabindex)
  - [ ] Enter 키 지원
  - [ ] Space 키 지원

- [ ] **UI 스타일** (구현 필요)
  - [ ] cursor: pointer
  - [ ] 지도 컨테이너 크기
  - [ ] 반응형 처리

### 통합 테스트

- [ ] **지도 렌더링 + 링크 열기**
  - [ ] 지도 로드 확인
  - [ ] 마커 표시 확인
  - [ ] 마커 클릭 시 링크 열기
  - [ ] 지도 클릭 시 링크 열기
  - [ ] 좌표 없을 때 섹션 숨김
  - [ ] 로딩 메시지 표시
  - [ ] 에러 메시지 표시

- [ ] **데이터 소스 일관성**
  - [ ] useKakaoMap: fetchedData 사용
  - [ ] useMapLink: phoneData.seller 사용
  - [ ] 데이터 불일치 시 처리

---

## 🎯 우선순위 및 권장 작업 순서

### 높은 우선순위 (필수)

1. **마커 클릭 이벤트 구현** ⭐⭐⭐
   - 마커에 data-testid, role, 이벤트 리스너 추가
   - 키보드 접근성 구현
   - 예상 시간: 30분

2. **useKakaoMap Hook 테스트 작성** ⭐⭐⭐
   - 단위 테스트 파일 생성 (`index.map.hook.spec.ts`)
   - 5개 카테고리 테스트 작성
   - 예상 시간: 2시간

3. **통합 테스트 작성** ⭐⭐
   - 지도 렌더링 + 링크 열기 통합 테스트
   - 예상 시간: 1시간

### 중간 우선순위 (권장)

4. **useMapLink Hook 테스트 보완** ⭐⭐
   - 실제 컴포넌트와 통합
   - 접근성 테스트 보완
   - 예상 시간: 1시간

5. **alert() → antd message 변경** ⭐
   - 프로젝트 표준 준수
   - 예상 시간: 10분

6. **지도 컨테이너 클릭 이벤트** ⭐
   - onClick 추가
   - cursor: pointer 스타일 추가
   - 예상 시간: 10분

### 낮은 우선순위 (선택)

7. **반응형 테스트 추가**
   - 모바일/태블릿 화면 크기 테스트
   - 예상 시간: 30분

8. **UI 스타일 세부 테스트**
   - 색상, 폰트, 여백 등
   - 예상 시간: 30분

---

## 📝 환경 변수 확인 사항

### 현재 사용 중인 환경 변수

```bash
NEXT_PUBLIC_KAKAO_APP_KEY=your-kakao-app-key
```

### 확인 필요

1. ✅ `.env.local` 파일에 변수 설정 확인
2. ✅ 변수명이 `NEXT_PUBLIC_KAKAO_APP_KEY`인지 확인 (변경 완료)
3. ✅ 테스트 환경에서도 환경 변수 로드 확인
4. ✅ Playwright 설정에서 환경 변수 전달 확인

---

## 🚀 최종 권장 사항

### 즉시 처리 필요

1. **마커 DOM 요소 접근 및 이벤트 연결** (30분)
   - Kakao Maps API의 marker.getElement() 활용
   - data-testid, role, aria-label, tabindex 추가
   - click, keydown 이벤트 리스너 추가

2. **useKakaoMap Hook 테스트 작성** (2시간)
   - 체계적인 테스트 구조
   - 모든 기능 커버리지 확보

3. **통합 테스트 작성** (1시간)
   - 실제 사용 시나리오 검증
   - 엔드투엔드 동작 확인

### 장기적 개선

1. **테스트 자동화 CI/CD 통합**
   - GitHub Actions 또는 유사 도구
   - PR마다 자동 테스트 실행

2. **커버리지 목표 설정**
   - 현재: useMapLink ~70% (추정)
   - 목표: 전체 90% 이상

3. **성능 테스트 추가**
   - 지도 로드 시간 측정
   - 메모리 누수 확인

---

**재검토 완료일**: 2025-11-19  
**재검토 대상**: Kakao Maps 관련 Hook 및 테스트  
**재검토자**: AI Assistant (Claude Sonnet 4.5)

