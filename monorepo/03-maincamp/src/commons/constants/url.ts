/**
 * URL 라우트 설정 및 유틸 함수
 * 애플리케이션의 모든 라우트를 중앙에서 관리하는 파일
 */

// ============================================
// 타입 정의
// ============================================

/**
 * 접근 권한 상태
 * - PUBLIC: 누구나 접근 가능
 * - MEMBER_ONLY: 회원만 접근 가능
 */
export type AccessState = 'PUBLIC' | 'MEMBER_ONLY';

/**
 * 네비게이션 메뉴 항목
 */
export interface NavigationMenuItem {
  menuId: string;      // 메뉴 고유 ID (kebab-case)
  label: string;       // 메뉴에 표시될 텍스트 (한국어)
  path: string;        // 메뉴 클릭 시 이동할 경로
  order: number;       // 메뉴 표시 순서
}

/**
 * 라우트 설정
 */
export interface RouteConfig {
  name: string;                    // 라우트 이름 (한국어)
  pathTemplate: string;            // 경로 템플릿 (동적 세그먼트 포함)
  access: AccessState;             // 접근 권한
  showBanner: boolean;             // 배너 표시 여부
  showNavigation: boolean;         // 네비게이션 표시 여부
  navigationMenu?: {               // 네비게이션 메뉴 정보 (선택)
    menuId: string;
    label: string;
    order: number;
  };
}

/**
 * 모든 라우트의 키 타입
 */
export type RouteKey =
  | 'HOME'
  | 'LOGIN'
  | 'SIGNUP'
  | 'BOARDS_LIST'
  | 'BOARD_DETAIL'
  | 'BOARD_EDIT'
  | 'BOARD_CREATE'
  | 'PHONES_LIST'
  | 'PHONE_DETAIL'
  | 'PHONE_EDIT'
  | 'PHONE_CREATE'
  | 'MY_APIS_LIST'
  | 'MY_API_DETAIL'
  | 'MY_API_EDIT'
  | 'MY_API_CREATE'
  | 'OPEN_APIS_LIST'
  | 'MY_PAGE';

// ============================================
// 라우트 설정 객체
// ============================================

/**
 * 모든 라우트의 설정을 정의하는 객체
 * 각 라우트는 접근 권한, 배너/네비게이션 표시 여부, 네비게이션 메뉴 정보를 포함
 */
export const URLS: Record<RouteKey, RouteConfig> = {
  // 홈
  HOME: {
    name: '홈',
    pathTemplate: '/',
    access: 'PUBLIC',
    showBanner: false,
    showNavigation: true,
    navigationMenu: {
      menuId: 'home',
      label: '홈',
      order: 1,
    },
  },

  // 로그인
  LOGIN: {
    name: '로그인',
    pathTemplate: '/',
    access: 'PUBLIC',
    showBanner: false,
    showNavigation: false,
  },

  // 회원가입
  SIGNUP: {
    name: '회원가입',
    pathTemplate: '/signup',
    access: 'PUBLIC',
    showBanner: false,
    showNavigation: true,
  },

  // 게시글 목록
  BOARDS_LIST: {
    name: '게시글 목록',
    pathTemplate: '/boards',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
    navigationMenu: {
      menuId: 'boards',
      label: '게시글',
      order: 2,
    },
  },

  // 게시글 상세
  BOARD_DETAIL: {
    name: '게시글 상세',
    pathTemplate: '/boards/[boardId]',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },

  // 게시글 수정
  BOARD_EDIT: {
    name: '게시글 수정',
    pathTemplate: '/boards/[boardId]/edit',
    access: 'MEMBER_ONLY',
    showBanner: false,
    showNavigation: true,
  },

  // 게시글 작성
  BOARD_CREATE: {
    name: '게시글 작성',
    pathTemplate: '/boards/new',
    access: 'MEMBER_ONLY',
    showBanner: false,
    showNavigation: true,
  },

  // 중고폰 목록
  PHONES_LIST: {
    name: '중고폰 목록',
    pathTemplate: '/phones',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
    navigationMenu: {
      menuId: 'phones',
      label: '중고폰',
      order: 3,
    },
  },

  // 중고폰 상세
  PHONE_DETAIL: {
    name: '중고폰 상세',
    pathTemplate: '/phones/[id]',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },

  // 중고폰 수정
  PHONE_EDIT: {
    name: '중고폰 수정',
    pathTemplate: '/phones/[id]/edit',
    access: 'MEMBER_ONLY',
    showBanner: false,
    showNavigation: true,
  },

  // 중고폰 등록
  PHONE_CREATE: {
    name: '중고폰 등록',
    pathTemplate: '/phones/new',
    access: 'MEMBER_ONLY',
    showBanner: false,
    showNavigation: true,
  },

  // 내 API 목록
  MY_APIS_LIST: {
    name: '내 API 목록',
    pathTemplate: '/myapis',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
    navigationMenu: {
      menuId: 'my-apis',
      label: '내 API',
      order: 4,
    },
  },

  // 내 API 상세
  MY_API_DETAIL: {
    name: '내 API 상세',
    pathTemplate: '/myapis/[id]',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },

  // 내 API 수정
  MY_API_EDIT: {
    name: '내 API 수정',
    pathTemplate: '/myapis/[id]/edit',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },

  // 내 API 생성
  MY_API_CREATE: {
    name: '내 API 생성',
    pathTemplate: '/myapis/new',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
  },

  // 공개 API 목록
  OPEN_APIS_LIST: {
    name: '공개 API 목록',
    pathTemplate: '/openapis',
    access: 'PUBLIC',
    showBanner: true,
    showNavigation: true,
    navigationMenu: {
      menuId: 'open-apis',
      label: '공개 API',
      order: 5,
    },
  },

  // 마이페이지
  MY_PAGE: {
    name: '마이페이지',
    pathTemplate: '/mypage',
    access: 'MEMBER_ONLY',
    showBanner: true,
    showNavigation: true,
    navigationMenu: {
      menuId: 'my-page',
      label: '마이페이지',
      order: 6,
    },
  },
};

