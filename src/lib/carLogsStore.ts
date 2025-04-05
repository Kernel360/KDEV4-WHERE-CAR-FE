import { create } from 'zustand';
import { CarLogResponse, CarLogsParams } from '@/types/logs';
import { API_BASE_URL, fetchApi } from '@/lib/api';

interface CarLogsState {
  carLogs: CarLogResponse[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Actions
  fetchCarLogs: (params?: Partial<CarLogsParams>) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useCarLogsStore = create<CarLogsState>((set, get) => ({
  carLogs: [],
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 1,
  pageSize: 10,
  
  fetchCarLogs: async (params) => {
    try {
      set({ isLoading: true, error: null });
      
      const { currentPage, pageSize } = get();
      const page = params?.page !== undefined ? params.page : currentPage;
      const size = params?.size !== undefined ? params.size : pageSize;
      
      const data = await fetchApi<CarLogResponse[]>('/carLogs', { page, size });
      
      set({ 
        carLogs: data,
        currentPage: page,
        // 백엔드가 총 페이지 수를 제공하는 경우 추가
        // totalPages: data.totalPages || 1,
        isLoading: false
      });
    } catch (error) {
      console.error('운행일지 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '운행일지 데이터를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
    }
  },
  
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchCarLogs({ page });
  },
  
  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 0 });
    get().fetchCarLogs({ page: 0, size });
  },
})); 