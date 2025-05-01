'use client';

import { useTheme } from "@/contexts/ThemeContext";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <Sidebar />
      <main className="md:ml-64">
        {children}
      </main>
    </div>
  );
} 