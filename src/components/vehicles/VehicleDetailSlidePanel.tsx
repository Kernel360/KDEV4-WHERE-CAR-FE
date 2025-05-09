import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TruckIcon, CalendarIcon, Battery100Icon, BuildingOfficeIcon, UserIcon, PencilIcon, TrashIcon, CheckIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useVehicleStore, Vehicle } from '@/lib/vehicleStore';
import { useCarOverviewStore } from '@/lib/carOverviewStore';
import AlertMessage from '../common/AlertMessage';
import VehicleLocationMap from '@/components/map/VehicleLocationMap';
import { fetchLatestPosition } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatDate, formatNumber } from '@/lib/utils';

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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // fetchLatestPositionData를 useCallback으로 감싸기
  const fetchLatestPositionData = useCallback(async () => {
    if (!vehicle) return;
    
    setIsLoadingPosition(true);
    try {
      const response = await fetchLatestPosition(vehicle.mdn);
      if (response && response.data) {
        setLatestPosition({
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timestamp: response.data.timestamp
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

  // 필드 유효성 검사 함수
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'mdn':
        if (!value.trim()) {
          return '차량번호는 필수입니다';
        }
        break;
      case 'make':
        if (!value.trim()) {
          return '제조사는 필수입니다';
        }
        if (value.length > 50) {
          return '제조사는 50자를 초과할 수 없습니다';
        }
        break;
      case 'model':
        if (!value.trim()) {
          return '모델명은 필수입니다';
        }
        if (value.length > 50) {
          return '모델명은 50자를 초과할 수 없습니다';
        }
        break;
      case 'year':
        if (!value.trim()) {
          return '연식은 필수입니다';
        }
        if (!/^\d{4}$/.test(value)) {
          return '연식은 4자리 숫자여야 합니다';
        }
        const yearNum = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (yearNum < 1900 || yearNum > currentYear) {
          return `연식은 1900년부터 ${currentYear}년 사이여야 합니다`;
        }
        break;
    }
    return null;
  };

  const handleInputChange = (field: keyof Vehicle, value: string | number) => {
    if (!editedVehicle) return;
    
    let processedValue: string | number = value;
    
    // 연식 입력 시 숫자만 허용
    if (field === 'year') {
      processedValue = value.toString().replace(/[^\d]/g, '').slice(0, 4);
    }

    // 유효성 검사
    const error = validateField(field, processedValue.toString());
    setFieldErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    setEditedVehicle({
      ...editedVehicle,
      [field]: processedValue
    });
  };

  // 필수 필드가 모두 유효한지 확인하는 함수
  const isFormValid = useCallback(() => {
    if (!editedVehicle) return false;

    // 필수 필드 목록
    const requiredFields: (keyof Vehicle)[] = ['mdn', 'make', 'model', 'year', 'ownerType', 'acquisitionType'];
    
    // 모든 필수 필드가 채워져 있고 에러가 없는지 확인
    return requiredFields.every(field => {
      const value = editedVehicle[field];
      return value && !fieldErrors[field];
    });
  }, [editedVehicle, fieldErrors]);

  const handleSaveEdit = async () => {
    if (!editedVehicle) return;
    
    // 모든 필드 유효성 검사
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    Object.entries(editedVehicle).forEach(([field, value]) => {
      if (field === 'id' || field === 'carState') return; // id와 carState 필드는 검사하지 않음
      const error = validateField(field, value.toString());
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      setError('입력값을 확인해주세요');
      return;
    }
    
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
                                className={`p-1.5 rounded-lg ${
                                  storeLoading || !isFormValid() 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-green-600 hover:bg-green-50'
                                } focus:outline-none`}
                                onClick={handleSaveEdit}
                                disabled={storeLoading || !isFormValid()}
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
                                      className={`w-full rounded-md border ${
                                        fieldErrors.make ? 'border-red-500' : currentTheme.border
                                      } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  ) : displayVehicle.make}
                                </p>
                              </div>
                              {fieldErrors.make && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.make}</p>
                              )}
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
                                      className={`w-full rounded-md border ${
                                        fieldErrors.model ? 'border-red-500' : currentTheme.border
                                      } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  ) : displayVehicle.model}
                                </p>
                              </div>
                              {fieldErrors.model && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.model}</p>
                              )}
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
                                      className={`w-full rounded-md border ${
                                        fieldErrors.year ? 'border-red-500' : currentTheme.border
                                      } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  ) : `${displayVehicle.year}년`}
                                </p>
                              </div>
                              {fieldErrors.year && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.year}</p>
                              )}
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
                                        className={`w-full rounded-md border ${
                                          fieldErrors.ownerType ? 'border-red-500' : currentTheme.border
                                        } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      >
                                        <option value="">소유자 유형을 선택하세요</option>
                                        <option value="CORPORATE">법인</option>
                                        <option value="PERSONAL">개인</option>
                                      </select>
                                    ) : displayVehicle.ownerType === "CORPORATE" ? "법인" : "개인"}
                                  </p>
                                </div>
                                {fieldErrors.ownerType && (
                                  <p className="mt-1 text-sm text-red-500">{fieldErrors.ownerType}</p>
                                )}
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
                                        onChange={(e) => handleInputChange('acquisitionType', e.target.value as "PURCHASE" | "LEASE" | "RENTAL")}
                                        className={`w-full rounded-md border ${
                                          fieldErrors.acquisitionType ? 'border-red-500' : currentTheme.border
                                        } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      >
                                        <option value="">취득 유형을 선택하세요</option>
                                        <option value="PURCHASE">구매</option>
                                        <option value="LEASE">리스</option>
                                        <option value="RENTAL">렌트</option>
                                      </select>
                                    ) : getAcquisitionTypeText(displayVehicle.acquisitionType)}
                                  </p>
                                </div>
                                {fieldErrors.acquisitionType && (
                                  <p className="mt-1 text-sm text-red-500">{fieldErrors.acquisitionType}</p>
                                )}
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
                              {latestPosition && latestPosition.latitude && latestPosition.longitude ? (
                                <VehicleLocationMap
                                  latitude={latestPosition.latitude}
                                  longitude={latestPosition.longitude}
                                  zoom={15}
                                  height="400px"
                                  isLoading={isLoadingPosition}
                                  showLocationInfo={true}
                                />
                              ) : (
                                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl" style={{ height: "400px" }}>
                                  <div className="text-center p-4">
                                    <p className="text-gray-700 dark:text-gray-300">
                                      현재 차량 위치 정보가 없습니다
                                    </p>
                                  </div>
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