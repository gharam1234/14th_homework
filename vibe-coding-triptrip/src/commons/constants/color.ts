// 프로젝트 전역에서 사용할 색상 토큰 정의
// 주의: 주석은 한국어로 작성합니다.

export const COLOR = {
  // 기본 배경/전경
  background: '#ffffff',
  foreground: '#171717',

  // 텍스트
  text: {
    primary: '#1c1c1c',
    secondary: '#333333',
    tertiary: '#5f5f5f',
    quaternary: '#777777',
    placeholder: '#919191',
    inverse: '#ffffff',
  },

  // 경계/구분선/표면
  surface: {
    default: '#ffffff',
    subtle: '#f9f9f9',
    muted: '#f5f5f5',
    soft: '#f2f2f2',
    outline: '#e4e4e4',
  },

  // 액션/상태
  action: {
    primary: '#2974e5',
    onPrimary: '#ffffff',
    neutral: '#000000',
    onNeutral: '#ffffff',
  },

  // 피드백
  feedback: {
    danger: '#f66a6a',
  },

  // 유틸리티
  utility: {
    black: '#000000',
    white: '#ffffff',
    grayD9: '#d9d9d9',
  },
} as const;

export type ColorToken = typeof COLOR;


