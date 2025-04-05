import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, TruckIcon, UserIcon, PencilIcon, TrashIcon, ArrowsRightLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { VehicleLog, DriveType } from '@/types/logs';
import { formatDate, formatNumber } from '@/lib/utils';
import { useCarLogsStore } from '@/lib/carLogsStore';

interface VehicleLogDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  log: VehicleLog | null;
  onDelete?: (id: string) => void;
  onUpdate?: (log: VehicleLog) => void;
}

export default function VehicleLogDetailSlidePanel({ isOpen, onClose, log, onDelete, onUpdate }: VehicleLogDetailSlidePanelProps) {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLog, setEditedLog] = useState<VehicleLog | null>(null);
  const { updateCarLog, deleteCarLog } = useCarLogsStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // log가 변경되면 editedLog도 업데이트
  useEffect(() => {
    if (log) {
      setEditedLog({ ...log });
    }
  }, [log]);

  const handleEdit = () => {
    if (log) {
      setEditedLog({ ...log });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (log) {
      setEditedLog({ ...log });  // 원래 값으로 되돌림
    }
  };

  const handleSaveEdit = async () => {
    if (editedLog) {
      setIsUpdating(true);
      
      try {
        const updateData = {
          driveType: editedLog.driveType === 'UNREGISTERED' ? null : editedLog.driveType,
          driver: editedLog.driver?.name || '',
          description: editedLog.note || ''
        };
        
        const logId = parseInt(editedLog.id, 10);
        if (isNaN(logId)) {
          throw new Error('유효하지 않은 로그 ID');
        }
        
        const result = await updateCarLog(logId, updateData);
        
        if (result.success) {
          console.log('수정 성공:', result.message);
          
          if (onUpdate) {
            onUpdate(editedLog);
          }
          setIsEditing(false);
          onClose(); // 수정 완료 후 패널 닫기
        } else {
          console.error('수정 실패:', result.message);
        }
      } catch (error) {
        console.error('운행 기록 업데이트 오류:', error);
      } finally {
        setIsUpdating(false);
      }
    }
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
              console.log('삭제 성공:', result.message);
              
              onClose();

              onDelete(log.id);
            } else {
              console.error('삭제 실패:', result.message);
              alert('삭제 중 오류가 발생했습니다.');
            }
          })
          .catch(error => {
            console.error('운행 기록 삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
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

  if (!log) return null;

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

  const displayLog = isEditing && editedLog ? editedLog : log;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-[550px]">
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
                        
                        <button
                          onClick={onClose}
                          className={`p-1.5 rounded-lg text-gray-500 hover:${currentTheme.hoverBg} focus:outline-none ml-1`}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* 수정 모드 액션 바 */}
                    {isEditing && (
                      <div className={`px-4 py-3 border-b ${currentTheme.border} flex justify-between`}>
                        <button
                          onClick={handleCancelEdit}
                          className={`px-3 py-1.5 border ${currentTheme.border} rounded-lg text-sm ${currentTheme.text}`}
                          disabled={isUpdating}
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 ${isUpdating ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg text-sm flex items-center`}
                        >
                          {isUpdating ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              저장 중...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 inline mr-1" />
                              저장
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* 내용 */}
                    <div className="relative flex-1 px-6 py-6 overflow-y-auto">
                      <div className="space-y-6">
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
                                <option value="WORK">업무</option>
                                <option value="UNREGISTERED">미등록</option>
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
                                  <span className={`text-sm font-bold ${currentTheme.text}`}>{formatNumber(displayLog.totalDistance)} km</span>
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