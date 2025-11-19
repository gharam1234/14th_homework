# 스크립트 사용 가이드

## 🎯 추천: 로컬스토리지 테스트 데이터 (추천!)

**Supabase 없이도 페이지네이션 테스트 가능!** ✨

### 특징
- ✅ Supabase 연결 불필요
- ✅ seller_id 문제 없음  
- ✅ 브라우저에서 간편하게 생성/삭제
- ✅ 시각적인 UI 제공
- ✅ 즉시 테스트 가능

### 사용 방법

```bash
# 1. HTML 파일 생성
npm run generate:local-test-data

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 접속
# http://localhost:3000/test-data-generator.html

# 4. "데이터 생성" 버튼 클릭 (원하는 개수 입력)

# 5. /phones 페이지에서 페이지네이션 테스트
```

### 브라우저 콘솔에서 직접 생성

개발자 도구 콘솔에서 직접 실행할 수도 있습니다:

```javascript
// 100개 생성
generateLocalTestData(100)

// 현재 데이터 확인
const data = JSON.parse(localStorage.getItem('test_phones_pagination_data'))
console.log(`총 ${data.length}개`)

// 데이터 삭제
localStorage.removeItem('test_phones_pagination_data')
```

### 🐛 문제 해결 (데이터가 안 보이는 경우)

**1. 로컬스토리지 확인**

개발자 도구(F12) → Console 탭:

```javascript
// 데이터가 있는지 확인
const data = localStorage.getItem('test_phones_pagination_data')
if (data) {
  const phones = JSON.parse(data)
  console.log(`✅ ${phones.length}개 데이터 있음`)
  console.log('첫 번째 데이터:', phones[0])
} else {
  console.log('❌ 데이터 없음 - 다시 생성하세요')
}
```

**2. 페이지 강제 새로고침**

- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

**3. 브라우저 콘솔 로그 확인**

/phones 페이지에서 콘솔에 다음과 같은 로그가 보여야 합니다:

```
🔍 [로컬스토리지] 키 확인: test_phones_pagination_data
🔍 [로컬스토리지] 100개 데이터 발견!
✅ 로컬스토리지에서 100개 데이터 발견! (페이지 1)
```

**4. 캐시 문제인 경우**

```javascript
// 데이터 삭제 후 재생성
localStorage.removeItem('test_phones_pagination_data')
// 그 다음 test-data-generator.html에서 다시 생성
```

---

## 테스트 데이터 생성 (Supabase 방식)

Supabase 데이터베이스에 직접 데이터를 생성합니다. (seller_id 필요)

### 설치

먼저 필요한 패키지를 설치하세요:

```bash
npm install
```

### 사용법

#### 기본 (100개 생성)

```bash
npm run generate:test-phones
```

또는 직접 실행:

```bash
npx tsx scripts/generate-test-phones.ts
```

#### 개수 지정

```bash
npx tsx scripts/generate-test-phones.ts 50
```

### 주의사항

1. **환경 변수 확인**: 
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 또는 `NEXT_PUBLIC_SUPABASE_KEY`
   
   이 값들이 `.env.local` 파일에 설정되어 있어야 합니다.

2. **seller_id 수정**: 
   스크립트의 `seller_id`를 실제 사용자 ID로 변경해야 할 수 있습니다.
   현재는 테스트용 UUID를 사용하고 있습니다.

3. **데이터 삭제**: 
   아래의 삭제 스크립트를 사용하거나, Supabase 대시보드에서 직접 삭제할 수 있습니다.
   (삭제 스크립트는 아래 "테스트 데이터 삭제" 섹션 참고)

### 생성되는 데이터

- 다양한 모델명 (iPhone, Galaxy, Pixel 등)
- 다양한 저장 용량 (128GB, 256GB, 512GB, 1TB)
- 다양한 상태 (S급, A급, B급, C급)
- 다양한 판매 상태 (available, reserved, sold)
- 다양한 지역 (서울, 경기, 인천 등)
- 랜덤 가격 (50만원 ~ 200만원)
- 시간순 정렬을 위한 created_at (최신순)

## 테스트 데이터 삭제

생성된 테스트 데이터를 간편하게 삭제할 수 있습니다.

### 사용법

#### 기본 (테스트용 seller_id로 생성된 데이터 삭제)

```bash
npm run cleanup:test-phones
```

또는 직접 실행:

```bash
npx tsx scripts/cleanup-test-phones.ts
```

#### 특정 seller_id의 데이터 삭제

```bash
npx tsx scripts/cleanup-test-phones.ts [seller_id]
```

예시:
```bash
npx tsx scripts/cleanup-test-phones.ts 12345678-1234-1234-1234-123456789abc
```

### 작동 방식

1. 지정된 `seller_id`에 해당하는 모든 데이터를 조회
2. 삭제 전 개수를 표시
3. 데이터 삭제 실행
4. 삭제 후 결과 확인 및 표시

### 주의사항

⚠️ **주의**: 이 작업은 되돌릴 수 없습니다. 실행 전에 신중하게 확인하세요.

## ⚡ 빠른 시작 가이드

### 방법 1: 로컬스토리지 (추천! ⭐)

가장 간단하고 빠른 방법입니다:

```bash
# 1. HTML 생성기 생성
npm run generate:local-test-data

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 http://localhost:3000/test-data-generator.html 접속

# 4. "데이터 생성" 버튼 클릭

# 5. /phones 페이지에서 페이지네이션 테스트

# 6. 완료 후 "데이터 삭제" 버튼으로 정리
```

### 방법 2: Supabase (실제 데이터베이스 테스트)

실제 Supabase 환경에서 테스트하려면:

1. **테스트 데이터 생성** (100개)
   ```bash
   npm run generate:test-phones
   ```

2. **페이지네이션 테스트 실행**
   - 개발 서버 실행: `npm run dev`
   - 브라우저에서 `/phones` 페이지 접속
   - 페이지 이동 버튼으로 페이지네이션 동작 확인

3. **테스트 데이터 삭제** (테스트 완료 후)
   ```bash
   npm run cleanup:test-phones
   ```

### 다양한 시나리오 테스트

#### 소량 데이터 테스트 (20개)
```bash
npx tsx scripts/generate-test-phones.ts 20
```

#### 대량 데이터 테스트 (500개)
```bash
npx tsx scripts/generate-test-phones.ts 500
```

#### 데이터 초기화 후 재생성
```bash
npm run cleanup:test-phones && npm run generate:test-phones
```

