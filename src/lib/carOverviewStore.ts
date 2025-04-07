import { create } from 'zustand';
import { API_BASE_URL, fetchApi } from '@/lib/api';

interface CarOverviewData {
  totalCars: number;
  totalCorporateCars: number;
  totalPrivateCars: number;
  activeCars: number;
  inactiveCars: number;
  untrackedCars: number;
}

interface CarOverviewState {
  data: CarOverviewData | null;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<CarOverviewData | undefined>;
}

export const useCarOverviewStore = create<CarOverviewState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  
  fetchOverview: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const data = await fetchApi<CarOverviewData>('/api/cars/overview');
      
      set({ 
        data: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('차량 개요 정보 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '차량 개요 정보를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
      return undefined;
    }
  }
})); 