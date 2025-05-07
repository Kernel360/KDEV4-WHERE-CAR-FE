import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useVehicleStore, Vehicle } from '@/lib/vehicleStore';
import { useCarOverviewStore } from '@/lib/carOverviewStore';

// vehicleStore.ts의 타입 사용

type VehicleAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
};

export default function VehicleAddModal({ isOpen, onClose, onComplete }: VehicleAddModalProps) {
  const { currentTheme } = useTheme();
  const { addVehicle, isLoading: storeLoading, error: storeError } = useVehicleStore();
  const { fetchOverview } = useCarOverviewStore();
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
    mdn: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    ownerType: 'CORPORATE',
    acquisitionType: 'PURCHASE',
    batteryVoltage: 0,
    carState: 'NOT_REGISTERED'
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateField = (field: keyof Omit<Vehicle, 'id'>, value: any): string | null => {
    switch (field) {
      case 'year':
        if (typeof value === 'string' && value.length === 0) {
          return '연식을 입력해주세요';
        }
        break;
      case 'mdn':
        if (typeof value === 'string' && value.length === 0) {
          return '차량번호를 입력해주세요';
        }
        break;
      case 'make':
        if (typeof value === 'string' && value.length === 0) {
          return '제조사를 입력해주세요';
        }
        if (value.length > 50) {
          return '제조사명은 50자를 초과할 수 없습니다';
        }
        break;
      case 'model':
        if (typeof value === 'string' && value.length === 0) {
          return '모델명을 입력해주세요';
        }
        if (value.length > 50) {
          return '모델명은 50자를 초과할 수 없습니다';
        }
        break;
      case 'ownerType':
        if (!['CORPORATE', 'PERSONAL'].includes(value)) {
          return '올바른 소유구분을 선택해주세요';
        }
        break;
      case 'acquisitionType':
        if (!['PURCHASE', 'LEASE', 'RENTAL', 'FINANCING'].includes(value)) {
          return '올바른 구매방법을 선택해주세요';
        }
        break;
    }
    return null;
  };

  const handleInputChange = (field: keyof Omit<Vehicle, 'id'>, value: string | number) => {
    let processedValue: string | number = value;
    
    // year는 문자열로 처리
    if (field === 'year') {
      processedValue = value.toString();
    }

    const error = validateField(field, processedValue);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    setNewVehicle({
      ...newVehicle,
      [field]: processedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 모든 필드 유효성 검사
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    Object.entries(newVehicle).forEach(([field, value]) => {
      if (field === 'carState') return; // carState 필드는 검사하지 않음
      const error = validateField(field as keyof Omit<Vehicle, 'id'>, value);
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
      if (onComplete) {
        await onComplete(newVehicle);
        fetchOverview();
        setNewVehicle({
          mdn: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          mileage: 0,
          ownerType: 'CORPORATE',
          acquisitionType: 'PURCHASE',
          batteryVoltage: 0,
          carState: 'NOT_REGISTERED'
        });
      } else {
        const message = await addVehicle(newVehicle);
        fetchOverview();
        setSuccessMessage(message);
        
        setNewVehicle({
          mdn: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          mileage: 0,
          ownerType: 'CORPORATE',
          acquisitionType: 'PURCHASE',
          batteryVoltage: 0,
          carState: 'NOT_REGISTERED'
        });
      }
    } catch (err) {
      if (!onComplete) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      }
      console.error('차량 등록 오류:', err);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg ${currentTheme.cardBg} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    onClick={onClose}
                    disabled={storeLoading}
                  >
                    <span className="sr-only">닫기</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className={`text-lg font-semibold leading-6 ${currentTheme.text}`}>
                      차량 추가
                    </Dialog.Title>
                    {error && (
                      <div className="mt-2 text-sm text-red-500">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="mt-2 text-sm text-green-500 font-medium">
                        {successMessage}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="mdn" className={`block text-sm font-medium ${currentTheme.text}`}>
                          차량 번호
                        </label>
                        <input
                          type="text"
                          id="mdn"
                          value={newVehicle.mdn}
                          onChange={(e) => handleInputChange('mdn', e.target.value)}
                          className={`mt-1 block w-full rounded-md border ${
                            fieldErrors.mdn ? 'border-red-500' : currentTheme.border
                          } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          placeholder="12가 3456"
                          required
                          disabled={storeLoading}
                        />
                        {fieldErrors.mdn && (
                          <p className="mt-1 text-sm text-red-500">{fieldErrors.mdn}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="make" className={`block text-sm font-medium ${currentTheme.text}`}>
                            제조사
                          </label>
                          <input
                            type="text"
                            id="make"
                            value={newVehicle.make}
                            onChange={(e) => handleInputChange('make', e.target.value)}
                            className={`mt-1 block w-full rounded-md border ${
                              fieldErrors.make ? 'border-red-500' : currentTheme.border
                            } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="현대"
                            required
                            disabled={storeLoading}
                          />
                          {fieldErrors.make && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.make}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="model" className={`block text-sm font-medium ${currentTheme.text}`}>
                            모델명
                          </label>
                          <input
                            type="text"
                            id="model"
                            value={newVehicle.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            className={`mt-1 block w-full rounded-md border ${
                              fieldErrors.model ? 'border-red-500' : currentTheme.border
                            } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="아반떼"
                            required
                            disabled={storeLoading}
                          />
                          {fieldErrors.model && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.model}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="year" className={`block text-sm font-medium ${currentTheme.text}`}>
                          연식
                        </label>
                        <input
                          type="text"
                          id="year"
                          value={newVehicle.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          className={`mt-1 block w-full rounded-md border ${
                            fieldErrors.year ? 'border-red-500' : currentTheme.border
                          } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          placeholder="2024"
                          required
                          disabled={storeLoading}
                        />
                        {fieldErrors.year && (
                          <p className="mt-1 text-sm text-red-500">{fieldErrors.year}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="ownerType" className={`block text-sm font-medium ${currentTheme.text}`}>
                            소유구분
                          </label>
                          <select
                            id="ownerType"
                            value={newVehicle.ownerType}
                            onChange={(e) => handleInputChange('ownerType', e.target.value as "CORPORATE" | "PERSONAL")}
                            className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            required
                            disabled={storeLoading}
                          >
                            <option value="CORPORATE">법인</option>
                            <option value="PERSONAL">개인</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="acquisitionType" className={`block text-sm font-medium ${currentTheme.text}`}>
                            구매방법
                          </label>
                          <select
                            id="acquisitionType"
                            value={newVehicle.acquisitionType}
                            onChange={(e) => handleInputChange('acquisitionType', e.target.value as "PURCHASE" | "LEASE" | "RENTAL" | "FINANCING")}
                            className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            required
                            disabled={storeLoading}
                          >
                            <option value="PURCHASE">구매</option>
                            <option value="LEASE">리스</option>
                            <option value="RENTAL">대여</option>
                            <option value="FINANCING">할부</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="batteryVoltage" className={`block text-sm font-medium ${currentTheme.text}`}>
                          배터리 전력 (V)
                        </label>
                        <input
                          type="text"
                          id="batteryVoltage"
                          value={newVehicle.batteryVoltage}
                          onChange={(e) => handleInputChange('batteryVoltage', e.target.value)}
                          className={`mt-1 block w-full rounded-md border ${
                            fieldErrors.batteryVoltage ? 'border-red-500' : currentTheme.border
                          } ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          min="0"
                          max="1000"
                          required
                          disabled={storeLoading}
                        />
                        {fieldErrors.batteryVoltage && (
                          <p className="mt-1 text-sm text-red-500">{fieldErrors.batteryVoltage}</p>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                          disabled={storeLoading}
                        >
                          {storeLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          ) : null}
                          추가
                        </button>
                        <button
                          type="button"
                          className={`mt-3 inline-flex w-full justify-center rounded-md ${currentTheme.cardBg} px-3 py-2 text-sm font-semibold ${currentTheme.text} shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto`}
                          onClick={onClose}
                          disabled={storeLoading}
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 