"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  HomeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  SwatchIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  MapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTheme, themes } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/lib/authStore";

const navigation = [
  { name: "대시보드", href: "/", icon: HomeIcon },
  { name: "차량", href: "/vehicles", icon: TruckIcon },
  { name: "운행일지", href: "/logs", icon: ClipboardDocumentListIcon },
  { name: "실시간 관제", href: "/monitoring", icon: MapIcon },
  { name: "회사", href: "/companies", icon: BuildingOfficeIcon },
];

// 이벤트 버스 역할을 할 사용자 정의 이벤트
export const sidebarEvents = {
  subscribe: (eventName: string, listener: EventListener) => {
    document.addEventListener(eventName, listener);
    return () => document.removeEventListener(eventName, listener);
  },
  publish: (eventName: string, data?: any) => {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme, setTheme } = useTheme();
  const { userProfile, fetchUserProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(true); // 초기 상태를 펼쳐진 상태로 변경
  const [userToggled, setUserToggled] = useState(false);

  // 초기 로드 시 localStorage에서 사이드바 상태 가져오기
  useEffect(() => {
    const storedSidebarState = localStorage.getItem('sidebarOpen');
    // localStorage에 값이 저장되어 있으면 그 값을 사용, 없으면 기본값 true (펼쳐진 상태)
    if (storedSidebarState) {
      setIsOpen(storedSidebarState === 'true');
      setUserToggled(true);
    }
  }, []);

  // 사용자 프로필 정보가 없을 경우 가져오기
  useEffect(() => {
    if (!userProfile) {
      fetchUserProfile();
    }
  }, [userProfile, fetchUserProfile]);

  // isOpen 상태가 변경될 때 이벤트 발행
  useEffect(() => {
    sidebarEvents.publish('sidebar-toggle', { isOpen });
  }, [isOpen]);

  // 화면 크기가 변경될 때 사이드바 상태 관리
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    // 초기 실행
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 사용자가 토글 버튼을 클릭했을 때 상태 저장
  const handleToggleSidebar = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    setUserToggled(true);
    localStorage.setItem('sidebarOpen', newState.toString());
  }, [isOpen]);

  const toggleThemeMode = () => {
    const currentMode = currentTheme.mode;
    const currentStyle = currentTheme.name.split("-")[0];
    const newTheme = themes.find(
      (theme) => theme.name === `${currentStyle}-${currentMode === "light" ? "Dark" : "Light"}`
    );
    if (newTheme) setTheme(newTheme);
  };

  // 사용자 이니셜 가져오기
  const getUserInitial = () => {
    if (!userProfile || !userProfile.name) return "관";
    return userProfile.name.charAt(0);
  };

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={handleToggleSidebar}
        className={`md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} shadow-sm`}
      >
        {isOpen ? (
          <XMarkIcon className={`h-6 w-6 ${currentTheme.text}`} />
        ) : (
          <Bars3Icon className={`h-6 w-6 ${currentTheme.text}`} />
        )}
      </button>

      {/* 데스크톱 토글 버튼 */}
      <button
        onClick={handleToggleSidebar}
        className={`hidden md:flex fixed top-4 ${isOpen ? 'left-64' : 'left-20'} z-20 p-2 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} shadow-sm transition-all duration-300`}
      >
        {isOpen ? (
          <ChevronLeftIcon className={`h-5 w-5 ${currentTheme.text}`} />
        ) : (
          <ChevronRightIcon className={`h-5 w-5 ${currentTheme.text}`} />
        )}
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={handleToggleSidebar}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col ${currentTheme.cardBg} shadow-lg ${
          currentTheme.border
        } border-r z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* 로고 영역 */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 overflow-hidden">
          <div className={`transition-opacity duration-300 w-full ${isOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
            <h1 className="text-lg font-semibold text-slate-700 dark:text-white tracking-wide whitespace-nowrap overflow-hidden">WHERE CAR</h1>
          </div>
          <div className={`transition-opacity duration-300 w-full flex justify-center ${isOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
            <h1 className="text-lg font-semibold text-slate-700 dark:text-white tracking-wide whitespace-nowrap">WC</h1>
          </div>
          <button
            onClick={handleToggleSidebar}
            className="md:hidden text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 메뉴 영역 */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    handleToggleSidebar();
                  }
                }}
                className={`group flex items-center ${isOpen ? 'px-4' : 'px-2 justify-center'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? `${currentTheme.activeBg} ${currentTheme.activeText} shadow-sm`
                    : `${currentTheme.textColor} ${currentTheme.hoverBg}`
                } ${!isActive && 'hover:text-gray-900 dark:hover:text-white'}`}
                title={!isOpen ? item.name : undefined}
              >
                <item.icon
                  className={`${isOpen ? 'mr-3' : ''} h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive 
                      ? currentTheme.activeText
                      : currentTheme.iconColor
                  } ${!isOpen && 'mx-auto'}`}
                  aria-hidden="true"
                />
                {isOpen && (
                  <>
                    {item.name}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 테마 선택 */}
        <div className={`px-4 py-2 border-t ${currentTheme.border} overflow-hidden`}>
          <div className="relative h-10 px-4">
            {/* 확장된 테마 섹션 - 사이드바가 열렸을 때 */}
            <div className={`absolute inset-0 flex items-center justify-between transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center">
                <SwatchIcon className={`h-5 w-5 ${currentTheme.iconColor} mr-2`} />
                <span className={`text-sm font-medium ${currentTheme.textColor} whitespace-nowrap`}>테마</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleThemeMode}
                  className={`p-1.5 rounded-lg ${currentTheme.hoverBg} ${currentTheme.textColor}`}
                  title={`${currentTheme.mode === 'light' ? '다크' : '라이트'} 모드로 전환`}
                >
                  {currentTheme.mode === 'light' ? (
                    <MoonIcon className="h-5 w-5" />
                  ) : (
                    <SunIcon className="h-5 w-5" />
                  )}
                </button>
                <div className="flex space-x-2">
                  {themes
                    .filter((theme) => theme.mode === currentTheme.mode)
                    .map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setTheme(theme)}
                        className={`w-6 h-6 rounded-full ${theme.logoBackground} ${
                          currentTheme.name === theme.name ? 'ring-2 ring-offset-2 ring-slate-600' : ''
                        }`}
                        title={theme.name.split("-")[0]}
                      />
                    ))}
                </div>
              </div>
            </div>
            
            {/* 축소된 테마 섹션 - 사이드바가 닫혔을 때 */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button
                onClick={toggleThemeMode}
                className={`p-1.5 rounded-lg ${currentTheme.hoverBg} ${currentTheme.textColor}`}
                title={`${currentTheme.mode === 'light' ? '다크' : '라이트'} 모드로 전환`}
              >
                {currentTheme.mode === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 하단 영역 - 유저 프로필 */}
        <div className={`p-4 border-t ${currentTheme.border} shrink-0`}>
          <div className="relative group">
            <Link
              href="/profile"
              className={`flex items-center ${isOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-all duration-200 ${
                pathname === '/profile'
                  ? `${currentTheme.activeBg} ${currentTheme.activeText} shadow-sm`
                  : `${currentTheme.textColor} hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm`
              }`}
            >
              <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r ${currentTheme.profileGradient} flex items-center justify-center`}>
                <span className="text-sm font-medium text-white">{getUserInitial()}</span>
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentTheme.text}`}>{userProfile?.name || '사용자'}</p>
                  <p className={`text-xs ${currentTheme.subtext}`}>{userProfile?.email || 'user@wherecar.com'}</p>
                </div>
              )}
            </Link>
            {/* 로그아웃 버튼 */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => {
                  const { logout } = useAuthStore.getState();
                  logout();
                  router.push('/');
                }}
                className={`p-2 rounded-lg ${currentTheme.hoverBg} ${currentTheme.textColor} hover:text-red-500`}
                title="로그아웃"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 