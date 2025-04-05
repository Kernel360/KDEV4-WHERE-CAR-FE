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
      const date = e.target.value ? new Date(e.target.value) : undefined;
      onChange?.(date);
    };

    return (
      <Input
        type="datetime-local"
        value={value?.toISOString().slice(0, 16) || ''}
        onChange={handleChange}
        className={`border ${currentTheme.border} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker'; 