#!/usr/bin/env node

/**
 * 프롬프트 자동 생성 스크립트
 *
 * 사용법:
 *   node .cursor/prompt-generator.js <componentType> <componentName> <description> [options]
 *
 * 예시:
 *   node .cursor/prompt-generator.js page phone-new "중고폰 판매 등록"
 *   node .cursor/prompt-generator.js detail phone-detail "중고폰 상세" --figma-channel="메인캠프" --figma-node-id="285:31826"
 *   node .cursor/prompt-generator.js list phones-list "중고폰 목록"
 *
 * 옵션:
 *   --figma-channel <채널명>    피그마 채널명 (기본값: "메인캠프")
 *   --figma-node-id <노드ID>    피그마 노드 ID (예: "285:31826")
 *   --help                       도움말 표시
 */

const fs = require("fs");
const path = require("path");

// ============================================================================
// 설정 데이터 (TypeScript 파일과 동일)
// ============================================================================

const pageComponentType = {
  type: "page",
  category: "페이지/폼 컴포넌트",
  prompts: [
    {
      series: 101,
      name: "ui",
      description: "기본 UI 레이아웃",
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css

${
  ctx.figmaNodeId
    ? `조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId}
            - 설명: ${ctx.description}`
    : ""
}

==============================================

핵심요구사항) Figma 디자인을 기존 컴포넌트에 그대로 구현할 것.
                - 기존 코드의 form 구조, hooks, types, validation은 유지할 것.
                - 새로운 훅이나 state 추가는 하지 말 것.

[추가 구현 요구사항 및 필드 정보 입력 필요]
`,
    },
    {
      series: 102,
      name: "form-validation",
      description: "폼 검증 UI",
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
                1) 각 필드에 대한 에러 상태 표시
                    - 에러 발생 시 입력 필드에 errorBorder 스타일 적용
                    - 에러 메시지를 필드 아래에 빨간색으로 표시
                    - 에러 메시지 폰트: 12px, 색상: #d32f2f

                2) 필수 필드 표시
                    - 필드 라벨 옆에 빨간색 * 마크 표시

                3) 실시간 validation 피드백
                    - 필드 blur 이후 에러 표시
                    - 에러 내용: 필드별 규칙에 따른 메시지

[프롬프트 내용 추가 필요 - 구체적인 필드별 검증 규칙]
`,
    },
    {
      series: 103,
      name: "image-upload",
      description: "이미지 업로드 기능",
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
                1) 파일 선택 및 미리보기
                    - 버튼 클릭 시 파일 선택 다이얼로그 열기
                    - 이미지 파일만 선택 가능 (accept="image/*")
                    - 최대 2개까지만 업로드 가능

                2) 미리보기 표시
                    - 선택된 이미지를 160x160px 크기의 썸네일로 표시
                    - 각 이미지 우측 상단에 X 버튼(삭제 버튼) 표시

                3) 이미지 삭제
                    - X 버튼 클릭 시 해당 이미지 제거

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 104,
      name: "address-search",
      description: "주소 검색 기능",
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

const detailComponentType = {
  type: "detail",
  category: "상세 화면 컴포넌트",
  prompts: [
    {
      series: 201,
      name: "ui",
      description: "상세 화면 UI",
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css

${
  ctx.figmaNodeId
    ? `조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId}
            - 설명: ${ctx.description}`
    : ""
}

==============================================

핵심요구사항) ${ctx.description}을(를) Figma 디자인 기준으로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 202,
      name: "sub-component",
      description: "서브 컴포넌트 구현",
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

[프롬프트 내용 추가 필요 - 서브 컴포넌트 목록]
`,
    },
    {
      series: 401,
      name: "custom-hook",
      description: "커스텀 훅",
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

const listComponentType = {
  type: "list",
  category: "리스트 컴포넌트",
  prompts: [
    {
      series: 301,
      name: "ui",
      description: "리스트 UI",
      template: (ctx) => `아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

조건-파일경로) 구현될 TSX 파일경로: src/components/${ctx.componentName}/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/${ctx.componentName}/styles.module.css

${
  ctx.figmaNodeId
    ? `조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId}
            - 설명: ${ctx.description}`
    : ""
}

==============================================

핵심요구사항) ${ctx.description}을(를) Figma 디자인 기준으로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 302,
      name: "tabs-filters",
      description: "탭 및 필터 기능",
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

