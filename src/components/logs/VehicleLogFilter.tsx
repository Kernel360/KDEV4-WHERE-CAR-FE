import React, { useEffect, useState } from 'react';
import { VehicleLogFilter as FilterType, DriveType } from '@/types/logs';
import { useTheme } from '@/contexts/ThemeContext';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon as MagnifyingGlassIconSolid, XCircleIcon as XCircleIconSolid } from '@heroicons/react/24/solid';
import { useCarLogsStore } from '@/lib/carLogsStore';
import { DatePicker } from "@/components/ui/date-picker";

interface VehicleLogFilterProps {
  onChange?: (filter: FilterType) => void;
  onApplyFilter?: () => void;
  initialFilter?: FilterType;
}

export function VehicleLogFilter({ onChange, onApplyFilter, initialFilter }: VehicleLogFilterProps) {
  const { currentTheme } = useTheme();
  // Zustand 스토어 사용
  const { setFilter, resetFilter, currentFilter } = useCarLogsStore();
  
  // 로컬 상태 - 사용자 입력을 위한 임시 상태
  const [localFilter, setLocalFilter] = useState<FilterType>({
    vehicleNumber: '',
    startDate: '',
    endDate: '',
  });

  // 초기 필터 값 설정
  useEffect(() => {
    if (initialFilter) {
      setLocalFilter(initialFilter);
    }
  }, [initialFilter]);

  // 필터 변경 핸들러
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilter(prev => ({ ...prev, [name]: value }));
  };

  // DatePicker용 필터 변경 핸들러
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setLocalFilter(prev => ({ 
        ...prev, 
        [name]: formattedDate
      }));
    } else {
      setLocalFilter(prev => ({ 
        ...prev, 
        [name]: ''
      }));
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    // 스토어에 필터 상태 저장 및 API 요청 트리거
    setFilter({
      vehicleNumber: localFilter.vehicleNumber || undefined,
      startDate: localFilter.startDate || undefined,
      endDate: localFilter.endDate || undefined,
      driveType: localFilter.driveType as DriveType | undefined
    });
    
    // 변경 사항을 부모 컴포넌트에 알림 (필요한 경우)
    if (onChange) {
      onChange(localFilter);
    }
    
    // 필터 적용 알림 (필요한 경우)
    if (onApplyFilter) {
      onApplyFilter();
    }
  };

  // 검색어 초기화 핸들러
  const handleClearSearch = () => {
    setLocalFilter(prev => ({ ...prev, vehicleNumber: '' }));
  };

  // 특정 필터 초기화 핸들러
  const handleResetFilter = (key: keyof FilterType) => {
    setLocalFilter(prev => {
      const newFilter = { ...prev };
      if (key === 'driveType') {
        newFilter[key] = undefined;
      } else {
        newFilter[key] = '';
      }
      return newFilter;
    });
  };

  // 모든 필터 초기화 핸들러
  const handleClearAllFilters = () => {
    setLocalFilter({
      vehicleNumber: '',
      startDate: '',
      endDate: '',
      driveType: undefined
    });
    
    // 스토어의 필터도 초기화
    resetFilter();
    
    // 변경 사항을 부모 컴포넌트에 알림 (필요한 경우)
    if (onChange) {
      onChange({
        vehicleNumber: '',
        startDate: '',
        endDate: '',
        driveType: undefined
      });
    }
    
    // 필터 적용 알림 (필요한 경우)
    if (onApplyFilter) {
      onApplyFilter();
    }
  };

  return (
    <div className={`p-4 mb-4 ${currentTheme.cardBg} rounded-xl shadow-sm ${currentTheme.border}`}>
      <h3 className={`text-sm font-medium ${currentTheme.text} mb-3`}>상세 필터링</h3>
      
      {/* 검색바 */}
      <div className="flex space-x-2 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="vehicleNumber"
            className={`block w-full pl-9 pr-10 py-2 border ${currentTheme.border} rounded-lg leading-5 ${currentTheme.cardBg} ${currentTheme.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
            placeholder="차량 번호, 드라이버, 비고로 검색"
            value={localFilter.vehicleNumber || ''}
            onChange={handleFilterChange}
          />
          {localFilter.vehicleNumber && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={handleClearSearch}
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
              value={localFilter.startDate ? new Date(localFilter.startDate) : undefined}
              onChange={(date: Date | undefined) => handleDateChange('startDate', date)}
              className={`w-full py-2 px-3 ${currentTheme.cardBg} ${currentTheme.text} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
            />
            {localFilter.startDate && (
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
              value={localFilter.endDate ? new Date(localFilter.endDate) : undefined}
              onChange={(date: Date | undefined) => handleDateChange('endDate', date)}
              className={`w-full py-2 px-3 ${currentTheme.cardBg} ${currentTheme.text} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
            />
            {localFilter.endDate && (
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
      
      <div className="mt-4 flex justify-end space-x-2">
        {/* 초기화 버튼 */}
        <button
          type="button"
          onClick={handleClearAllFilters}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 text-sm"
        >
          초기화
        </button>
        
        {/* 검색 버튼 */}
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm flex items-center justify-center text-sm"
        >
          <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
          검색
        </button>
      </div>
    </div>
  );
} 