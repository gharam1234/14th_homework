// URL 경로 및 관련 유틸을 단일 파일에서 관리하기 위한 모듈
// - 요구사항 요약:
//   1) 로그인:            /auth/login,     [누구나],     banner X, navigation X
//   2) 회원가입:          /auth/signup,    [누구나],     banner X, navigation X
//   3) 게시글목록:        /boards,         [회원전용],   banner O, navigation O
//   4) 게시글상세:        /boards/[BoardId],[회원전용],  banner O, navigation O
//   5) 게시글쓰기:        /boards/new,     [회원전용],   banner X, navigation X
//   6) 게시글수정:        /boards/[BoardId]/edit, [회원전용], banner X, navigation X

// 접근 가능 상태 타입 (요구사항: 누구나, 회원전용)
export type AccessState = 'PUBLIC' | 'MEMBER_ONLY'

// 라우트 설정에 대한 타입 정의
export interface RouteConfig {
  // 사람이 읽기 쉬운 라우트 명 (디버깅/로그용)
  readonly name: string
  // Next.js App Router 경로 템플릿 (동적 세그먼트 포함 가능)
  readonly pathTemplate: string
  // 접근 제어 상태
  readonly access: AccessState
  // 배너 노출 여부
  readonly showBanner: boolean
  // 네비게이션 노출 여부
  readonly showNavigation: boolean
}

// 동적 세그먼트 치환 유틸
// - 템플릿 내 [BoardId] 또는 [boardId] 와 같은 패턴을 params로 치환
// - 다른 동적 파라미터 추가 시, params 키와 일치하는 대괄호 플레이스홀더를 치환하도록 일반화
function buildPathFromTemplate(pathTemplate: string, params?: Record<string, string | number>): string {
  // params가 없으면 템플릿을 그대로 반환
  if (!params || Object.keys(params).length === 0) return pathTemplate

  // 대괄호 포함 동적 세그먼트 치환: [Key] -> params[Key]
  // 대소문자 혼용 키까지 대응하기 위해, 템플릿에서 대괄호 키를 추출하고 매칭 시 소문자 비교를 병행
  return pathTemplate.replace(/\[(.+?)\]/g, (match, rawKey) => {
    const lowered = String(rawKey).toLowerCase()
    // params 키 중 소문자 비교로 일치 항목 찾기
    const foundKey = Object.keys(params).find((k) => k.toLowerCase() === lowered)
    if (!foundKey) return match // 일치 키가 없으면 원문 유지
    const value = params[foundKey]
    return encodeURIComponent(String(value))
  })
}

// 라우트 테이블: 모든 라우트의 메타 정보를 한곳에서 관리
export const URLS = {
  AUTH_LOGIN: {
    name: '로그인',
    pathTemplate: '/auth/login',
    access: 'PUBLIC',
    showBanner: false,
    showNavigation: false,
  },
  AUTH_SIGNUP: {
    name: '회원가입',
    pathTemplate: '/auth/signup',
    access: 'PUBLIC',
    showBanner: false,
    showNavigation: false,
  },
  BOARDS_LIST: {
    name: '게시글목록',
    pathTemplate: '/boards',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },
  BOARD_DETAIL: {
    name: '게시글상세',
    pathTemplate: '/boards/[BoardId]',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },
  BOARD_NEW: {
    name: '게시글쓰기',
    pathTemplate: '/boards/new',
    access: 'MEMBER_ONLY',
    showBanner: false,
    showNavigation: false,
  },
  BOARD_EDIT: {
    name: '게시글수정',
    pathTemplate: '/boards/[BoardId]/edit',
    access: 'MEMBER_ONLY',
    showBanner: false,
    showNavigation: false,
  },
} as const satisfies Record<string, RouteConfig>

export type RouteKey = keyof typeof URLS

// 키로 경로 문자열을 가져오기 (동적 파라미터 자동 치환)
export function getPath(key: RouteKey, params?: Record<string, string | number>): string {
  const cfg = URLS[key]
  return buildPathFromTemplate(cfg.pathTemplate, params)
}

// Link 컴포넌트 등에서 사용하기 위한 경로 헬퍼 (가독성 목적의 별칭)
export const linkTo = getPath

// 배너/네비게이션 가시성 조회 유틸
export function isBannerVisible(key: RouteKey): boolean {
  return URLS[key].showBanner
}

export function isNavigationVisible(key: RouteKey): boolean {
  return URLS[key].showNavigation
}

// 접근 가능 여부 검사 유틸
// - isAuthenticated: 사용자 로그인 여부
export function isAccessible(key: RouteKey, isAuthenticated: boolean): boolean {
  const cfg = URLS[key]
  if (cfg.access === 'PUBLIC') return true
  return isAuthenticated
}

// 라우트 메타 정보 조회 유틸 (필요 시 소비 측에서 배너/네비/접근권한을 한 번에 사용)
export function getRouteMeta(key: RouteKey): RouteConfig {
  return URLS[key]
}


