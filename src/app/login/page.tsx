"use client";

import { useState, useEffect, Suspense } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { UserCircleIcon, KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, LoginRequest } from '@/lib/authStore';
import Link from 'next/link';

function LoginContent() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 로그인 폼 데이터
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  
  // 로그인 스토어에서 상태와 메서드 가져오기
  const { 
    isLoading, 
    error, 
    isAuthenticated,
    login,
    checkAuth
  } = useAuthStore();

  // silent 모드 확인 (내부 처리용)
  const isSilentMode = searchParams?.get('silent') === 'true';
  const callbackUrl = searchParams?.get('callbackUrl');

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    // silent 모드일 경우 자동으로 인증 상태 확인
    if (isSilentMode) {
      const isAuthed = checkAuth();
      
      if (isAuthed) {
        // 이미 인증된 경우 callbackUrl로 리다이렉트
        if (callbackUrl) {
          router.push(decodeURIComponent(callbackUrl));
        } else {
          router.push('/');
        }
      }
    }
  }, [isSilentMode, callbackUrl, router, checkAuth]);

  // 로그인 후 리다이렉션
  useEffect(() => {
    if (isAuthenticated) {
      // callbackUrl 파라미터 확인
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, router, callbackUrl]);

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    router.back();
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData);
  };

  // silent 모드일 경우 로딩 화면 표시
  if (isSilentMode) {
    return (
      <div className={`min-h-screen ${currentTheme.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${currentTheme.text}`}>인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} p-8`}>
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex items-center">
          <button 
            onClick={handleGoBack}
            className={`mr-4 p-2 rounded-full hover:${currentTheme.hoverBg}`}
          >
            <ArrowLeftIcon className={`h-5 w-5 ${currentTheme.text}`} />
          </button>
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>로그인</h1>
        </div>

        {/* 로그인 폼 */}
        <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${currentTheme.text}`}>WHERE CAR</h2>
            <p className={`mt-2 text-sm ${currentTheme.subtext}`}>차량 관리 시스템에 로그인하세요</p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                이메일 주소
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircleIcon className={`h-5 w-5 ${currentTheme.subtext}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${currentTheme.border} rounded-lg shadow-sm ${currentTheme.inputBg} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="email@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className={`h-5 w-5 ${currentTheme.subtext}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${currentTheme.border} rounded-lg shadow-sm ${currentTheme.inputBg} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : '로그인'}
              </button>
            </div>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${currentTheme.subtext}`}>
              계정이 없으신가요?{' '}
              <Link href="/register" className={`font-medium ${currentTheme.activeText} hover:underline`}>
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}