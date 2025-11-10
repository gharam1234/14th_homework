/**
 * 프롬프트 자동 생성 설정
 * 새로운 컴포넌트 생성 시 필요한 프롬프트 파일들을 자동으로 생성합니다.
 *
 * 개발 순서 체계:
 * - 100번대: UI 기초 단계 (UI → Validation → Feature → ...)
 * - 200번대: 상세 기능/추가 UI (Detail UI → Sub-features)
 * - 300번대: 리스트/네비게이션 (List UI → Filters → Search → Routing)
 * - 400번대: 훅/로직/유틸 (Custom Hooks → Logic → Utils)
 */

export interface PromptTemplate {
  /** 파일명 시리즈 번호 (100, 101, 102, ...) */
  series: number;
  /** 파일명 설명 부분 (ui, form-validation, hook 등) */
  name: string;
  /** 한글 설명 */
  description: string;
  /** 적용할 커서 규칙 @reference */
  rules: string[];
  /** 프롬프트 템플릿 함수 */
  template: (context: ComponentContext) => string;
}

export interface ComponentContext {
  /** 컴포넌트명 (phone-new, phone-detail 등) */
  componentName: string;
  /** 컴포넌트 카테고리 (page, detail, list, card 등) */
  componentCategory: string;
  /** 한글 설명 (예: "중고폰 판매 등록") */
  description: string;
  /** 피그마 채널명 */
  figmaChannel?: string;
  /** 피그마 노드 ID */
  figmaNodeId?: string;
  /** 컴포넌트 관련 주요 필드들 */
  fields?: string[];
  /** 기타 커스텀 설정 */
  customConfig?: Record<string, any>;
}

export interface ComponentType {
  /** 컴포넌트 타입명 (page, detail, list 등) */
  type: string;
  /** 한글 설명 */
  category: string;
  /** 이 타입에 필요한 프롬프트 템플릿들 */
  prompts: PromptTemplate[];
}

/**
 * 페이지/폼 컴포넌트 (phone-new 등)
 * 개발 순서: UI → Validation → Features → Routing → Custom Hooks
 */
export const pageComponentType: ComponentType = {
  type: "page",
  category: "페이지/폼 컴포넌트",
  prompts: [
    {
      series: 101,
      name: "ui",
      description: "기본 UI 레이아웃",
      rules: ["@01-common.mdc", "@02-wireframe.mdc", "@03-ui.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css

조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId || "TODO: 노드ID 입력"}
            - 설명: ${ctx.description}

==============================================

핵심요구사항) Figma 디자인을 기존 컴포넌트에 그대로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 102,
      name: "form-validation",
      description: "폼 검증 UI",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 참고할 파일경로: src/components/${ctx.componentName}/hooks/index.form.hook.ts
조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.form.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 폼 검증 UI를 다음과 같이 구현할 것. (react-hook-form 기반)

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 103,
      name: "image-upload",
      description: "이미지 업로드 기능",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 참고할 PAGE 경로: src/app/(protected)/${ctx.componentName}/page.tsx
조건-파일경로) 구현될 HOOK 경로: src/components/${ctx.componentName}/hooks/index.image.hook.ts
조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.image.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 이미지 업로드 기능을 다음과 같이 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 104,
      name: "address-search",
      description: "주소 검색 기능",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 참고할 파일경로: src/components/${ctx.componentName}/hooks/index.address.hook.ts
조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.address.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 주소 검색 기능을 다음과 같이 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 105,
      name: "routing",
      description: "라우팅 및 네비게이션",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 참고할 파일경로: src/components/${ctx.componentName}/hooks/index.routing.hook.ts
조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.routing.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 라우팅 및 네비게이션을 다음과 같이 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
  ],
};

/**
 * 상세 화면 컴포넌트 (phone-detail 등)
 * 개발 순서: UI → Sub-components → 기능별 훅들
 */