const uiComponentType = {
  type: "ui",
  category: "UI 공용 컴포넌트",
  prompts: [
    {
      series: 101,
      name: "ui",
      description: "UI 컴포넌트",
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

${
  ctx.figmaNodeId
    ? `조건-피그마) Figma 파일 정보
            - 채널명: ${ctx.figmaChannel || "메인캠프"}
            - 구현될 컴포넌트 노드ID: ${ctx.figmaNodeId}
            - 설명: ${ctx.description}`
    : ""
}

==============================================

핵심요구사항) ${ctx.description}을(를) Figma 디자인 기준으로 구현할 것.

[프롬프트 내용 추가 필요]
`,
    },
    {
      series: 102,
      name: "storybook",
      description: "Storybook 스토리",
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

const componentTypes = [
  pageComponentType,
  detailComponentType,
  listComponentType,
  uiComponentType,
];

// ============================================================================
// 유틸리티 함수
// ============================================================================

function getComponentType(type) {
  return componentTypes.find((ct) => ct.type === type);
}

function parseArgs(argv) {
  const args = {
    componentType: null,
    componentName: null,
    description: null,
    figmaChannel: "메인캠프",
    figmaNodeId: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help") {
      return { help: true };
    } else if (arg === "--figma-channel" && i + 1 < argv.length) {
      args.figmaChannel = argv[++i];
    } else if (arg === "--figma-node-id" && i + 1 < argv.length) {
      args.figmaNodeId = argv[++i];
    } else if (!arg.startsWith("--")) {
      if (!args.componentType) {
        args.componentType = arg;
      } else if (!args.componentName) {
        args.componentName = arg;
      } else if (!args.description) {
        args.description = arg;
      }
    }
  }

  return args;
}

function showHelp() {
  console.log(`
프롬프트 자동 생성 스크립트

사용법:
  node .cursor/prompt-generator.js <componentType> <componentName> <description> [options]

컴포넌트 타입:
  page                    페이지/폼 컴포넌트 (phone-new 등)
  detail                  상세 화면 컴포넌트 (phone-detail 등)
  list                    리스트 컴포넌트 (phones-list 등)
  ui                      UI 공용 컴포넌트 (Button, Input 등)

필수 인자:
  <componentType>         컴포넌트 타입 (page, detail, list, ui)
  <componentName>         컴포넌트명 (kebab-case: phone-new, phones-list)
  <description>           한글 설명 (예: "중고폰 판매 등록")

옵션:
  --figma-channel <채널명>    피그마 채널명 (기본값: "메인캠프")
  --figma-node-id <노드ID>    피그마 노드 ID (예: "285:31826")
  --help                      도움말 표시

예시:
  node .cursor/prompt-generator.js page phone-new "중고폰 판매 등록"
  node .cursor/prompt-generator.js detail phone-detail "중고폰 상세" \\
    --figma-channel="메인캠프" --figma-node-id="285:31826"
  node .cursor/prompt-generator.js list phones-list "중고폰 목록"
  node .cursor/prompt-generator.js ui button "버튼 컴포넌트"
`);
}

function createPromptFile(filePath, content) {
  const dir = path.dirname(filePath);

  // 디렉토리 생성
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 디렉토리 생성: ${dir}`);
  }

  // 파일 생성
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`📝 프롬프트 파일 생성: ${filePath}`);
}

function generatePrompts(args) {
  const componentType = getComponentType(args.componentType);

  if (!componentType) {
    console.error(`❌ 오류: 지원하지 않는 컴포넌트 타입 '${args.componentType}'`);
    console.error(`   지원하는 타입: ${componentTypes.map((t) => t.type).join(", ")}`);
    process.exit(1);
  }

  const context = {
    componentName: args.componentName,
    componentCategory: args.componentType,
    description: args.description,
    figmaChannel: args.figmaChannel,
    figmaNodeId: args.figmaNodeId,
  };

  console.log(`\n✨ 프롬프트 자동 생성`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📌 컴포넌트 타입: ${componentType.category}`);
  console.log(`📌 컴포넌트명: ${args.componentName}`);
  console.log(`📌 설명: ${args.description}`);
  console.log(`📌 생성될 프롬프트: ${componentType.prompts.length}개`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  let successCount = 0;

  for (const promptTemplate of componentType.prompts) {
    // 프롬프트 파일명 생성 (예: prompt.101.ui.txt)
    const fileName = `prompt.${promptTemplate.series}.${promptTemplate.name}.txt`;

    // 컴포넌트 타입에 따라 경로 결정
    let filePath;
    if (args.componentType === "ui") {
      filePath = path.join(
        __dirname,
        `../src/commons/components/${args.componentName}/prompts/${fileName}`
      );
    } else {
      filePath = path.join(
        __dirname,
        `../src/components/${args.componentName}/prompts/${fileName}`
      );
    }

    // 프롬프트 내용 생성
    const content = promptTemplate.template(context);

    // 파일 생성
    try {
      createPromptFile(filePath, content);
      successCount++;
    } catch (error) {
      console.error(`❌ 파일 생성 실패: ${filePath}`);
      console.error(`   에러: ${error.message}`);
    }
  }

  console.log(`\n✅ 완료! ${successCount}/${componentType.prompts.length}개 프롬프트 파일이 생성되었습니다.\n`);
  console.log(`다음 단계:`);
  console.log(`1. 생성된 프롬프트 파일들을 열고 필요한 세부 내용을 추가하세요.`);
  console.log(`2. 각 프롬프트는 순번 순서대로 작업하시면 됩니다.`);
  console.log(
    `3. [프롬프트 내용 추가 필요] 부분을 구체적인 요구사항으로 채워주세요.`
  );
}

// ============================================================================
// 메인 실행
// ============================================================================

const args = parseArgs(process.argv);

if (args.help || !args.componentType || !args.componentName || !args.description) {
  showHelp();
  process.exit(args.help ? 0 : 1);
}

generatePrompts(args);
