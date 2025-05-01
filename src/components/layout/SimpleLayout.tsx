'use client';

import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <Header />
      <main className="w-full pt-16">
        {children}
      </main>
    </div>
  );
} 