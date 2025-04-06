import { useState, useMemo, useEffect } from 'react';
import { VehicleLog, VehicleLogFilter, DriveType, CarLogResponse, CarLogsParams } from '@/types/logs';
import { formatDate, formatNumber } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import VehicleLogDetailSlidePanel from './VehicleLogDetailSlidePanel';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCarLogsStore } from '@/lib/carLogsStore';

interface VehicleLogListProps {
  filter: VehicleLogFilter;
  searchTerm?: string;
  onExport: (logs: VehicleLog[]) => void;
  onLogSelect?: (log: VehicleLog) => void;
  isSlideOpen?: boolean;
  onCloseSlide?: () => void;
  selectedLog?: VehicleLog | null;
  isLoading?: boolean;
}

export function VehicleLogList({ 
  filter, 
  searchTerm = '',
  onExport,
  onLogSelect,
  isSlideOpen = false,
  onCloseSlide,
  selectedLog,
  isLoading: parentIsLoading = false
}: VehicleLogListProps) {
  const { currentTheme } = useTheme();
  const [localSelectedLog, setLocalSelectedLog] = useState<VehicleLog | null>(null);
  const [isLocalSlideOpen, setIsLocalSlideOpen] = useState(false);
  
  // Zustand 스토어에서 상태 가져오기
  const { 
    carLogs, 
    isLoading, 
    error, 
    currentPage, 
    pageSize,
    totalPages,
    fetchCarLogs, 
    setPage 
  } = useCarLogsStore();

  // API 응답 데이터를 VehicleLog 형식으로 변환
  const mappedLogs = useMemo(() => {
    return carLogs.map(log => {
      // API 응답의 driveType을 변환
      let driveType: DriveType = 'UNREGISTERED';
      if (log.driveType === 'COMMUTE' || log.driveType === 'WORK') {
        driveType = log.driveType as DriveType;
      }
      
      const mappedLog = {
        id: log.logId.toString(),
        vehicleNumber: log.mdn || '',
        startTime: log.onTime || '',
        endTime: log.offTime || '',
        startMileage: log.onMileage || 0,
        endMileage: log.offMileage || 0,
        totalDistance: log.totalMileage !== null && log.totalMileage !== undefined 
          ? log.totalMileage 
          : (log.offMileage || 0) - (log.onMileage || 0),
        driveType: driveType,
        driver: log.driver ? { id: '1', name: log.driver } : null,
        note: log.description || null,
        createdAt: log.onTime || '',
        updatedAt: log.offTime || ''
      };
      
      return mappedLog;
    });
  }, [carLogs]);

  // 검색어와 필터를 적용한 로그 목록 - API에서 필터링된 결과를 사용하므로 클라이언트 측 필터링은 제거
  const filteredLogs = mappedLogs;

  // 페이지 변경 처리 함수
  const handlePageChange = (newPage: number) => {
    // 현재 필터 상태를 유지하면서 페이지만 변경
    setPage(newPage);
  };

  const handleLogClick = (log: VehicleLog) => {
    if (onLogSelect) {
      onLogSelect(log);
    } else {
      setLocalSelectedLog(log);
      setIsLocalSlideOpen(true);
    }
  };

  const handleCloseLocalSlide = () => {
    setIsLocalSlideOpen(false);
  };

  // 드라이브 타입에 따른 배경색 클래스
  const getDriveTypeClass = (type: DriveType) => {
    switch (type) {
      case 'COMMUTE':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-blue-700';
      case 'WORK':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-50 dark:text-teal-700';
      case 'UNREGISTERED':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-50 dark:text-slate-700';
      default:
        return '';
    }
  };

  const getDriveTypeLabel = (type: DriveType) => {
    const types = {
      COMMUTE: '출퇴근',
      WORK: '업무',
      UNREGISTERED: '미등록',
    } as const;
    return types[type];
  };

  return (
    <>
      <div className={`flex-grow ${currentTheme.cardBg} rounded-xl shadow-sm ${currentTheme.border} overflow-hidden flex flex-col`}>
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-200">
            <thead className={`${currentTheme.cardBg} dark:bg-gray-500`}>
              <tr>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  차량 번호
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  시작 시간
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  종료 시간
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  시작 주행거리
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  종료 주행거리
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  총 주행거리
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  드라이브 타입
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  드라이버
                </th>
                <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                  비고
                </th>
              </tr>
            </thead>
            <tbody className={`${currentTheme.cardBg} divide-y divide-gray-200 dark:divide-gray-200 dark:bg-white`}>
              {isLoading || parentIsLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className={`${currentTheme.text}`}>데이터를 불러오는 중...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className={`px-5 py-8 text-center text-sm text-red-500`}>
                    {error}
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={`${currentTheme.cardBg} hover:bg-gray-200 transition-colors duration-150 dark:bg-white dark:hover:bg-gray-200 cursor-pointer`}
                    onClick={() => handleLogClick(log)}
                  >
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm font-medium ${currentTheme.text} dark:text-gray-800`}>
                      {log.vehicleNumber}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                      {formatDate(log.startTime)}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                      {formatDate(log.endTime)}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                      {formatNumber(log.startMileage)} km
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                      {formatNumber(log.endMileage)} km
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                      {formatNumber(log.totalDistance)} km
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm`}>
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getDriveTypeClass(log.driveType)}`}>
                        {getDriveTypeLabel(log.driveType)}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                      {log.driver?.name || '미등록'}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`} title={log.note || '-'}>
                      {log.note ? (log.note.length > 10 ? `${log.note.substring(0, 10)}...` : log.note) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className={`px-5 py-8 text-center text-sm ${currentTheme.text}`}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && !error && (
          <div className={`px-5 py-3 flex items-center justify-between border-t ${currentTheme.border}`}>
            <div>
              <p className={`text-sm ${currentTheme.subtext}`}>
                총 {carLogs.length}개 항목 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, carLogs.length)}개 표시 (페이지 {currentPage + 1} / {totalPages})
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium ${currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : `${currentTheme.text} hover:bg-gray-50`}`}
                >
                  <span className="sr-only">이전</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {(() => {
                  // API 응답의 totalPages를 사용하여 페이지네이션 생성
                  let startPage = Math.max(0, currentPage - 2);
                  let endPage = Math.min(totalPages - 1, startPage + 4);
        
                  if (endPage - startPage < 4) {
                    startPage = Math.max(0, endPage - 4);
                  }
                  
                  return Array.from({ length: Math.min(5, endPage - startPage + 1) }, (_, i) => startPage + i).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-3 py-1.5 border ${
                        currentPage === page
                          ? `z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-100 dark:border-indigo-500 dark:text-indigo-800`
                          : `${currentTheme.border} ${currentTheme.cardBg} ${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-200 dark:text-gray-800`
                      } text-sm font-medium`}
                    >
                      {page + 1}
                    </button>
                  ));
                })()}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium ${currentPage >= totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : `${currentTheme.text} hover:bg-gray-50`}`}
                >
                  <span className="sr-only">다음</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* 자체 슬라이드 패널 (상위 컴포넌트에서 처리하지 않을 경우) */}
      {!onLogSelect && (
        <VehicleLogDetailSlidePanel
          isOpen={isLocalSlideOpen}
          onClose={handleCloseLocalSlide}
          log={localSelectedLog}
          onDelete={(id) => {}}
          onUpdate={(log) => {}}
        />
      )}
    </>
  );
} 