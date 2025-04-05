import { ChangeEvent } from 'react';
import { DriveType, VehicleLogFilter as FilterType } from "@/types/logs";
import { DatePicker } from "@/components/ui/date-picker";
import { useTheme } from "@/contexts/ThemeContext";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface VehicleLogFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const driveTypes = [
  { value: 'PERSONAL', label: '개인' },
  { value: 'CORPORATE', label: '법인' },
  { value: 'UNREGISTERED', label: '미등록' },
] as const;

export function VehicleLogFilter({ filter, onFilterChange, searchTerm, onSearchChange }: VehicleLogFilterProps) {
  const { currentTheme } = useTheme();
  
  const handleFilterChange = (key: keyof FilterType, value: string | undefined) => {
    onFilterChange({ ...filter, [key]: value });
  };

  const handleResetFilter = (key: keyof FilterType) => {
    const newFilter = { ...filter };
    delete newFilter[key];
    onFilterChange(newFilter);
  };

  return (
    <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-sm ${currentTheme.border}`}>
      <h3 className={`text-sm font-medium ${currentTheme.text} mb-3`}>상세 필터링</h3>
      
      {/* 검색바 */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className={`block w-full pl-9 pr-3 py-2 border ${currentTheme.border} rounded-lg leading-5 ${currentTheme.cardBg} ${currentTheme.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
          placeholder="차량 번호, 드라이버, 비고로 검색"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => onSearchChange('')}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-xs font-medium ${currentTheme.subtext} mb-1`}>시작 날짜</label>
          <div className={`relative border ${currentTheme.border} rounded-lg`}>
            <DatePicker
              value={filter.startDate ? new Date(filter.startDate) : undefined}
              onChange={(date: Date | undefined) => handleFilterChange('startDate', date?.toISOString())}
              className={`w-full py-2 px-3 ${currentTheme.cardBg} ${currentTheme.text} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
            />
            {filter.startDate && (
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button
                  onClick={() => handleResetFilter('startDate')}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className={`block text-xs font-medium ${currentTheme.subtext} mb-1`}>종료 날짜</label>
          <div className={`relative border ${currentTheme.border} rounded-lg`}>
            <DatePicker
              value={filter.endDate ? new Date(filter.endDate) : undefined}
              onChange={(date: Date | undefined) => handleFilterChange('endDate', date?.toISOString())}
              className={`w-full py-2 px-3 ${currentTheme.cardBg} ${currentTheme.text} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
            />
            {filter.endDate && (
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button
                  onClick={() => handleResetFilter('endDate')}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className={`block text-xs font-medium ${currentTheme.subtext} mb-1`}>드라이브 타입</label>
          <div className={`relative border ${currentTheme.border} rounded-lg`}>
            <select
              value={filter.driveType || ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('driveType', e.target.value as DriveType)}
              className={`w-full py-2 px-3 ${currentTheme.cardBg} ${currentTheme.text} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none`}
            >
              <option value="">전체</option>
              {driveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center">
              {filter.driveType ? (
                <button
                  onClick={() => handleResetFilter('driveType')}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none pr-6"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              ) : (
                <div className="pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 