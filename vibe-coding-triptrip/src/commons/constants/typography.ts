// 타이포그래피 토큰 정의
// 주의: 모든 주석은 한국어로 작성합니다.

// 폰트 패밀리: 국문/영문을 분리하여 추후 확장 가능하도록 구성
export const FONT_FAMILY = {
  // 국문 폰트 패밀리
  ko: "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', Arial, Helvetica, sans-serif",
  // 영문 폰트 패밀리
  en: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Arial, Helvetica, sans-serif",
} as const;

// 반응형 기준치: 프로젝트 공통 브레이크포인트
export const BREAKPOINT = {
  // 모바일 최대 폭(px)
  mobileMax: 767,
  // 데스크톱 최소 폭(px)
  desktopMin: 768,
} as const;

// 개별 텍스트 스타일의 속성 타입
export type TextStyle = {
  fontSize: string; // 예: '16px'
  lineHeight: string; // 예: '24px' 또는 '1.5'
  fontWeight: number; // 예: 400, 500, 700
  letterSpacing?: string; // 예: '-0.02em'
};

// 타이포그래피 스케일: 데스크톱/모바일 각기 정의
// 이름 체계는 프로젝트 전역 재사용을 고려하여 의미 중심으로 구성
const DESKTOP: Record<string, TextStyle> = {
  // 디스플레이 계열
  displayLg: { fontSize: '48px', lineHeight: '60px', fontWeight: 700, letterSpacing: '-0.02em' },
  displayMd: { fontSize: '40px', lineHeight: '52px', fontWeight: 700, letterSpacing: '-0.02em' },
  displaySm: { fontSize: '32px', lineHeight: '44px', fontWeight: 700, letterSpacing: '-0.01em' },

  // 제목 계열
  headingXl: { fontSize: '28px', lineHeight: '38px', fontWeight: 700 },
  headingLg: { fontSize: '24px', lineHeight: '34px', fontWeight: 700 },
  headingMd: { fontSize: '20px', lineHeight: '30px', fontWeight: 600 },
  headingSm: { fontSize: '18px', lineHeight: '28px', fontWeight: 600 },

  // 본문/캡션/라벨
  bodyLg: { fontSize: '18px', lineHeight: '28px', fontWeight: 400 },
  bodyMd: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
  bodySm: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
  label: { fontSize: '12px', lineHeight: '16px', fontWeight: 500, letterSpacing: '0.02em' },
  caption: { fontSize: '12px', lineHeight: '16px', fontWeight: 400, letterSpacing: '0.01em' },
};

const MOBILE: Record<string, TextStyle> = {
  // 디스플레이 계열
  displayLg: { fontSize: '36px', lineHeight: '44px', fontWeight: 700, letterSpacing: '-0.02em' },
  displayMd: { fontSize: '32px', lineHeight: '40px', fontWeight: 700, letterSpacing: '-0.02em' },
  displaySm: { fontSize: '28px', lineHeight: '36px', fontWeight: 700, letterSpacing: '-0.01em' },

  // 제목 계열
  headingXl: { fontSize: '24px', lineHeight: '32px', fontWeight: 700 },
  headingLg: { fontSize: '20px', lineHeight: '28px', fontWeight: 700 },
  headingMd: { fontSize: '18px', lineHeight: '26px', fontWeight: 600 },
  headingSm: { fontSize: '16px', lineHeight: '24px', fontWeight: 600 },

  // 본문/캡션/라벨
  bodyLg: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
  bodyMd: { fontSize: '15px', lineHeight: '22px', fontWeight: 400 },
  bodySm: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
  label: { fontSize: '12px', lineHeight: '16px', fontWeight: 500, letterSpacing: '0.02em' },
  caption: { fontSize: '12px', lineHeight: '16px', fontWeight: 400, letterSpacing: '0.01em' },
};

// 언어별 폰트 패밀리 매핑: 추후 영문 전용 스타일을 쉽게 분기하기 위함
export const LANGUAGE_FONT = {
  ko: FONT_FAMILY.ko,
  en: FONT_FAMILY.en,
} as const;

export type LanguageKey = keyof typeof LANGUAGE_FONT; // 'ko' | 'en'

// 최상위 토큰 오브젝트: 언어/브레이크포인트 별로 동일 키를 제공
export const TYPOGRAPHY = {
  // 국문 세트
  ko: {
    desktop: DESKTOP,
    mobile: MOBILE,
  },
  // 영문 세트 (기본은 동일 스케일, 필요 시 값 divergence 가능)
  en: {
    desktop: DESKTOP,
    mobile: MOBILE,
  },
} as const;

export type TypographyToken = typeof TYPOGRAPHY;

// 유틸리티: CSS 변수 이름 생성기 (예: --typo-desktop-bodyMd-fontSize)
export function buildCssVarName(scope: 'desktop' | 'mobile', key: string, prop: keyof TextStyle): string {
  return `--typo-${scope}-${key}-${prop}`;
}

// 유틸리티: 주어진 스타일 셋을 CSS 변수 레코드로 변환
export function toCssVariables(scope: 'desktop' | 'mobile', set: Record<string, TextStyle>): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(set).forEach(([key, style]) => {
    result[buildCssVarName(scope, key, 'fontSize')] = style.fontSize;
    result[buildCssVarName(scope, key, 'lineHeight')] = style.lineHeight;
    result[buildCssVarName(scope, key, 'fontWeight')] = String(style.fontWeight);
    if (style.letterSpacing) {
      result[buildCssVarName(scope, key, 'letterSpacing')] = style.letterSpacing;
    }
  });
  return result;
}


