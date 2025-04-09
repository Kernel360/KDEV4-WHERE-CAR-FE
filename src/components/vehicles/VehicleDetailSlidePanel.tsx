import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TruckIcon, CalendarIcon, Battery100Icon, BuildingOfficeIcon, UserIcon, PencilIcon, TrashIcon, CheckIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useVehicleStore, Vehicle } from '@/lib/vehicleStore';
import { useCarOverviewStore } from '@/lib/carOverviewStore';
import AlertMessage from '../common/AlertMessage';
import NaverMap from './NaverMap';
import { fetchLatestPosition } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface VehicleDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function VehicleDetailSlidePanel({ isOpen, onClose, vehicle }: VehicleDetailSlidePanelProps) {
  const { currentTheme } = useTheme();
  const { updateVehicle, deleteVehicle, isLoading: storeLoading, error: storeError } = useVehicleStore();
  const { fetchOverview } = useCarOverviewStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [displayVehicle, setDisplayVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestPosition, setLatestPosition] = useState<{
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);

  // fetchLatestPositionData를 useCallback으로 감싸기
  const fetchLatestPositionData = useCallback(async () => {
    if (!vehicle) return;
    
    setIsLoadingPosition(true);
    try {
      const position = await fetchLatestPosition(vehicle.mdn);
      if (position) {
        setLatestPosition({
          latitude: position.latitude,
          longitude: position.longitude,
          timestamp: position.timestamp
        });
      } else {
        setLatestPosition(null);
      }
    } catch (error) {
      console.error('Error fetching position:', error);
      setLatestPosition(null);
    } finally {
      setIsLoadingPosition(false);
    }
  }, [vehicle]);

  useEffect(() => {
    if (vehicle) {
      setEditedVehicle(vehicle);
      setDisplayVehicle(vehicle);
      fetchLatestPositionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 창이 닫힐 때 수정 모드 초기화
  const handleClose = () => {
    // 모든 상태 초기화
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
    setEditedVehicle(displayVehicle);
    onClose();
  };

  const handleInputChange = (field: keyof Vehicle, value: string | number) => {
    if (!editedVehicle) return;
    
    let processedValue: string | number = value;
    
    // 숫자 필드 처리
    if (field === 'year' || field === 'mileage' || field === 'batteryVoltage') {
      const numValue = field === 'batteryVoltage' ? parseFloat(value as string) : parseInt(value as string);
      processedValue = isNaN(numValue) ? 0 : numValue;
    }

    setEditedVehicle({
      ...editedVehicle,
      [field]: processedValue
    });
  };

  const handleSaveEdit = async () => {
    if (!editedVehicle) return;
    
    try {
      // 낙관적 업데이트: 먼저 화면에 수정된 데이터를 표시
      setIsEditing(false);
      setSuccessMessage("수정되었습니다.");
      setDisplayVehicle(editedVehicle);
      
      // 백그라운드에서 API 호출
      await updateVehicle(editedVehicle);
      fetchOverview();
      
    } catch (err) {
      // 에러 발생 시 원래 상태로 되돌리지 않고 에러 메시지만 표시
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('차량 수정 오류:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedVehicle(displayVehicle);
    setError(null);
  };

  const handleDelete = async () => {
    if (!vehicle) return;
    
    if (window.confirm('정말로 이 차량을 삭제하시겠습니까?')) {
      try {
        await deleteVehicle(vehicle.id);
        fetchOverview();
        // 삭제 후 즉시 패널 닫기
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('차량 삭제 오류:', err);
      }
    }
  };

  if (!vehicle || !displayVehicle) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "운행";
      case "STOPPED":
        return "미운행";
      case "NOT_REGISTERED":
        return "미관제";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-teal-50 text-teal-700 dark:bg-teal-50 dark:text-teal-700";
      case "STOPPED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-50 dark:text-amber-700";
      case "NOT_REGISTERED":
        return "bg-slate-50 text-slate-700 dark:bg-slate-50 dark:text-slate-700";
      default:
        return "";
    }
  };

  const getAcquisitionTypeText = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return "구매";
      case "LEASE":
        return "리스";
      case "RENTAL":
        return "대여";
      case "FINANCING":
        return "할부";
      default:
        return type;
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
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
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-4xl">
                  <div className={`flex h-full flex-col overflow-y-scroll ${currentTheme.cardBg} shadow-xl`}>
                    <div className={`px-6 py-6 ${currentTheme.border} border-b`}>
                      <div className="flex items-center justify-between">
                        <Dialog.Title className={`text-xl font-semibold ${currentTheme.text}`}>
                          차량 상세 정보
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center space-x-2">
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                onClick={() => setIsEditing(true)}
                              >
                                <span className="sr-only">수정</span>
                                <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                                onClick={handleDelete}
                              >
                                <span className="sr-only">삭제</span>
                                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className={`p-1.5 rounded-lg ${storeLoading ? 'text-gray-400' : 'text-green-600 hover:bg-green-50'} focus:outline-none`}
                                onClick={handleSaveEdit}
                                disabled={storeLoading}
                              >
                                {storeLoading ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                              </button>
                              <button
                                type="button"
                                className={`p-1.5 rounded-lg text-gray-500 hover:${currentTheme.hoverBg} focus:outline-none ml-1 ${storeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleCancelEdit}
                                disabled={storeLoading}
                              >
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                          {!isEditing && (
                            <button
                              type="button"
                              className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                              onClick={handleClose}
                              disabled={storeLoading}
                            >
                              <span className="sr-only">닫기</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-8 py-8">
                      {storeLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : error || storeError ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-red-500">{error || storeError}</div>
                        </div>
                      ) : (
                        <div className="space-y-10">
                          {successMessage && (
                            <AlertMessage type="success" message={successMessage} />
                          )}
                          
                          {error && (
                            <AlertMessage type="error" message={error} />
                          )}
                          
                          {/* 차량 번호 및 상태 */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className={`text-3xl font-bold ${currentTheme.text}`}>{displayVehicle?.mdn}</h3>
                              <p className={`mt-2 text-base ${currentTheme.subtext}`}>
                                {displayVehicle?.make} {displayVehicle?.model}
                              </p>
                            </div>
                            <span className={`px-6 py-2 text-base font-medium rounded-full ${getStatusClass(displayVehicle?.carState || '')}`}>
                              {getStatusText(displayVehicle?.carState || '')}
                            </span>
                          </div>
                          
                          {/* 주요 정보 그리드 */}
                          <div className="grid grid-cols-2 gap-6">
                            <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white`}>
                              <p className={`text-sm text-gray-500 mb-1`}>제조사</p>
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <TruckIcon className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editedVehicle?.make || ''}
                                      onChange={(e) => handleInputChange('make', e.target.value)}
                                      className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  ) : displayVehicle.make}
                                </p>
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white`}>
                              <p className={`text-sm text-gray-500 mb-1`}>모델</p>
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <TruckIcon className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editedVehicle?.model || ''}
                                      onChange={(e) => handleInputChange('model', e.target.value)}
                                      className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  ) : displayVehicle.model}
                                </p>
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white`}>
                              <p className={`text-sm text-gray-500 mb-1`}>연식</p>
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editedVehicle?.year || ''}
                                      onChange={(e) => handleInputChange('year', e.target.value)}
                                      className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  ) : `${displayVehicle.year}년`}
                                </p>
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white`}>
                              <p className={`text-sm text-gray-500 mb-1`}>배터리 용량</p>
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <Battery100Icon className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                  {displayVehicle.batteryVoltage} kWh
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 상세 정보 */}
                          <div className="mt-8">
                            <h4 className={`text-lg font-medium ${currentTheme.text} mb-4`}>상세 정보</h4>
                            <div className="grid grid-cols-2 gap-6">
                              <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white`}>
                                <p className={`text-sm text-gray-500 mb-1`}>소유구분</p>
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    {displayVehicle.ownerType === "CORPORATE" ? (
                                      <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                                    ) : (
                                      <UserIcon className="h-5 w-5 text-blue-500" />
                                    )}
                                  </div>
                                  <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                    {isEditing ? (
                                      <select
                                        value={editedVehicle?.ownerType || ''}
                                        onChange={(e) => handleInputChange('ownerType', e.target.value as "CORPORATE" | "PERSONAL")}
                                        className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      >
                                        <option value="CORPORATE">법인</option>
                                        <option value="PERSONAL">개인</option>
                                      </select>
                                    ) : displayVehicle.ownerType === "CORPORATE" ? "법인" : "개인"}
                                  </p>
                                </div>
                              </div>

                              <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white`}>
                                <p className={`text-sm text-gray-500 mb-1`}>구매타입</p>
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                    {isEditing ? (
                                      <select
                                        value={editedVehicle?.acquisitionType || ''}
                                        onChange={(e) => handleInputChange('acquisitionType', e.target.value as "PURCHASE" | "LEASE" | "RENTAL" | "FINANCING")}
                                        className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      >
                                        <option value="PURCHASE">구매</option>
                                        <option value="LEASE">리스</option>
                                        <option value="RENTAL">대여</option>
                                        <option value="FINANCING">할부</option>
                                      </select>
                                    ) : getAcquisitionTypeText(displayVehicle.acquisitionType)}
                                  </p>
                                </div>
                              </div>

                              <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white col-span-2`}>
                                <p className={`text-sm text-gray-500 mb-1`}>관리 회사</p>
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editedVehicle?.make || ''}
                                        onChange={(e) => handleInputChange('make', e.target.value)}
                                        className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      />
                                    ) : displayVehicle.make}
                                  </p>
                                </div>
                              </div>

                              <div className={`p-4 rounded-xl ${currentTheme.border} border bg-white col-span-2`}>
                                <p className={`text-sm text-gray-500 mb-1`}>총 주행 거리</p>
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <TruckIcon className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <p className={`ml-3 text-lg font-medium ${currentTheme.text}`}>
                                    {displayVehicle.mileage.toLocaleString()} km
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                    
                          {/* 네이버 지도 */}
                          <div className="p-4 rounded-xl ${currentTheme.border} border">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className={`text-lg font-medium ${currentTheme.subtext} mb-2`}>차량 위치</h4>
                              <div className="flex items-center space-x-2">
                                {latestPosition && (
                                  <p className="text-sm text-muted-foreground">
                                    마지막 업데이트: {new Date(latestPosition.timestamp).toLocaleString()}
                                  </p>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={fetchLatestPositionData}
                                  disabled={isLoadingPosition}
                                  className="h-6 w-6"
                                >
                                  <ArrowPathIcon className={`h-3 w-3 ${isLoadingPosition ? 'animate-spin' : ''}`} />
                                </Button>
                              </div>
                            </div>
                            <div className="relative rounded-xl overflow-hidden shadow-lg">
                              {isLoadingPosition ? (
                                <div className="flex items-center justify-center h-[400px] bg-muted">
                                  <div className="flex flex-col items-center space-y-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                    <p className="text-sm text-muted-foreground">위치 정보를 불러오는 중...</p>
                                  </div>
                                </div>
                              ) : latestPosition ? (
                                <div className="h-[400px] relative">
                                  <NaverMap
                                    latitude={latestPosition.latitude}
                                    longitude={latestPosition.longitude}
                                    zoom={15}
                                  />
                                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                      <p className="text-sm font-medium">현재 위치</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      위도: {latestPosition.latitude.toFixed(6)}<br />
                                      경도: {latestPosition.longitude.toFixed(6)}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] bg-muted">
                                  <p className="text-muted-foreground">최근 위치 정보가 없습니다.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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