import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, TruckIcon, UserIcon, PencilIcon, TrashIcon, ArrowsRightLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { VehicleLog, DriveType } from '@/types/logs';
import { formatDate, formatNumber } from '@/lib/utils';

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

  const handleEdit = () => {
    if (log) {
      setEditedLog({ ...log });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLog(null);
  };

  const handleSaveEdit = () => {
    if (editedLog && onUpdate) {
      onUpdate(editedLog);
      setIsEditing(false);
      setEditedLog(null);
    }
  };

  // 삭제 처리
  const handleDelete = () => {
    if (log && onDelete) {
      if (window.confirm('정말로 이 운행 기록을 삭제하시겠습니까?')) {
        onDelete(log.id);
        onClose();
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
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 focus:outline-none ml-1"
                              >
                                <TrashIcon className="h-5 w-5" />
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
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                        >
                          <CheckIcon className="h-4 w-4 inline mr-1" />
                          저장
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
                                <option value="PERSONAL">개인</option>
                                <option value="CORPORATE">법인</option>
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