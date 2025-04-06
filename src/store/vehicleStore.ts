import { create } from 'zustand';
import { StateCreator } from 'zustand';

type Vehicle = {
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

// API 요청에 사용할 기본 헤더를 가져오는 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  isLoading: false,
  error: null,
  selectedVehicle: null,

  fetchVehicles: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/cars', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('차량 데이터를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      console.log('Fetched vehicles:', data);
      set({ vehicles: data, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
        isLoading: false 
      });
      console.error('차량 데이터 가져오기 오류:', err);
    }
  },

//   addVehicle: async (vehicle: Omit<Vehicle, 'id'>) => {
//     try {
//       set({ isLoading: true, error: null });
//       const response = await fetch('/api/cars', {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify(vehicle),
//       });
      
//       if (!response.ok) {
//         throw new Error('차량 추가에 실패했습니다.');
//       }
      
//       const addedVehicle = await response.json();
//       set((state: VehicleState) => ({ 
//         vehicles: [...state.vehicles, addedVehicle],
//         isLoading: false 
//       }));
//     } catch (err) {
//       set({ 
//         error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
//         isLoading: false 
//       });
//       console.error('차량 추가 오류:', err);
//       throw err;
//     }
//   },

  addVehicle: async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicle),
      });
      
      if (!response.ok) {
        throw new Error('차량 추가에 실패했습니다.');
      }
  
      const message = await response.text();
      
      // 차량 목록 갱신
      const { fetchVehicles } = get();
      await fetchVehicles();
      
      set({ isLoading: false });
      return message;
  
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
      const response = await fetch(`/api/cars/${vehicle.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicle),
      });
      
      if (!response.ok) {
        throw new Error('차량 수정에 실패했습니다.');
      }
      
      const message = await response.text();
      
      // 차량 목록 갱신
      const { fetchVehicles } = get();
      await fetchVehicles();
      
      set({ isLoading: false });
      return message;
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
      const response = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('차량 삭제에 실패했습니다.');
      }
      
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