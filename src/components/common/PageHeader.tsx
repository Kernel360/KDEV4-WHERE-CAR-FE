"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  const { currentTheme } = useTheme();
  
  return (
    <div className={`mb-8 ${currentTheme.text}`}>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className={`mt-1 ${currentTheme.subtext}`}>{description}</p>
    </div>
  );
} 