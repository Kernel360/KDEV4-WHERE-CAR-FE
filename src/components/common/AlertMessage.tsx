"use client";

import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertMessageProps {
  type: AlertType;
  message: string;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  if (!message) return null;
  
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <XCircle className="h-5 w-5 text-yellow-500" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-500" />
        };
    }
  };
  
  const styles = getAlertStyles();
  
  return (
    <div className={`mb-4 p-3 ${styles.bg} border ${styles.border} rounded-md flex items-center`}>
      <div className="flex-shrink-0 mr-2">
        {styles.icon}
      </div>
      <p className={`text-sm font-medium ${styles.text}`}>
        {message}
      </p>
    </div>
  );
} 