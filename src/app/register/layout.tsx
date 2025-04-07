"use client";

import { ReactNode } from "react";

export default function RegisterLayout({
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