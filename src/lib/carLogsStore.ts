import { create } from 'zustand';
import { CarLogResponse, CarLogsParams } from '@/types/logs';
import { API_BASE_URL, fetchApi } from '@/lib/api';

interface CarLogUpdateData {
  driveType: string | null;
  driver: string;
  description: string;
}

interface CarLogsState {
  carLogs: CarLogResponse[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  fetchCarLogs: (params?: Partial<CarLogsParams>) => Promise<void>;
  updateCarLog: (logId: number, data: CarLogUpdateData) => Promise<{ success: boolean; message: string }>;
  deleteCarLog: (logId: number) => Promise<{ success: boolean; message: string }>;
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
  
  updateCarLog: async (logId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`${API_BASE_URL}/carLogs/${logId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      await get().fetchCarLogs();
      
      return {
        success: true,
        message: responseText || '수정되었습니다.'
      };
    } catch (error) {
      console.error('운행일지 수정 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '운행일지를 수정하는 중 오류가 발생했습니다',
        isLoading: false
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : '운행일지를 수정하는 중 오류가 발생했습니다'
      };
    }
  },
  
  deleteCarLog: async (logId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`${API_BASE_URL}/carLogs/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      // 응답이 단순 문자열인 경우 처리
      const responseText = await response.text();
      
      set({ isLoading: false });
      
      return {
        success: true,
        message: responseText || '삭제되었습니다.'
      };
    } catch (error) {
      console.error('운행일지 삭제 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '운행일지를 삭제하는 중 오류가 발생했습니다',
        isLoading: false
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : '운행일지를 삭제하는 중 오류가 발생했습니다'
      };
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