export const detailComponentType: ComponentType = {
  type: "detail",
  category: "상세 화면 컴포넌트",
  prompts: [
    {
      series: 201,
      name: "ui",
      description: "상세 화면 UI",
      rules: ["@01-common.mdc", "@02-wireframe.mdc", "@03-ui.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css

조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId || "TODO: 노드ID 입력"}
            - 설명: ${ctx.description}

==============================================

핵심요구사항) ${ctx.description}을(를) Figma 디자인 기준으로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 202,
      name: "sub-component",
      description: "서브 컴포넌트 구현",
      rules: ["@01-common.mdc", "@02-wireframe.mdc", "@03-ui.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 컴포넌트 폴더: src/components/${ctx.componentName}/

==============================================

핵심요구사항) 다음의 서브 컴포넌트들을 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 401,
      name: "custom-hook",
      description: "커스텀 훅",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 구현될 HOOK 파일경로: src/components/${ctx.componentName}/hooks/index.[FEATURE].hook.ts
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.[FEATURE].hook.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) ${ctx.componentName} 컴포넌트의 기능을 관리하는 커스텀 훅을 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
  ],
};

/**
 * 리스트 컴포넌트 (phones-list 등)
 * 개발 순서: UI → 필터/탭 → 검색 → 라우팅
 */
export const listComponentType: ComponentType = {
  type: "list",
  category: "리스트 컴포넌트",
  prompts: [
    {
      series: 301,
      name: "ui",
      description: "리스트 UI",
      rules: ["@01-common.mdc", "@02-wireframe.mdc", "@03-ui.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css

조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId || "TODO: 노드ID 입력"}
            - 설명: ${ctx.description}

==============================================

핵심요구사항) ${ctx.description}을(를) Figma 디자인 기준으로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 302,
      name: "tabs-filters",
      description: "탭 및 필터 기능",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.filters.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 탭 및 필터 기능을 다음과 같이 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 303,
      name: "search-filter",
      description: "검색 및 가격 필터",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.search.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 검색 및 필터 기능을 다음과 같이 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 304,
      name: "card-routing",
      description: "카드 라우팅",
      rules: ["@01-common.mdc", "@04-func.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 TEST 파일경로: src/components/${ctx.componentName}/tests/index.routing.spec.ts

핵심요구사항-테스트) Playwright를 활용한 TDD 기반 구현
                1) 테스트 라이브러리 제외 사항
                    - jest 제외
                    - @testing-library/react 제외

                2) 테스트 설정 요구사항
                    - timeout: 500ms 미만 (또는 미설정)
                    - 페이지 완전 로드 후 테스트 실행
                    - 페이지 로드 식별: data-testid 속성 대기 방식 사용
                    - **금지**: networkidle 대기 방식 사용 금지

                3) TDD 기반 개발 절차
                    - 테스트 작성 → 구현 → 테스트 통과 반복

==============================================

핵심요구사항) 카드 클릭 시 상세 페이지로 라우팅하는 기능을 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
  ],
};

/**
 * UI 컴포넌트 (Button, Input, Modal 등)
 */
export const uiComponentType: ComponentType = {
  type: "ui",
  category: "UI 공용 컴포넌트",
  prompts: [
    {
      series: 101,
      name: "ui",
      description: "UI 컴포넌트",
      rules: ["@01-common.mdc", "@02-wireframe.mdc", "@03-ui.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/commons/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/commons/components/${ctx.componentName}/styles.module.css
조건-파일경로) 구현될 Storybook 파일경로: src/commons/components/${ctx.componentName}/index.stories.tsx

조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId || "TODO: 노드ID 입력"}
            - 설명: ${ctx.description}

==============================================

핵심요구사항) ${ctx.description}을(를) Figma 디자인 기준으로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 102,
      name: "storybook",
      description: "Storybook 스토리",
      rules: ["@01-common.mdc"],
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-파일경로) 구현될 Storybook 파일경로: src/commons/components/${ctx.componentName}/index.stories.tsx

==============================================

핵심요구사항) ${ctx.componentName} 컴포넌트의 Storybook 스토리를 작성할 것.

[프롬프트 내용 추가 필요]
`,
    },
  ],
};

/** 지원하는 모든 컴포넌트 타입 */
export const componentTypes = [
  pageComponentType,
  detailComponentType,
  listComponentType,
  uiComponentType,
];

export const getComponentType = (type: string): ComponentType | undefined => {
  return componentTypes.find((ct) => ct.type === type);
};
