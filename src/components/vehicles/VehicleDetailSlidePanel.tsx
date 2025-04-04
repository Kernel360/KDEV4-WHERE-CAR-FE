import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TruckIcon, CalendarIcon, Battery100Icon, BuildingOfficeIcon, UserIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

type Vehicle = {
  id: string;
  vehicleNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  ownershipType: "법인" | "개인";
  purchaseType: "구매" | "대여" | "리스" | "할부";
  managementCompany: string;
  batteryCapacity: number;
  status: "운행" | "미운행" | "미관제";
  totalDistance: number;
};

interface VehicleDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onDelete?: (id: string) => void;
  onUpdate?: (vehicle: Vehicle) => void;
}

export default function VehicleDetailSlidePanel({ isOpen, onClose, vehicle, onDelete, onUpdate }: VehicleDetailSlidePanelProps) {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);

  const handleEdit = () => {
    if (vehicle) {
      setEditedVehicle({ ...vehicle });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedVehicle(null);
  };

  const handleSaveEdit = () => {
    if (editedVehicle && onUpdate) {
      onUpdate(editedVehicle);
      setIsEditing(false);
      setEditedVehicle(null);
    }
  };

  // 삭제 처리
  const handleDelete = () => {
    if (vehicle && onDelete) {
      if (window.confirm('정말로 이 차량을 삭제하시겠습니까?')) {
        onDelete(vehicle.id);
        onClose();
      }
    }
  };

  const handleInputChange = (field: keyof Vehicle, value: string | number) => {
    if (editedVehicle) {
      setEditedVehicle({
        ...editedVehicle,
        [field]: value
      });
    }
  };

  if (!vehicle) return null;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "운행":
        return "bg-teal-50 text-teal-700 dark:bg-teal-50 dark:text-teal-700";
      case "미운행":
        return "bg-amber-50 text-amber-700 dark:bg-amber-50 dark:text-amber-700";
      case "미관제":
        return "bg-slate-50 text-slate-700 dark:bg-slate-50 dark:text-slate-700";
      default:
        return "";
    }
  };

  const displayVehicle = isEditing && editedVehicle ? editedVehicle : vehicle;

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
                                onClick={handleEdit}
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
                                className={`rounded-md ${currentTheme.text} hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                                onClick={handleSaveEdit}
                              >
                                <span className="sr-only">저장</span>
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                onClick={handleCancelEdit}
                              >
                                <span className="sr-only">취소</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                            onClick={onClose}
                          >
                            <span className="sr-only">닫기</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-6 py-6">
                      <div className="space-y-8">
                        {/* 차량 번호 및 상태 */}
                        <div className="flex items-center justify-between">
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedVehicle?.vehicleNumber || ''}
                                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                                className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                            ) : (
                              <h3 className={`text-2xl font-bold ${currentTheme.text}`}>{displayVehicle.vehicleNumber}</h3>
                            )}
                            <p className={`mt-1 text-sm ${currentTheme.subtext}`}>
                              {displayVehicle.manufacturer} {displayVehicle.model}
                            </p>
                          </div>
                          {isEditing ? (
                            <select
                              value={editedVehicle?.status || ''}
                              onChange={(e) => handleInputChange('status', e.target.value as "운행" | "미운행" | "미관제")}
                              className={`rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            >
                              <option value="운행">운행</option>
                              <option value="미운행">미운행</option>
                              <option value="미관제">미관제</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1.5 inline-flex text-sm font-medium rounded-full ${getStatusClass(displayVehicle.status)}`}>
                              {displayVehicle.status}
                            </span>
                          )}
                        </div>
                        
                        {/* 주요 정보 그리드 */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                                <TruckIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>제조사</p>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedVehicle?.manufacturer || ''}
                                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayVehicle.manufacturer}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                                <TruckIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>모델</p>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedVehicle?.model || ''}
                                    onChange={(e) => handleInputChange('model', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayVehicle.model}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                                <CalendarIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>연식</p>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editedVehicle?.year || ''}
                                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayVehicle.year}년</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg}`}>
                                <Battery100Icon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>배터리 용량</p>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editedVehicle?.batteryCapacity || ''}
                                    onChange={(e) => handleInputChange('batteryCapacity', parseFloat(e.target.value))}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayVehicle.batteryCapacity} kWh</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 상세 정보 */}
                        <div className={`border-t ${currentTheme.border} pt-6`}>
                          <h4 className={`text-lg font-medium ${currentTheme.text} mb-4`}>상세 정보</h4>
                          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className={`p-4 rounded-lg ${currentTheme.border} border`}>
                              <dt className={`text-sm font-medium ${currentTheme.subtext}`}>소유구분</dt>
                              <dd className={`mt-1 text-base ${currentTheme.text}`}>
                                {isEditing ? (
                                  <select
                                    value={editedVehicle?.ownershipType || ''}
                                    onChange={(e) => handleInputChange('ownershipType', e.target.value as "법인" | "개인")}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  >
                                    <option value="법인">법인</option>
                                    <option value="개인">개인</option>
                                  </select>
                                ) : (
                                  <div className="flex items-center mt-2">
                                    {displayVehicle.ownershipType === "법인" ? (
                                      <BuildingOfficeIcon className="h-5 w-5 text-blue-500 mr-2" />
                                    ) : (
                                      <UserIcon className="h-5 w-5 text-purple-500 mr-2" />
                                    )}
                                    {displayVehicle.ownershipType}
                                  </div>
                                )}
                              </dd>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${currentTheme.border} border`}>
                              <dt className={`text-sm font-medium ${currentTheme.subtext}`}>구매타입</dt>
                              <dd className={`mt-1 text-base ${currentTheme.text}`}>
                                {isEditing ? (
                                  <select
                                    value={editedVehicle?.purchaseType || ''}
                                    onChange={(e) => handleInputChange('purchaseType', e.target.value as "구매" | "대여" | "리스" | "할부")}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  >
                                    <option value="구매">구매</option>
                                    <option value="대여">대여</option>
                                    <option value="리스">리스</option>
                                    <option value="할부">할부</option>
                                  </select>
                                ) : (
                                  displayVehicle.purchaseType
                                )}
                              </dd>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${currentTheme.border} border sm:col-span-2`}>
                              <dt className={`text-sm font-medium ${currentTheme.subtext}`}>관리 회사명</dt>
                              <dd className={`mt-1 text-base ${currentTheme.text}`}>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedVehicle?.managementCompany || ''}
                                    onChange={(e) => handleInputChange('managementCompany', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  displayVehicle.managementCompany
                                )}
                              </dd>
                            </div>
                            
                            <div className={`p-4 rounded-lg ${currentTheme.border} border sm:col-span-2`}>
                              <dt className={`text-sm font-medium ${currentTheme.subtext}`}>총 주행 거리</dt>
                              <dd className={`mt-1 text-base ${currentTheme.text}`}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editedVehicle?.totalDistance || ''}
                                    onChange={(e) => handleInputChange('totalDistance', parseInt(e.target.value))}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  `${displayVehicle.totalDistance.toLocaleString()} km`
                                )}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className={`flex flex-shrink-0 justify-end px-6 py-4 ${currentTheme.border} border-t`}>
                      <button
                        type="button"
                        className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                        onClick={onClose}
                      >
                        닫기
                      </button>
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