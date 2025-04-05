import { useState, useMemo, useEffect } from 'react';
import { VehicleLog, VehicleLogFilter, DriveType, CarLogResponse } from '@/types/logs';
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

// 임시 데이터 - 실제로는 API에서 가져와야 함
const mockData: VehicleLog[] = [
  {
    id: '1',
    vehicleNumber: '서울 123가 4567',
    startTime: '2024-03-20T09:00:00Z',
    endTime: '2024-03-20T18:00:00Z',
    startMileage: 50000,
    endMileage: 50150,
    totalDistance: 150,
    driveType: 'CORPORATE',
    driver: { id: '1', name: '홍길동' },
    note: '업무 출장',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T18:00:00Z',
  },
  {
    id: '2',
    vehicleNumber: '경기 456나 7890',
    startTime: '2024-03-21T08:30:00Z',
    endTime: '2024-03-21T17:30:00Z',
    startMileage: 35000,
    endMileage: 35180,
    totalDistance: 180,
    driveType: 'PERSONAL',
    driver: { id: '2', name: '김철수' },
    note: '개인 용무',
    createdAt: '2024-03-21T08:30:00Z',
    updatedAt: '2024-03-21T17:30:00Z',
  },
  {
    id: '3',
    vehicleNumber: '부산 789다 1234',
    startTime: '2024-03-22T10:00:00Z',
    endTime: '2024-03-22T16:00:00Z',
    startMileage: 42000,
    endMileage: 42120,
    totalDistance: 120,
    driveType: 'UNREGISTERED',
    driver: null,
    note: '임시 운행',
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2024-03-22T16:00:00Z',
  },
  {
    id: '4',
    vehicleNumber: '서울 123가 4567',
    startTime: '2024-03-23T09:00:00Z',
    endTime: '2024-03-23T18:00:00Z',
    startMileage: 50150,
    endMileage: 50300,
    totalDistance: 150,
    driveType: 'CORPORATE',
    driver: { id: '1', name: '홍길동' },
    note: '거래처 방문',
    createdAt: '2024-03-23T09:00:00Z',
    updatedAt: '2024-03-23T18:00:00Z',
  },
  {
    id: '5',
    vehicleNumber: '인천 012라 5678',
    startTime: '2024-03-24T08:00:00Z',
    endTime: '2024-03-24T17:00:00Z',
    startMileage: 27000,
    endMileage: 27250,
    totalDistance: 250,
    driveType: 'PERSONAL',
    driver: { id: '3', name: '이영희' },
    note: '주말 여행',
    createdAt: '2024-03-24T08:00:00Z',
    updatedAt: '2024-03-24T17:00:00Z',
  },
  {
    id: '6',
    vehicleNumber: '대전 234마 9012',
    startTime: '2024-03-25T09:30:00Z',
    endTime: '2024-03-25T16:30:00Z',
    startMileage: 62000,
    endMileage: 62130,
    totalDistance: 130,
    driveType: 'CORPORATE',
    driver: { id: '4', name: '박지민' },
    note: '본사 방문',
    createdAt: '2024-03-25T09:30:00Z',
    updatedAt: '2024-03-25T16:30:00Z',
  },
  {
    id: '7',
    vehicleNumber: '광주 345바 3456',
    startTime: '2024-03-26T10:00:00Z',
    endTime: '2024-03-26T15:00:00Z',
    startMileage: 45000,
    endMileage: 45220,
    totalDistance: 220,
    driveType: 'PERSONAL',
    driver: { id: '5', name: '정수민' },
    note: '가족 방문',
    createdAt: '2024-03-26T10:00:00Z',
    updatedAt: '2024-03-26T15:00:00Z',
  },
  {
    id: '8',
    vehicleNumber: '대구 456사 6789',
    startTime: '2024-03-27T08:00:00Z',
    endTime: '2024-03-27T18:00:00Z',
    startMileage: 38000,
    endMileage: 38300,
    totalDistance: 300,
    driveType: 'CORPORATE',
    driver: { id: '6', name: '최현우' },
    note: '고객사 미팅',
    createdAt: '2024-03-27T08:00:00Z',
    updatedAt: '2024-03-27T18:00:00Z',
  },
  {
    id: '9',
    vehicleNumber: '부산 789다 1234',
    startTime: '2024-03-28T09:00:00Z',
    endTime: '2024-03-28T17:00:00Z',
    startMileage: 42120,
    endMileage: 42270,
    totalDistance: 150,
    driveType: 'UNREGISTERED',
    driver: null,
    note: '차량 점검',
    createdAt: '2024-03-28T09:00:00Z',
    updatedAt: '2024-03-28T17:00:00Z',
  },
  {
    id: '10',
    vehicleNumber: '서울 123가 4567',
    startTime: '2024-03-29T08:30:00Z',
    endTime: '2024-03-29T18:30:00Z',
    startMileage: 50300,
    endMileage: 50450,
    totalDistance: 150,
    driveType: 'CORPORATE',
    driver: { id: '1', name: '홍길동' },
    note: '프로젝트 미팅',
    createdAt: '2024-03-29T08:30:00Z',
    updatedAt: '2024-03-29T18:30:00Z',
  },
  {
    id: '11',
    vehicleNumber: '경기 456나 7890',
    startTime: '2024-03-30T10:00:00Z',
    endTime: '2024-03-30T16:00:00Z',
    startMileage: 35180,
    endMileage: 35280,
    totalDistance: 100,
    driveType: 'PERSONAL',
    driver: { id: '2', name: '김철수' },
    note: '쇼핑',
    createdAt: '2024-03-30T10:00:00Z',
    updatedAt: '2024-03-30T16:00:00Z',
  },
  {
    id: '12',
    vehicleNumber: '인천 012라 5678',
    startTime: '2024-03-31T09:00:00Z',
    endTime: '2024-03-31T19:00:00Z',
    startMileage: 27250,
    endMileage: 27450,
    totalDistance: 200,
    driveType: 'PERSONAL',
    driver: { id: '3', name: '이영희' },
    note: '친구 방문',
    createdAt: '2024-03-31T09:00:00Z',
    updatedAt: '2024-03-31T19:00:00Z',
  },
  {
    id: '13',
    vehicleNumber: '대전 234마 9012',
    startTime: '2024-04-01T08:00:00Z',
    endTime: '2024-04-01T17:00:00Z',
    startMileage: 62130,
    endMileage: 62230,
    totalDistance: 100,
    driveType: 'CORPORATE',
    driver: { id: '4', name: '박지민' },
    note: '정기 회의',
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2024-04-01T17:00:00Z',
  },
  {
    id: '14',
    vehicleNumber: '광주 345바 3456',
    startTime: '2024-04-02T09:30:00Z',
    endTime: '2024-04-02T15:30:00Z',
    startMileage: 45220,
    endMileage: 45350,
    totalDistance: 130,
    driveType: 'PERSONAL',
    driver: { id: '5', name: '정수민' },
    note: '개인 용무',
    createdAt: '2024-04-02T09:30:00Z',
    updatedAt: '2024-04-02T15:30:00Z',
  },
  {
    id: '15',
    vehicleNumber: '대구 456사 6789',
    startTime: '2024-04-03T08:30:00Z',
    endTime: '2024-04-03T18:30:00Z',
    startMileage: 38300,
    endMileage: 38450,
    totalDistance: 150,
    driveType: 'CORPORATE',
    driver: { id: '6', name: '최현우' },
    note: '업무 출장',
    createdAt: '2024-04-03T08:30:00Z',
    updatedAt: '2024-04-03T18:30:00Z',
  },
  {
    id: '16',
    vehicleNumber: '서울 567아 7890',
    startTime: '2024-04-04T10:00:00Z',
    endTime: '2024-04-04T17:00:00Z',
    startMileage: 18000,
    endMileage: 18150,
    totalDistance: 150,
    driveType: 'CORPORATE',
    driver: { id: '7', name: '강민준' },
    note: '고객 미팅',
    createdAt: '2024-04-04T10:00:00Z',
    updatedAt: '2024-04-04T17:00:00Z',
  },
  {
    id: '17',
    vehicleNumber: '부산 678자 8901',
    startTime: '2024-04-05T09:00:00Z',
    endTime: '2024-04-05T16:00:00Z',
    startMileage: 55000,
    endMileage: 55200,
    totalDistance: 200,
    driveType: 'UNREGISTERED',
    driver: null,
    note: '차량 테스트',
    createdAt: '2024-04-05T09:00:00Z',
    updatedAt: '2024-04-05T16:00:00Z',
  },
  {
    id: '18',
    vehicleNumber: '경기 789차 9012',
    startTime: '2024-04-06T08:00:00Z',
    endTime: '2024-04-06T15:00:00Z',
    startMileage: 23000,
    endMileage: 23100,
    totalDistance: 100,
    driveType: 'PERSONAL',
    driver: { id: '8', name: '윤서연' },
    note: '쇼핑',
    createdAt: '2024-04-06T08:00:00Z',
    updatedAt: '2024-04-06T15:00:00Z',
  },
  {
    id: '19',
    vehicleNumber: '인천 890카 0123',
    startTime: '2024-04-07T09:30:00Z',
    endTime: '2024-04-07T17:30:00Z',
    startMileage: 72000,
    endMileage: 72250,
    totalDistance: 250,
    driveType: 'CORPORATE',
    driver: { id: '9', name: '임준호' },
    note: '업무 미팅',
    createdAt: '2024-04-07T09:30:00Z',
    updatedAt: '2024-04-07T17:30:00Z',
  },
  {
    id: '20',
    vehicleNumber: '대전 901타 1234',
    startTime: '2024-04-08T10:00:00Z',
    endTime: '2024-04-08T16:00:00Z',
    startMileage: 41000,
    endMileage: 41120,
    totalDistance: 120,
    driveType: 'PERSONAL',
    driver: { id: '10', name: '한지훈' },
    note: '가족 여행',
    createdAt: '2024-04-08T10:00:00Z',
    updatedAt: '2024-04-08T16:00:00Z',
  },
];

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
    fetchCarLogs, 
    setPage 
  } = useCarLogsStore();

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchCarLogs({ page: 0, size: 10 });
  }, [fetchCarLogs]);

  // API 응답 데이터를 VehicleLog 형식으로 변환
  const mappedLogs = useMemo(() => {
    return carLogs.map(log => ({
      id: log.logId.toString(),
      vehicleNumber: log.mdn,
      startTime: log.onTime,
      endTime: log.offTime,
      startMileage: log.onMileage,
      endMileage: log.offMileage,
      totalDistance: log.totalMileage || log.offMileage - log.onMileage,
      driveType: (log.driveType === 'WORK' ? 'CORPORATE' : 'PERSONAL') as DriveType,
      driver: log.driver ? { id: '1', name: log.driver } : null,
      note: log.description,
      createdAt: log.onTime,
      updatedAt: log.offTime
    }));
  }, [carLogs]);

  // 필터링된 로그 데이터
  const filteredLogs = useMemo(() => {
    return mappedLogs.filter(log => {
      // 검색어 필터링
      if (searchTerm && !log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(log.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) &&
          !(log.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false)) {
        return false;
      }
      
      // 날짜 범위 필터링
      if (filter.startDate && new Date(log.startTime) < new Date(filter.startDate)) {
        return false;
      }
      
      if (filter.endDate && new Date(log.endTime) > new Date(filter.endDate)) {
        return false;
      }
      
      return true;
    });
  }, [filter, searchTerm, mappedLogs]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setPage(page);
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
      case 'PERSONAL':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-blue-700';
      case 'CORPORATE':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-50 dark:text-teal-700';
      case 'UNREGISTERED':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-50 dark:text-slate-700';
      default:
        return '';
    }
  };

  const getDriveTypeLabel = (type: DriveType) => {
    const types = {
      PERSONAL: '개인',
      CORPORATE: '법인',
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
                <span className="font-medium">{carLogs.length}</span> 개의 결과 보기
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
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium ${currentTheme.text} hover:bg-gray-50`}
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
          onDelete={(id) => console.log(`삭제할 운행 기록 ID: ${id}`)}
          onUpdate={(log) => console.log('운행 기록 업데이트:', log)}
        />
      )}
    </>
  );
} 