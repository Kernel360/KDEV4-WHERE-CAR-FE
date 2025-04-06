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
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  isLoading: false,
  error: null,
  selectedVehicle: null,

  fetchVehicles: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 먼저 차량 개요 데이터에서 전체 차량 수를 가져옵니다
      const overviewData = await fetchApi<{totalCars: number}>('/cars/overview');
      const totalCars = overviewData.totalCars || 100; // 기본값으로 100 설정
      
      // 페이지 번호 0, 페이지 크기를 전체 차량 수로 설정하여 모든 차량을 한 번에 가져옵니다
      const response = await fetchApi<Vehicle[] | {content: Vehicle[], totalElements: number}>(`/cars?page=0&size=${totalCars}`);
      
      // 응답이 페이지네이션 구조인지 확인
      let vehicles: Vehicle[];
      if (Array.isArray(response)) {
        vehicles = response;
      } else if (response && typeof response === 'object' && 'content' in response) {
        vehicles = response.content;
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
      
      const response = await fetchApi<string>('/cars', undefined, {
        method: 'POST',
        body: JSON.stringify(vehicle),
      });
      
      // 차량 목록 갱신
      const { fetchVehicles } = get();
      await fetchVehicles();
      
      set({ isLoading: false });
      
      // 응답이 문자열이라면 그대로 반환, 아니라면 기본 성공 메시지 반환
      if (typeof response === 'string') {
        return response;
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
      
      const response = await fetchApi<string>(`/cars/${vehicle.id}`, undefined, {
        method: 'PUT',
        body: JSON.stringify(vehicle),
      });
      
      // 차량 목록 갱신
      const { fetchVehicles } = get();
      await fetchVehicles();
      
      set({ isLoading: false });
      
      // 응답이 문자열이라면 그대로 반환, 아니라면 기본 성공 메시지 반환
      if (typeof response === 'string') {
        return response;
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
      
      await fetchApi<void>(`/cars/${id}`, undefined, {
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
})); 