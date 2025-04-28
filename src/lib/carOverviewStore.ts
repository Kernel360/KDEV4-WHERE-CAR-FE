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
      
      const response = await fetchApi<{data: CarOverviewData, message: string, statusCode: number}>('/api/cars/overview');
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const data = response.data || response;
      
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