// ============================================
// 유틸 함수
// ============================================

/**
 * 동적 세그먼트를 포함한 경로를 생성
 * 예: getPath('BOARD_DETAIL', { boardId: 123 }) → '/boards/123'
 *
 * @param key 라우트 키
 * @param params 동적 세그먼트 값 (선택)
 * @returns 완성된 경로
 */
export function getPath(
  key: RouteKey,
  params?: Record<string, string | number>
): string {
  const route = URLS[key];

  if (!params) {
    return route.pathTemplate;
  }

  let path = route.pathTemplate;

  // 동적 세그먼트를 실제 값으로 치환
  // [boardId] → params.boardId의 값으로 변경
  Object.entries(params).forEach(([paramKey, value]) => {
    const pattern = `[${paramKey}]`;
    path = path.replace(pattern, String(value));
  });

  return path;
}

/**
 * 사용자가 해당 라우트에 접근 가능한지 확인
 *
 * @param key 라우트 키
 * @param isAuthenticated 인증 여부
 * @returns 접근 가능 여부
 */
export function isAccessible(
  key: RouteKey,
  isAuthenticated: boolean
): boolean {
  const route = URLS[key];

  if (route.access === 'PUBLIC') {
    return true;
  }

  // MEMBER_ONLY인 경우
  return isAuthenticated;
}

/**
 * 해당 라우트에서 배너를 표시할지 확인
 *
 * @param key 라우트 키
 * @returns 배너 표시 여부
 */
export function isBannerVisible(key: RouteKey): boolean {
  const route = URLS[key];
  return route.showBanner;
}

/**
 * 해당 라우트에서 네비게이션을 표시할지 확인
 *
 * @param key 라우트 키
 * @returns 네비게이션 표시 여부
 */
export function isNavigationVisible(key: RouteKey): boolean {
  const route = URLS[key];
  return route.showNavigation;
}

/**
 * 현재 경로로부터 라우트 키 찾기 (동적 세그먼트 매칭)
 * 예: findRouteKeyByPath('/boards/123') → 'BOARD_DETAIL'
 *
 * @param pathname 현재 경로
 * @returns 일치하는 라우트 키 (없으면 undefined)
 */
export function findRouteKeyByPath(pathname: string): RouteKey | undefined {
  return (Object.entries(URLS) as [RouteKey, RouteConfig][]).find(
    ([_, route]) => {
      // 정확한 매칭 확인
      if (route.pathTemplate === pathname) {
        return true;
      }

      // 동적 세그먼트 매칭 확인
      const pattern = route.pathTemplate
        .split('/')
        .map((segment) => {
          // [segmentName] → 정규식 패턴으로 변환
          if (segment.startsWith('[') && segment.endsWith(']')) {
            return '[^/]+';
          }
          return segment;
        })
        .join('/');

      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
  )?.[0];
}

/**
 * 네비게이션 메뉴 항목을 order 순서대로 정렬하여 반환
 * 컴포넌트에서 네비게이션 메뉴를 렌더링할 때 사용
 *
 * @returns order 순서로 정렬된 네비게이션 메뉴 항목 배열
 */
export function getNavigationMenuItems(): NavigationMenuItem[] {
  return (Object.entries(URLS) as [RouteKey, RouteConfig][])
    .filter(([_, route]) => route.navigationMenu)
    .map(([key, route]) => ({
      menuId: route.navigationMenu!.menuId,
      label: route.navigationMenu!.label,
      path: getPath(key),
      order: route.navigationMenu!.order,
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * 특정 라우트의 메타정보 조회
 *
 * @param key 라우트 키
 * @returns 라우트 설정 정보
 */
export function getRouteMeta(key: RouteKey): RouteConfig {
  return URLS[key];
}
