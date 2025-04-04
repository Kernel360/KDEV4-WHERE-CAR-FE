"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export type Theme = {
  name: string;
  mode: ThemeMode;
  background: string;
  text: string;
  subtext: string;
  border: string;
  cardBg: string;
  logoBackground: string;
  activeText: string;
  activeBg: string;
  activeIndicator: string;
  hoverBg: string;
  iconColor: string;
  textColor: string;
  profileGradient: string;
  chartColors: string[];
};

export const themes: Theme[] = [
  {
    name: "Modern-Light",
    mode: "light",
    background: "bg-gray-50",
    text: "text-gray-900",
    subtext: "text-gray-500",
    border: "border-gray-200",
    cardBg: "bg-white",
    logoBackground: "bg-gradient-to-r from-blue-600 to-indigo-600",
    activeText: "text-blue-600",
    activeBg: "bg-blue-50",
    activeIndicator: "bg-blue-600",
    hoverBg: "hover:bg-gray-50",
    iconColor: "text-gray-400 group-hover:text-gray-500",
    textColor: "text-gray-600",
    profileGradient: "from-blue-600 to-indigo-600",
    chartColors: ["#3b82f6", "#6366f1", "#a5b4fc"],
  },
  {
    name: "Modern-Dark",
    mode: "dark",
    background: "bg-gray-900",
    text: "text-white",
    subtext: "text-gray-400",
    border: "border-gray-800",
    cardBg: "bg-gray-800",
    logoBackground: "bg-gradient-to-r from-blue-500 to-indigo-500",
    activeText: "text-blue-400",
    activeBg: "bg-gray-700",
    activeIndicator: "bg-blue-500",
    hoverBg: "hover:bg-gray-700",
    iconColor: "text-gray-500 group-hover:text-gray-400",
    textColor: "text-gray-400",
    profileGradient: "from-blue-500 to-indigo-500",
    chartColors: ["#60a5fa", "#818cf8", "#c7d2fe"],
  },
  {
    name: "Ocean-Light",
    mode: "light",
    background: "bg-slate-50",
    text: "text-slate-900",
    subtext: "text-slate-500",
    border: "border-slate-200",
    cardBg: "bg-white",
    logoBackground: "bg-gradient-to-r from-cyan-600 to-teal-600",
    activeText: "text-teal-600",
    activeBg: "bg-teal-50",
    activeIndicator: "bg-teal-600",
    hoverBg: "hover:bg-slate-50",
    iconColor: "text-slate-400 group-hover:text-slate-500",
    textColor: "text-slate-600",
    profileGradient: "from-cyan-600 to-teal-600",
    chartColors: ["#0d9488", "#14b8a6", "#5eead4"],
  },
  {
    name: "Ocean-Dark",
    mode: "dark",
    background: "bg-slate-900",
    text: "text-white",
    subtext: "text-slate-400",
    border: "border-slate-800",
    cardBg: "bg-slate-800",
    logoBackground: "bg-gradient-to-r from-cyan-500 to-teal-500",
    activeText: "text-teal-400",
    activeBg: "bg-slate-700",
    activeIndicator: "bg-teal-500",
    hoverBg: "hover:bg-slate-700",
    iconColor: "text-slate-500 group-hover:text-slate-400",
    textColor: "text-slate-400",
    profileGradient: "from-cyan-500 to-teal-500",
    chartColors: ["#14b8a6", "#2dd4bf", "#99f6e4"],
  },
  {
    name: "Sunset-Light",
    mode: "light",
    background: "bg-orange-50",
    text: "text-gray-900",
    subtext: "text-gray-500",
    border: "border-orange-200",
    cardBg: "bg-white",
    logoBackground: "bg-gradient-to-r from-orange-600 to-pink-600",
    activeText: "text-orange-600",
    activeBg: "bg-orange-50",
    activeIndicator: "bg-orange-600",
    hoverBg: "hover:bg-orange-50",
    iconColor: "text-gray-400 group-hover:text-gray-500",
    textColor: "text-gray-600",
    profileGradient: "from-orange-600 to-pink-600",
    chartColors: ["#ea580c", "#f97316", "#fdba74"],
  },
  {
    name: "Sunset-Dark",
    mode: "dark",
    background: "bg-gray-900",
    text: "text-white",
    subtext: "text-gray-400",
    border: "border-gray-800",
    cardBg: "bg-gray-800",
    logoBackground: "bg-gradient-to-r from-orange-500 to-pink-500",
    activeText: "text-orange-400",
    activeBg: "bg-gray-700",
    activeIndicator: "bg-orange-500",
    hoverBg: "hover:bg-gray-700",
    iconColor: "text-gray-500 group-hover:text-gray-400",
    textColor: "text-gray-400",
    profileGradient: "from-orange-500 to-pink-500",
    chartColors: ["#f97316", "#fb923c", "#fed7aa"],
  },
];

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 