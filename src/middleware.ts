import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 경로 배열
const PROTECTED_PATHS = [
  '/dashboard',
  '/vehicles',
  '/employees',
  '/companies',
  '/logs',
  '/permissions',
  '/profile'
];

// 인증된 사용자가 접근하면 대시보드로 리다이렉트되는 경로
const AUTH_REDIRECT_PATHS = [
  '/',
  '/login',
  '/register',
  '/about'
];

// 정적 파일 경로 패턴
const STATIC_FILE_PATTERN = /\.(js|css|svg|png|jpg|jpeg|gif|ico|json|woff|woff2|ttf|eot)$/;

// 미들웨어 핸들러
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 정적 파일 요청은 무시
  if (
    pathname.includes('/_next') || 
    pathname.includes('/api/') ||
    STATIC_FILE_PATTERN.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // Authorization 헤더에서 토큰 확인
  const authHeader = request.headers.get('Authorization');
  
  // 클라이언트에서 설정된 x-authorization 헤더를 통해 인증 토큰을 받아옴
  // 클라이언트에서 로컬 스토리지의 토큰을 이 헤더에 담아 전송해야 함
  const xAuthHeader = request.headers.get('x-authorization');
  
  // 헤더에서 토큰을 추출
  let token = null;
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  } else if (xAuthHeader) {
    token = xAuthHeader;
  }
  
  // 인증 상태 여부 (토큰이 있고 비어있지 않은 경우에만 인증됨)
  const isAuthenticated = !!token && token.length > 10; // 유효한 JWT 토큰은 일반적으로 길이가 깁니다
  
  console.log(`[Middleware] 경로: ${pathname}, 인증 여부: ${isAuthenticated}, 토큰: ${token ? '있음' : '없음'}`);
  
  // 인증이 필요한 경로에 접근하려고 할 때 + 인증되지 않은 상태 => 로그인 페이지로 리다이렉트
  const needsAuth = PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  if (needsAuth && !isAuthenticated) {
    console.log(`[Middleware] 인증되지 않은 사용자가 보호된 경로 접근: ${pathname} -> /login으로 리다이렉트`);
    
    // 로그인 페이지로 리다이렉트할 때 특별한 쿼리 파라미터 추가
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    url.searchParams.set('silent', 'true'); // 내부 처리용 플래그
    
    // 리다이렉트 응답 생성
    const response = NextResponse.redirect(url);
    
    // 응답 헤더에 인증 상태 정보 추가
    response.headers.set('x-authenticated', 'false');
    response.headers.set('x-redirect', 'true');
    
    return response;
  }
  
  // 인증된 사용자가 로그인/회원가입 페이지에 접근하면 대시보드로 리다이렉트
  const isPublicAuth = AUTH_REDIRECT_PATHS.some(path => pathname === path);
  if (isPublicAuth && isAuthenticated) {
    console.log(`[Middleware] 인증된 사용자가 로그인/회원가입 페이지 접근: ${pathname} -> /dashboard로 리다이렉트`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 인증 상태를 다음 응답에 전달
  const response = NextResponse.next();
  
  // 원래 요청을 수정하지 않으면서 응답 헤더에 인증 상태 정보 추가
  response.headers.set('x-authenticated', isAuthenticated ? 'true' : 'false');
  
  return response;
}

// 미들웨어가 적용될 경로 구성
export const config = {
  // 모든 경로에 적용 (API 및 정적 파일 제외)
  matcher: ['/((?!api|_next/static|_next/image|images|assets|favicon.ico).*)'],
}; 