import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 미들웨어 핸들러
export function middleware(request: NextRequest) {
  // 현재 요청 URL 경로
  const path = request.nextUrl.pathname;
  
  // 공개 접근 가능한 경로 (로그인하지 않아도 접근 가능)
  const publicPaths = ['/login', '/register'];
  
  // 현재 경로가 공개 경로인지 확인
  const isPublicPath = publicPaths.includes(path);
  
  // 토큰 확인
  const token = request.cookies.get('Authorization')?.value;
  
  console.log(`[Middleware] 경로: ${path}, 인증 여부: ${!!token}, 공개 경로: ${isPublicPath}`);
  
  // 로그인되지 않았는데 비공개 경로에 접근하려는 경우
  if (!token && !isPublicPath) {
    // 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/login', request.url);
    console.log(`[Middleware] 리다이렉트: ${loginUrl.toString()}`);
    return NextResponse.redirect(loginUrl);
  }
  
  // 로그인된 상태에서 로그인 또는 회원가입 페이지에 접근하려는 경우
  if (token && isPublicPath) {
    // 대시보드로 리다이렉트
    const dashboardUrl = new URL('/', request.url);
    console.log(`[Middleware] 리다이렉트: ${dashboardUrl.toString()}`);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // 그 외의 경우에는 요청 계속 진행
  return NextResponse.next();
}

// 미들웨어가 적용될 경로 패턴 설정
export const config = {
  matcher: [
    /*
     * 다음 경로에 대해 미들웨어 적용:
     * - 모든 경로 (/api/* 제외)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 