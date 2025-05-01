'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { currentTheme } = useTheme();

  return (
    <header className={`${currentTheme.cardBg} shadow-sm border-b ${currentTheme.border} fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-90`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <h1 className={`text-2xl font-bold ${currentTheme.text} transition-colors hover:text-blue-600`}>WHERE CAR</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className={`px-4 py-2 rounded-md border ${currentTheme.border} ${currentTheme.text} hover:${currentTheme.hoverBg} transition-colors`}
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
} 