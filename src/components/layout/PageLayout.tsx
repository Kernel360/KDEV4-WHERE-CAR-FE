"use client";

import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Sidebar, { sidebarEvents } from "./Sidebar";
import { usePathname } from "next/navigation";
import { setupAuthInterceptor } from "@/lib/authStore";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { currentTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 사이드바를 표시하지 않을 경로 목록
  const hideSidebarPaths = ['/', '/login', '/register', '/emulator-guide', '/trial'];
  
  // 사이드바를 표시할지 여부 결정
  const showSidebar = pathname ? !hideSidebarPaths.includes(pathname) : true;

  // 인증 인터셉터 설정
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  // 사이드바 상태 변경 구독
  useEffect(() => {
    const unsubscribe = sidebarEvents.subscribe('sidebar-toggle', ((event: CustomEvent) => {
      setSidebarOpen(event.detail.isOpen);
    }) as EventListener);
    
    return unsubscribe;
  }, []);

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <div className="flex h-full">
        {showSidebar && <Sidebar />}
        <main 
          className={`flex-1 overflow-y-auto ${currentTheme.background} transition-all duration-300 ease-in-out ${
            showSidebar ? (sidebarOpen ? 'md:ml-64' : 'md:ml-20') : ''
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 