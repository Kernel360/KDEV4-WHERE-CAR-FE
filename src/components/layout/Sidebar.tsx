"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import { useTheme, themes } from "@/contexts/ThemeContext";

const navigation = [
  { name: "대시보드", href: "/", icon: HomeIcon },
  { name: "차량", href: "/vehicles", icon: TruckIcon },
  { name: "운행일지", href: "/logs", icon: ClipboardDocumentListIcon },
  { name: "회사", href: "/companies", icon: BuildingOfficeIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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

  // 호버 상태에 따라 사이드바 열기/닫기
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsOpen(isHovered);
    }
  }, [isHovered]);

  const toggleThemeMode = () => {
    const currentMode = currentTheme.mode;
    const currentStyle = currentTheme.name.split("-")[0];
    const newTheme = themes.find(
      (theme) => theme.name === `${currentStyle}-${currentMode === "light" ? "Dark" : "Light"}`
    );
    if (newTheme) setTheme(newTheme);
  };

  // 메인 컨텐츠의 마진을 조절하는 함수
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      // 트랜지션 효과 추가
      mainContent.style.transition = 'margin-left 300ms ease-in-out';
      
      if (isOpen) {
        mainContent.classList.add('md:ml-64');
        mainContent.classList.remove('md:ml-20');
      } else {
        mainContent.classList.remove('md:ml-64');
        mainContent.classList.add('md:ml-20');
      }
    }
    
    // 컴포넌트 언마운트 시 트랜지션 제거
    return () => {
      if (mainContent) {
        mainContent.style.transition = '';
      }
    };
  }, [isOpen]);

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg ${currentTheme.cardBg} ${currentTheme.border} shadow-sm`}
      >
        {isOpen ? (
          <XMarkIcon className={`h-6 w-6 ${currentTheme.text}`} />
        ) : (
          <Bars3Icon className={`h-6 w-6 ${currentTheme.text}`} />
        )}
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col ${currentTheme.cardBg} shadow-lg ${
          currentTheme.border
        } border-r z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            onClick={() => setIsOpen(false)}
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
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
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

        {/* 하단 영역 */}
        <div className={`p-4 border-t ${currentTheme.border} shrink-0`}>
          <div className={`flex items-center ${isOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg ${currentTheme.activeBg}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r ${currentTheme.profileGradient} flex items-center justify-center`}>
              <span className="text-sm font-medium text-white">관</span>
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentTheme.text}`}>관리자</p>
                <p className={`text-xs ${currentTheme.subtext}`}>admin@wherecar.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 