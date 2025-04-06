"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 