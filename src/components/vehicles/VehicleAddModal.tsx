import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useVehicleStore } from '@/store/vehicleStore';

type Vehicle = {
  id: number;
  mdn: string;
  make: string;
  model: string;
  year: number | null;
  mileage: number;
  ownerType: "CORPORATE" | "PERSONAL";
  acquisitionType: "PURCHASE" | "LEASE" | "RENTAL" | "FINANCING";
  companyName: string;
  batteryVoltage: number;
  carState: "RUNNING" | "STOPPED" | "NOT_REGISTERED";
};

type VehicleAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function VehicleAddModal({ isOpen, onClose }: VehicleAddModalProps) {
  const { currentTheme } = useTheme();
  const { addVehicle, isLoading: storeLoading, error: storeError } = useVehicleStore();
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
    mdn: '',
    make: '',
    model: '',
    year: null,
    mileage: 0,
    ownerType: 'CORPORATE',
    acquisitionType: 'PURCHASE',
    companyName: '',
    batteryVoltage: 0,
    carState: 'RUNNING'
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof Omit<Vehicle, 'id'>, value: string | number) => {
    let processedValue: string | number = value;
    
    // 숫자 필드 처리
    if (field === 'year' || field === 'mileage' || field === 'batteryVoltage') {
      const numValue = field === 'batteryVoltage' ? parseFloat(value as string) : parseInt(value as string);
      processedValue = isNaN(numValue) ? 0 : numValue;
    }

    setNewVehicle({
      ...newVehicle,
      [field]: processedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    // 필수 필드 검증
    const requiredFields = {
      '차량번호': newVehicle.mdn,
      '제조사': newVehicle.make,
      '모델명': newVehicle.model,
      '연식': newVehicle.year,
      '총주행거리': newVehicle.mileage,
      '배터리전력': newVehicle.batteryVoltage
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value && value !== 0)
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      setError(`다음 필드를 입력해주세요: ${emptyFields.join(', ')}`);
      return;
    }

    try {
      const message = await addVehicle(newVehicle);
      setSuccessMessage(message);
      // 성공 시 입력 필드 초기화
      setNewVehicle({
        mdn: '',
        make: '',
        model: '',
        year: '',
        mileage: 0,
        ownerType: 'CORPORATE',
        acquisitionType: 'PURCHASE',
        companyName: '',
        batteryVoltage: 0,
        carState: 'NOT_REGISTERED'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
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
                          className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          required
                          disabled={storeLoading}
                        />
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
                            className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            required
                            disabled={storeLoading}
                          />
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
                            className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            required
                            disabled={storeLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="year" className={`block text-sm font-medium ${currentTheme.text}`}>
                            연식
                          </label>
                          <input
                            type="number"
                            id="year"
                            value={newVehicle.year || ''}
                            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                            className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            required
                            disabled={storeLoading}
                          />
                        </div>
                        <div>
                          <label htmlFor="mileage" className={`block text-sm font-medium ${currentTheme.text}`}>
                            총 주행거리 (km)
                          </label>
                          <input
                            type="number"
                            id="mileage"
                            value={newVehicle.mileage}
                            onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                            className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            required
                            disabled={storeLoading}
                          />
                        </div>
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
                          type="number"
                          id="batteryVoltage"
                          value={newVehicle.batteryVoltage}
                          onChange={(e) => handleInputChange('batteryVoltage', parseFloat(e.target.value))}
                          className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          required
                          disabled={storeLoading}
                        />
                      </div>

                      <div>
                        <label htmlFor="carState" className={`block text-sm font-medium ${currentTheme.text}`}>
                          차량 상태
                        </label>
                        <select
                          id="carState"
                          value={newVehicle.carState}
                          onChange={(e) => handleInputChange('carState', e.target.value as "RUNNING" | "STOPPED" | "NOT_REGISTERED")}
                          className={`mt-1 block w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          required
                          disabled={storeLoading}
                        >
                          <option value="RUNNING">운행</option>
                          <option value="STOPPED">미운행</option>
                          <option value="NOT_REGISTERED">미관제</option>
                        </select>
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