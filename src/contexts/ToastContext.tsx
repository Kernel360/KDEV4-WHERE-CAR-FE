'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  createdAt: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  hideToast: (id: number) => void;
}

// 빈 구현의 토스트 컨텍스트
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {}, // 아무 작업도 하지 않음
  hideToast: () => {}, // 아무 작업도 하지 않음
});

export function ToastProvider({ children }: { children: ReactNode }) {
  // 빈 구현 - 토스트 기능 비활성화
  return (
    <ToastContext.Provider value={{ 
      toasts: [], 
      showToast: () => {}, 
      hideToast: () => {} 
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
} 