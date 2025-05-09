import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { API_BASE_URL, fetchApi } from '@/lib/api';

export type Vehicle = {
  id: string;
  mdn: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  ownerType: "CORPORATE" | "PERSONAL";
  acquisitionType: "PURCHASE" | "LEASE" | "RENTAL" | "FINANCING";
  batteryVoltage: number;
  carState: "RUNNING" | "STOPPED" | "NOT_REGISTERED";
  latitude?: number;  // 차량 위치 - 위도
  longitude?: number; // 차량 위치 - 경도
};

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  selectedVehicle: Vehicle | null;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (vehicle: Vehicle) => Promise<string>;
  deleteVehicle: (id: string) => Promise<void>;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  checkMdnExists: (mdn: string) => Promise<boolean>;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  isLoading: false,
  error: null,
  selectedVehicle: null,

  fetchVehicles: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const overviewResponse = await fetchApi<{data: {totalCars: number}, message: string, statusCode: number}>('/api/cars/overview');
      const overviewData = overviewResponse.data || overviewResponse;
      const totalCars = overviewData.totalCars || 100; 
      
      const response = await fetchApi<{data: Vehicle[] | {content: Vehicle[], totalElements: number}, message: string, statusCode: number}>(`/api/cars?page=0&size=${totalCars}`);
      const responseData = response.data || response;
 
      let vehicles: Vehicle[];
      if (Array.isArray(responseData)) {
        vehicles = responseData;
      } else if (responseData && typeof responseData === 'object' && 'content' in responseData) {
        vehicles = responseData.content;
      } else {
        vehicles = [];
      }
      
      console.log('Fetched vehicles:', vehicles);
      set({ vehicles, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
      console.error('차량 데이터 가져오기 오류:', err);
    }
  },

  addVehicle: async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetchApi<{data: string, message: string, statusCode: number}>('/api/cars', undefined, {
        method: 'POST',
        body: JSON.stringify(vehicle),
      });
      
      const { fetchVehicles } = get();
      await fetchVehicles();
      
      set({ isLoading: false });
      
      const responseData = response.data || response;
      
      if (typeof responseData === 'string') {
        return responseData;
      } else if (response.message) {
        return response.message;
      } else {
        return '차량이 성공적으로 등록되었습니다.';
      }
  
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false
      });
      console.error('차량 추가 오류:', err);
      throw err;
    }
  },

  updateVehicle: async (vehicle: Vehicle) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetchApi<{data: string, message: string, statusCode: number}>(`/api/cars/${vehicle.id}`, undefined, {
        method: 'PUT',
        body: JSON.stringify(vehicle),
      });
      
      // 차량 목록 갱신
      const { fetchVehicles } = get();
      await fetchVehicles();
      
      set({ isLoading: false });
      
      const responseData = response.data || response;
      
      // 응답이 문자열이라면 그대로 반환, 아니라면 기본 성공 메시지 반환
      if (typeof responseData === 'string') {
        return responseData;
      } else if (response.message) {
        return response.message;
      } else {
        return '차량 정보가 성공적으로 수정되었습니다.';
      }
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
      console.error('차량 수정 오류:', err);
      throw err;
    }
  },

  deleteVehicle: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await fetchApi<{data: any, message: string, statusCode: number}>(`/api/cars/${id}`, undefined, {
        method: 'DELETE',
      });
      
      set((state: VehicleState) => ({
        vehicles: state.vehicles.filter((v: Vehicle) => v.id !== id),
        isLoading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
      console.error('차량 삭제 오류:', err);
      throw err;
    }
  },

  setSelectedVehicle: (vehicle: Vehicle | null) => {
    set({ selectedVehicle: vehicle });
  },

  checkMdnExists: async (mdn: string) => {
    try {
      const { vehicles } = get();
      return vehicles.some(vehicle => vehicle.mdn === mdn);
    } catch (err) {
      console.error('차량번호 중복 체크 오류:', err);
      return false;
    }
  },
})); 