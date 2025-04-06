'use client';

import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  const getToastStyle = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-400 dark:border-green-700',
          textColor: 'text-green-700 dark:text-green-400',
          icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-400 dark:border-red-700',
          textColor: 'text-red-700 dark:text-red-400',
          icon: <XCircleIcon className="h-6 w-6 text-red-500" />
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-400 dark:border-blue-700',
          textColor: 'text-blue-700 dark:text-blue-400',
          icon: <InformationCircleIcon className="h-6 w-6 text-blue-500" />
        };
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none">
      {toasts.map((toast) => {
        const { bgColor, borderColor, textColor, icon } = getToastStyle(toast.type);
        return (
          <Transition
            key={toast.id}
            show={true}
            enter="transform transition duration-300"
            enterFrom="opacity-0 -translate-y-6 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transform transition duration-300"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-6 scale-95"
          >
            <div
              className={`max-w-xl w-auto px-5 py-4 shadow-lg rounded-lg border ${borderColor} ${bgColor} flex items-center pointer-events-auto`}
            >
              <div className="mr-4 flex-shrink-0">
                {icon}
              </div>
              <div className={`${textColor} flex-1 text-base font-medium`}>
                {toast.message}
              </div>
              <button
                onClick={() => hideToast(toast.id)}
                className={`ml-4 ${textColor} hover:opacity-75 focus:outline-none`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </Transition>
        );
      })}
    </div>
  );
} 