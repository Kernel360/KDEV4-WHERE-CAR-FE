import { ChangeEvent, useState } from 'react';
import { VehicleLogFilter as FilterType } from "@/types/logs";
import { DatePicker } from "@/components/ui/date-picker";
import { useTheme } from "@/contexts/ThemeContext";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface VehicleLogFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
}

export function VehicleLogFilter({ filter, onFilterChange, searchTerm, onSearchChange, onSearch }: VehicleLogFilterProps) {
  const { currentTheme } = useTheme();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  const handleFilterChange = (key: keyof FilterType, value: string | undefined) => {
    onFilterChange({ ...filter, [key]: value });
  };

  const handleResetFilter = (key: keyof FilterType) => {
    const newFilter = { ...filter };
    delete newFilter[key];
    onFilterChange(newFilter);
  };

  const handleLocalSearchChange = (term: string) => {
    setLocalSearchTerm(term);
  };

  const handleSearch = () => {
    onSearchChange(localSearchTerm);
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-sm ${currentTheme.border}`}>
      <h3 className={`text-sm font-medium ${currentTheme.text} mb-3`}>상세 필터링</h3>
      
      {/* 검색바 */}
      <div className="flex space-x-2 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className={`block w-full pl-9 pr-10 py-2 border ${currentTheme.border} rounded-lg leading-5 ${currentTheme.cardBg} ${currentTheme.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
            placeholder="차량 번호, 드라이버, 비고로 검색"
            value={localSearchTerm}
            onChange={(e) => handleLocalSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {localSearchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm flex items-center justify-center"
        >
          <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
          검색
        </button>
      </div>
    </div>
  );
} 