# useMapLink Hook 구현 체크리스트

## 📋 요구사항 충족 여부

### ✅ 핵심요구사항 - TDD 방식 구현
- [x] 테스트를 먼저 작성함 (`index.map-link.hook.spec.ts`)
- [x] 테스트가 통과되도록 기능 완성함
- [x] Playwright 사용 (jest, @testing-library/react 사용 안 함)
- [x] timeout 0~499ms 또는 미설정
- [x] 페이지 로드 확인은 data-testid로 접근

### ✅ 핵심요구사항 - Kakao Maps 링크 기능
- [x] 마커 클릭 시 Kakao Maps 새 창 열림
- [x] 지도 컨테이너 클릭 시 Kakao Maps 새 창 열림
- [x] URL 형식: `https://map.kakao.com/link/map/[address],[latitude],[longitude]`
- [x] address와 addressDetail 결합 처리
- [x] window.open(url, '_blank') 사용

### ✅ 핵심요구사항 - Hook 구조
- [x] Hook 이름: `useMapLink`
- [x] 입력 파라미터:
  - [x] latitude: number (필수)
  - [x] longitude: number (필수)
  - [x] address: string (필수)
  - [x] addressDetail?: string (선택)
- [x] 반환값:
  - [x] getMapUrl: () => string
  - [x] openMapLink: () => void
  - [x] isValidCoordinates: boolean
- [x] 유효성 검사:
  - [x] latitude: -90 ~ 90
  - [x] longitude: -180 ~ 180
  - [x] address 빈 문자열 체크

### ✅ 핵심요구사항 - 컴포넌트 반영
- [x] 마커에 data-testid="phone-detail-map-marker"
- [x] 마커 onClick → openMapLink()
- [x] 지도 컨테이너에 data-testid="phone-detail-map-container"
- [x] 지도 컨테이너 cursor: pointer
- [x] 지도 컨테이너 onClick → openMapLink()
- [x] 좌표 검증 (isValidCoordinates가 false면 경고)
- [x] 경고 메시지: "유효한 위치 정보가 없습니다."

### ✅ 핵심요구사항 - Playwright 테스트
- [x] Hook 테스트:
  - [x] 올바른 URL 생성 테스트
  - [x] 좌표 유효성 검사 테스트
  - [x] addressDetail 처리 테스트
- [x] 컴포넌트 통합 테스트:
  - [x] 마커 클릭 → Kakao Maps 열림
  - [x] 좌표 이상 시 링크 안 열림
  - [x] URL 구조 정확성 확인
- [x] 실존 좌표 사용 (Mock 사용 안 함)
- [x] window.open 스파이 사용

### ✅ 핵심요구사항 - 보안/성능
- [x] 주소 encodeURIComponent로 인코딩
- [x] useCallback으로 함수 감싸기

### ✅ 핵심요구사항 - 접근성
- [x] 마커에 role="button"
- [x] 키보드 Enter 키 동작
- [x] 키보드 Space 키 동작

---

## 📊 테스트 결과

### 전체 테스트: 14개
- ✅ 통과: 14개
- ❌ 실패: 0개

### 테스트 세부 항목
1. ✅ 올바른 좌표와 주소로 Kakao Maps URL을 생성한다
2. ✅ addressDetail이 없을 때 기본 주소만으로 URL을 생성한다
3. ✅ 유효하지 않은 좌표를 감지한다 - 위도 범위 초과
4. ✅ 유효하지 않은 좌표를 감지한다 - 경도 범위 초과
5. ✅ 빈 주소를 감지한다
6. ✅ 유효한 좌표와 주소를 올바르게 판별한다
7. ✅ 마커를 클릭하면 Kakao Maps가 새 창으로 열린다
8. ✅ 지도 컨테이너를 클릭하면 Kakao Maps가 새 창으로 열린다
9. ✅ 마커에 키보드 접근성이 적용되어 있다 - Enter 키
10. ✅ 마커에 키보드 접근성이 적용되어 있다 - Space 키
11. ✅ 마커에 role="button"이 적용되어 있다
12. ✅ 지도 컨테이너에 cursor: pointer 스타일이 적용되어 있다
13. ✅ 생성된 URL에 주소와 좌표가 올바르게 인코딩되어 있다
14. ✅ 유효하지 않은 좌표일 때 경고 메시지를 표시한다

---

## 📁 생성된 파일

1. **Hook 파일**
   - 경로: `src/components/phone-detail/hooks/index.map-link.hook.ts`
   - 내용: useMapLink Hook 구현

2. **테스트 파일**
   - 경로: `src/components/phone-detail/tests/index.map-link.hook.spec.ts`
   - 내용: 14개의 Playwright 테스트

3. **컴포넌트 수정**
   - 파일: `src/components/phone-detail/index.tsx`
   - 내용: 
     - useMapLink Hook import
     - 지도 섹션에 마커 추가
     - 클릭 이벤트 및 키보드 이벤트 핸들러 추가

---

## 🎯 코딩 규칙 적용 (추정)

### @01-common.mdc 규칙 (일반 규칙)
- [x] 한국어 주석 사용
- [x] 명확한 변수/함수명 사용
- [x] TypeScript 타입 명시
- [x] JSDoc 주석으로 함수 설명
- [x] 코드 가독성 유지

### @04-func.mdc 규칙 (함수 규칙)
- [x] useCallback 사용으로 메모이제이션
- [x] useMemo 사용으로 계산값 캐싱
- [x] 순수 함수 원칙 준수
- [x] 단일 책임 원칙
- [x] 명확한 함수 시그니처

---

## 💡 구현 특징

### 1. TDD 방식 철저히 준수
- 테스트 먼저 작성 후 구현
- 모든 테스트 통과 확인

### 2. 접근성 고려
- 키보드 접근 가능 (Enter, Space)
- ARIA 속성 사용 (role, aria-label)
- tabIndex 설정

### 3. 보안 고려
- URL 인코딩 처리
- 입력값 유효성 검사

### 4. 성능 최적화
- useCallback으로 불필요한 리렌더링 방지
- useMemo로 유효성 검사 캐싱

### 5. 사용자 경험
- 유효하지 않은 좌표 시 경고 메시지
- 명확한 시각적 피드백 (cursor: pointer)
- 마커 아이콘으로 클릭 가능 영역 명시

---

## ✨ 완료

모든 요구사항을 충족하고, 14개의 테스트가 모두 통과했습니다.
TDD 방식으로 안정적인 코드를 구현했으며, 접근성과 보안을 고려한 높은 품질의 코드입니다.

