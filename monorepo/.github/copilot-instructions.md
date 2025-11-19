# AI 코딩 에이전트 가이드

## 프로젝트 구조

**pnpm 모노레포** 구조로 두 개의 워크스페이스로 구성:
- `@commons/ui` - 공유 UI 컴포넌트 라이브러리
- `03-maincamp` - 메인 Next.js 14 애플리케이션 (App Router)

메인 앱 기술 스택:
- **Next.js 14** (App Router) with TypeScript
- **Apollo Client** - GraphQL API 통신
- **Supabase** - 데이터베이스 및 인증
- **Zustand** - 전역 상태 관리 (persist 미들웨어 포함)
- **Playwright** - E2E 테스팅 (Jest나 React Testing Library 사용 금지)
- **react-hook-form + Zod** - 폼 검증
- **CSS Modules** 전용 (컴포넌트에서 Tailwind 사용 금지, :global, :root, !important 금지)

## 라우팅 및 네비게이션 규칙 (필수)

### 중앙 집중식 라우트 관리
**절대로 라우트를 하드코딩하지 말 것.** 모든 네비게이션은 `src/commons/constants/url.ts`를 사용:

```typescript
import { getPath } from '@/commons/constants/url';

// ✅ 올바른 방법
router.push(getPath('PHONES_LIST'));
router.push(getPath('PHONE_DETAIL', { id: '123' }));

// ❌ 잘못된 방법
router.push('/phones');
router.push(`/phones/${id}`);
```

### 인증 HOC
- **보호된 라우트**: `(protected)/layout.tsx`에서 `withAuth` HOC 사용
- **공개 라우트**: `(public)/layout.tsx`에서 `withAuthLogin` HOC 사용
- **중요**: HOC는 `localStorage.getItem("accessToken")`을 체크함 - useEffect 내부에 무한 루프를 유발하는 리다이렉트 로직 추가 금지

## 상태 관리 패턴

### Zustand with Persistence
스토어 패턴 (`src/stores/filterStore.ts` 참고):

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useFilterStore = create()(
  persist(
    (set) => ({
      // State
      availableNow: true,
      // Actions
      setAvailableNow: (value) => set({ availableNow: value }),
    }),
    {
      name: 'phone-filters',
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);
```

**무한 루프 방지**: useEffect에서 Zustand 스토어와 로컬 상태를 동기화하지 말 것. Zustand를 단일 진실 공급원(single source of truth)으로 사용할 것.

## 컴포넌트 구조 및 훅

### 훅 조직화
컴포넌트는 엄격한 훅 기반 아키텍처를 따름:

```
src/components/[feature]/
  ├── index.tsx              # 프레젠테이션 컴포넌트
  ├── types.ts               # TypeScript 인터페이스
  ├── styles.module.css      # CSS Module (flexbox만 사용, position:absolute 금지)
  ├── hooks/
  │   ├── index.*.hook.ts    # 기능별 훅 (routing, forms, api)
  ├── tests/
  │   └── *.spec.ts          # Playwright 테스트
  └── prompts/
      └── prompt.*.txt       # 구현 요구사항
```

**핵심 원칙**:
- 각 기능 훅은 **자체 완결적** - 교차 의존성 없음
- useState/useEffect 사용 최소화
- 모달은 react-portal 사용 (commons에 이미 설정됨)

## Playwright 테스팅

### 테스트 요구사항 (엄수)
```typescript
// ✅ 올바른 방법 - data-testid 셀렉터 사용
await page.locator('[data-testid="search-button"]').click();

// ❌ 잘못된 방법 - CSS 클래스 사용 금지 (CSS Modules와 충돌)
await page.locator('.search-button').click();

// ✅ 올바른 방법 - 특정 요소 대기
await page.waitForSelector('[data-testid="phones-list"]', { timeout: 400 });

// ❌ 잘못된 방법 - networkidle 절대 사용 금지
await page.waitForLoadState('networkidle'); // 금지됨
```

### 테스트 명령어
```bash
pnpm test          # 모든 테스트 실행
pnpm test:ui       # UI 모드로 실행
pnpm test:debug    # 디버그 모드
```

**타임아웃 규칙**:
- `{ timeout: 400 }` 사용하거나 최대 2000ms 이하
- 임의의 타임아웃보다 요소 대기 선호
- 실제 API 데이터 사용, 목(mock) 데이터 사용 금지

## 폼 처리 패턴

폼은 반드시 react-hook-form + Zod 사용:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## CSS Module 규칙

**엄격한 규칙** (`02-wireframe.mdc` 기준):
- CSS Modules만 사용 (`src/app/globals.css` 제외하고 전역 스타일 금지)
- 부모-자식 flexbox 레이아웃 (`position: absolute` 금지)
- `:global`, `:root`, `!important` 사용 금지
- Figma 디자인 제공 시 정확히 일치시킬 것
- 에셋: `public/icons/*`와 `public/images/*`

## API 통합

### GraphQL (Apollo Client)
`@/commons/setttings/apollo-setting`에 이미 설정됨. codegen 사용:

```bash
pnpm codegen  # GraphQL 스키마에서 타입 생성
```

### Supabase
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 피해야 할 흔한 실수

1. **무한 루프**: useEffect에서 Zustand 상태를 로컬 useState와 동기화하지 말 것
2. **라우트 하드코딩**: 항상 url.ts의 `getPath()` 사용
3. **테스트 셀렉터**: 항상 `data-testid` 사용, CSS 클래스 사용 금지
4. **CSS 위반**: CSS 모듈에서 :global, :root, !important 사용 금지
5. **라이브러리 설치**: Jest, @testing-library/react 또는 목록에 없는 라이브러리 설치 금지
6. **HOC 리다이렉트**: 리렌더링을 유발하는 네비게이션 로직을 auth HOC에 추가하지 말 것

## 개발 명령어

```bash
pnpm dev          # 개발 서버 시작 (포트 3000, 사용 중이면 3001)
pnpm build        # 프로덕션 빌드
pnpm codegen      # GraphQL 타입 생성
pnpm test         # Playwright 테스트 실행
```

## 파일별 주의사항

- `playwright.config.ts`: 수정 금지 - 테스팅 설정이 완료됨
- 패키지 버전: 라이브러리 업데이트 제안 전 `package.json` 확인
- `.cursor/rules/*.mdc`의 커서 규칙에 특정 기능에 대한 상세한 구현 요구사항 포함됨
