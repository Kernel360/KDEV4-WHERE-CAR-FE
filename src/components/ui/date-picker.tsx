import { forwardRef } from 'react';
import { Input } from './input';
import { useTheme } from '@/contexts/ThemeContext';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const { currentTheme } = useTheme();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
        // 'YYYY-MM-DD' 형식의 문자열로부터 Date 객체 생성
        const dateString = e.target.value;
        
        // 날짜를 KST(한국 시간)으로 처리
        const [year, month, day] = dateString.split('-').map(Number);
        
        // 날짜 부분만 사용하여 현지 시간으로 Date 객체 생성
        const date = new Date(year, month - 1, day, 0, 0, 0);
        
        onChange?.(date);
      } else {
        onChange?.(undefined);
      }
    };

    // 입력 필드에 표시할 날짜 문자열 생성 (YYYY-MM-DD 형식)
    const getDateString = (date?: Date): string => {
      if (!date) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };

    return (
      <Input
        type="date"
        value={value ? getDateString(value) : ''}
        onChange={handleChange}
        className={`border ${currentTheme.border} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker'; 