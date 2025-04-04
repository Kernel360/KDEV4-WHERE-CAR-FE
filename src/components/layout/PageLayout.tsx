"use client";

import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <div className="flex h-full">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto ${currentTheme.background}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 