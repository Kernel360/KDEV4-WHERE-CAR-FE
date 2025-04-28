import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, TruckIcon, UserIcon, PencilIcon, TrashIcon, ArrowsRightLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { VehicleLog, DriveType } from '@/types/logs';
import { formatDate, formatNumber } from '@/lib/utils';
import { useCarLogsStore } from '@/lib/carLogsStore';
import AlertMessage from '../common/AlertMessage';
import RouteMap from '../map/RouteMap';
import { fetchGpsRoute } from '@/lib/api';

interface VehicleLogDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  log: VehicleLog | null;
  onDelete?: (id: string) => void;
  onUpdate?: (log: VehicleLog) => void;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface RouteResponse {
  mdn: string;
  route: RoutePoint[];
}

export default function VehicleLogDetailSlidePanel({ isOpen, onClose, log, onDelete, onUpdate }: VehicleLogDetailSlidePanelProps) {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLog, setEditedLog] = useState<VehicleLog | null>(null);
  const [displayLog, setDisplayLog] = useState<VehicleLog | null>(null);
  const { updateCarLog, deleteCarLog } = useCarLogsStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number; timestamp?: string }[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // fetchRouteData 함수를 useCallback으로 감싸기
  const fetchRouteData = useCallback(async () => {
    if (!log) return;
    
    setIsLoadingRoute(true);
    try {
      // 시간 형식 변환 (UTC 변환 없이 원본 시간 유지)
      const formattedStartTime = `${log.startTime.replace(' ', 'T')}.000Z`;
      const formattedEndTime = `${log.endTime.replace(' ', 'T')}.000Z`;

      const routeData = await fetchGpsRoute(
        log.vehicleNumber,
        formattedStartTime,
        formattedEndTime
      ) as RouteResponse;

      if (routeData && routeData.route && routeData.route.length > 0) {
        const points = routeData.route.map((point: RoutePoint) => ({
          lat: point.latitude,
          lng: point.longitude,
          timestamp: point.timestamp
        }));
        setRoutePoints(points);
      } else {
        setRoutePoints([]);
      }
    } catch (error) {
      setRoutePoints([]);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [log]);

  useEffect(() => {
    if (log) {
      setDisplayLog(log);
      fetchRouteData();
    }
  }, [log, fetchRouteData]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleEdit = () => {
    if (log) {
      setEditedLog({ ...log });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (displayLog) {
      setEditedLog({ ...displayLog });
    }
  };

  const handleSaveEdit = async () => {
    if (editedLog) {
      try {
        const updateData = {
          driveType: editedLog.driveType,
          driver: editedLog.driver?.name || '',
          description: editedLog.note || ''
        };
        
        const logId = parseInt(editedLog.id, 10);
        if (isNaN(logId)) {
          throw new Error('유효하지 않은 로그 ID');
        }
        
        setIsEditing(false);
        setSuccessMessage("수정되었습니다.");
        setDisplayLog(editedLog);
        
        setIsUpdating(true);
        const result = await updateCarLog(logId, updateData);
        
        if (result.success) {
          if (onUpdate) {
            // UI는 이미 업데이트되었지만, 부모 컴포넌트에도 알려줌
            onUpdate(editedLog);
          }
        } else {
          console.error('수정 실패:', result.message);
          // API 호출이 실패한 경우 오류 메시지만 표시하고 UI는 그대로 유지
          setSuccessMessage(null);
          setError(result.message || '수정에 실패했습니다.');
        }
      } catch (error) {
        console.error('운행 기록 업데이트 오류:', error);
        // 오류 발생 시 오류 메시지 표시
        setSuccessMessage(null);
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // 패널 닫기 시 모든 상태 초기화
  const handleClosePanel = () => {
    setIsEditing(false);
    setEditedLog(displayLog);
    setSuccessMessage(null);
    setError(null);
    onClose();
  };

  // 삭제 처리
  const handleDelete = () => {
    if (log && onDelete) {
      if (window.confirm('정말로 이 운행 기록을 삭제하시겠습니까?')) {
        setIsDeleting(true);
        
        // 로그 ID 파싱
        const logId = parseInt(log.id, 10);
        if (isNaN(logId)) {
          alert('유효하지 않은 로그 ID입니다.');
          setIsDeleting(false);
          return;
        }
        
        // 삭제 API 호출
        deleteCarLog(logId)
          .then(result => {
            if (result.success) {
              // 삭제 후 바로 패널 닫기
              onClose();
              onDelete(log.id);
            } else {
              console.error('삭제 실패:', result.message);
            }
          })
          .catch(error => {
            console.error('운행 기록 삭제 오류:', error);
          })
          .finally(() => {
            setIsDeleting(false);
          });
      }
    }
  };

  const handleInputChange = (field: keyof VehicleLog, value: any) => {
    if (editedLog) {
      setEditedLog({
        ...editedLog,
        [field]: value
      });
    }
  };

  if (!log || !displayLog) return null;

  const getDriveTypeClass = (type: DriveType) => {
    switch (type) {
      case 'COMMUTE':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-blue-700';
      case 'BUSINESS':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-50 dark:text-teal-700';
      case 'PERSONAL':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-50 dark:text-purple-700';
      case 'UNCLASSIFIED':
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-50 dark:text-slate-700';
    }
  };

  const getDriveTypeLabel = (type: DriveType) => {
    const types = {
      COMMUTE: '출퇴근',
      BUSINESS: '업무',
      PERSONAL: '개인',
      UNCLASSIFIED: '미분류',
    } as const;
    return types[type];
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClosePanel}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden" >
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-[800px]">
                  <div className={`flex h-full flex-col ${currentTheme.cardBg} ${currentTheme.border} shadow-xl`}>
                    {/* 헤더 */}
                    <div className={`px-4 py-4 border-b ${currentTheme.border} flex items-center justify-between`}>
                      <Dialog.Title className={`text-lg font-semibold ${currentTheme.text}`}>
                        운행 기록 상세보기
                      </Dialog.Title>
                      <div className="flex items-center">
                        {!isEditing && (
                          <>
                            <button 
                              onClick={handleEdit}
                              className={`p-1.5 rounded-lg text-gray-500 hover:${currentTheme.hoverBg} focus:outline-none`}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            
                            {onDelete && (
                              <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={`p-1.5 rounded-lg text-gray-500 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-500'} focus:outline-none ml-1`}
                              >
                                {isDeleting ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <TrashIcon className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                        
                        {isEditing && (
                          <>
                            <button 
                              onClick={handleSaveEdit}
                              disabled={isUpdating}
                              className={`p-1.5 rounded-lg ${isUpdating ? 'text-gray-400' : 'text-green-600 hover:bg-green-50'} focus:outline-none`}
                            >
                              {isUpdating ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <CheckIcon className="h-5 w-5" />
                              )}
                            </button>
                            
                            <button 
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className={`p-1.5 rounded-lg text-gray-500 hover:${currentTheme.hoverBg} focus:outline-none ml-1 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        {!isEditing && (
                          <button
                            onClick={handleClosePanel}
                            className={`p-1.5 rounded-lg text-gray-500 hover:${currentTheme.hoverBg} focus:outline-none ml-1`}
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="relative flex-1 px-6 py-6 overflow-y-auto">
                      <div className="space-y-6">
                        {/* 성공 메시지 */}
                        {successMessage && (
                          <AlertMessage type="success" message={successMessage} />
                        )}
                        
                        {/* 오류 메시지 */}
                        {error && (
                          <AlertMessage type="error" message={error} />
                        )}
                        
                        {/* 차량 정보 */}
                        <div className="flex flex-col">
                          <h3 className={`text-xl font-bold ${currentTheme.text}`}>
                            {displayLog.vehicleNumber}
                          </h3>
                          
                          <div className="mt-2 flex items-center">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getDriveTypeClass(displayLog.driveType)}`}>
                              {getDriveTypeLabel(displayLog.driveType)}
                            </span>
                            {isEditing && (
                              <select
                                value={editedLog?.driveType || ''}
                                onChange={(e) => handleInputChange('driveType', e.target.value as DriveType)}
                                className={`ml-2 rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              >
                                <option value="COMMUTE">출퇴근</option>
                                <option value="BUSINESS">업무</option>
                                <option value="PERSONAL">개인</option>
                                <option value="UNCLASSIFIED">미분류</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 운행 시간 */}
                        <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                              <ClockIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                            </div>
                            <div className="ml-3">
                              <p className={`text-sm font-medium ${currentTheme.subtext}`}>운행 시간</p>
                              <div className="mt-1">
                                <div>
                                  <p className={`text-sm ${currentTheme.text}`}>
                                    {formatDate(displayLog.startTime)} ~ {formatDate(displayLog.endTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 주행 거리 */}
                        <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                              <ArrowsRightLeftIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className={`text-sm font-medium ${currentTheme.subtext}`}>주행 거리</p>
                              <div className="mt-1">
                                <div className="flex justify-between items-center">
                                  <span className={`text-sm ${currentTheme.subtext}`}>시작:</span>
                                  <span className={`text-sm font-medium ${currentTheme.text}`}>{formatNumber(displayLog.startMileage)} km</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span className={`text-sm ${currentTheme.subtext}`}>종료:</span>
                                  <span className={`text-sm font-medium ${currentTheme.text}`}>{formatNumber(displayLog.endMileage)} km</span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200">
                                  <span className={`text-sm ${currentTheme.subtext}`}>총 주행:</span>
                                  <span className={`text-sm font-bold ${currentTheme.text}`}>
                                    {formatNumber(displayLog.totalDistance ?? (displayLog.endMileage - displayLog.startMileage))} km
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 드라이버 정보 */}
                        <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                              <UserIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className={`text-sm font-medium ${currentTheme.subtext}`}>드라이버</p>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedLog?.driver?.name || ''}
                                  onChange={(e) => handleInputChange('driver', e.target.value ? { id: editedLog?.driver?.id || '0', name: e.target.value } : null)}
                                  className={`w-full mt-1 rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  placeholder="드라이버 이름"
                                />
                              ) : (
                                <p className={`mt-1 text-base font-medium ${currentTheme.text}`}>
                                  {displayLog.driver?.name || '미등록'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 비고 */}
                        <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                          <p className={`text-sm font-medium ${currentTheme.subtext} mb-2`}>비고</p>
                          {isEditing ? (
                            <textarea
                              value={editedLog?.note || ''}
                              onChange={(e) => handleInputChange('note', e.target.value)}
                              className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              placeholder="운행 관련 메모"
                              rows={4}
                            />
                          ) : (
                            <p className={`text-sm ${currentTheme.text}`}>
                              {displayLog.note || '-'}
                            </p>
                          )}
                        </div>

                        {/* 지도 */}
                        <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                          <p className={`text-lg font-medium ${currentTheme.subtext} mb-2`}>운행 경로</p>
                          <div className="h-96 rounded-lg overflow-hidden">
                            {isLoadingRoute ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              </div>
                            ) : routePoints.length > 0 ? (
                              <RouteMap
                                routePoints={routePoints}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className={`text-sm ${currentTheme.text}`}>경로 데이터가 없습니다.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}