"use client";

import { ReactNode } from "react";
import ToastContainer from "@/components/common/ToastContainer";

export default function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
      <ToastContainer />
    </div>
  );
} 