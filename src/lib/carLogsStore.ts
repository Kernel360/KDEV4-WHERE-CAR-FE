import { create } from 'zustand';
import { CarLogResponse, CarLogsParams, DriveType } from '@/types/logs';
import { API_BASE_URL, fetchApi } from '@/lib/api';

// 이벤트 타입 정의
export type CarLogEvent = {
  type: 'update' | 'delete';
  message: string;
  success: boolean;
};

// 이벤트 리스너 타입 정의
type CarLogEventListener = (event: CarLogEvent) => void;

// 이벤트 리스너 관리
const eventListeners: CarLogEventListener[] = [];

// 이벤트 발생 함수
export const dispatchCarLogEvent = (event: CarLogEvent) => {
  eventListeners.forEach(listener => listener(event));
};

// 이벤트 리스너 등록
export const addCarLogEventListener = (listener: CarLogEventListener) => {
  eventListeners.push(listener);
  return () => {
    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  };
};

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
  currentFilter: {
    vehicleNumber?: string;
    startDate?: string;
    endDate?: string;
    driveType?: DriveType;
  };
  stats: {
    totalMileage: number;
    carLogsCount: string;
    monthlyMileages: Array<{
      month: string;
      totalMileage: number;
    }>;
  } | null;
  
  fetchCarLogs: (params?: Partial<CarLogsParams>) => Promise<any>;
  fetchCarLogsStats: () => Promise<void>;
  updateCarLog: (logId: number, data: CarLogUpdateData) => Promise<{ success: boolean; message: string }>;
  deleteCarLog: (logId: number) => Promise<{ success: boolean; message: string }>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Partial<CarLogsState['currentFilter']>) => void;
  resetFilter: () => void;
}

export const useCarLogsStore = create<CarLogsState>((set, get) => ({
  carLogs: [],
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 1,
  pageSize: 10,
  currentFilter: {
    vehicleNumber: undefined,
    startDate: undefined,
    endDate: undefined,
    driveType: undefined,
  },
  stats: null,
  
  fetchCarLogs: async (params) => {
    try {
      set({ isLoading: true, error: null });
      
      const { currentPage, pageSize, currentFilter } = get();
      const page = params?.page !== undefined ? params.page : currentPage;
      const size = params?.size !== undefined ? params.size : pageSize;
      
      const vehicleNumber = params?.vehicleNumber !== undefined ? params.vehicleNumber : currentFilter.vehicleNumber;
      const startDate = params?.startDate !== undefined ? params.startDate : currentFilter.startDate;
      const endDate = params?.endDate !== undefined ? params.endDate : currentFilter.endDate;
      const driveType = params?.driveType !== undefined ? params.driveType : currentFilter.driveType;
      
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('size', size.toString());
      
      if (vehicleNumber) {
        queryParams.append('mdn', vehicleNumber);
      }
      
      if (startDate) {
        queryParams.append('from', startDate);
      }
      
      if (endDate) {
        queryParams.append('to', endDate);
      }
      
      if (driveType) {
        queryParams.append('driveType', driveType);
      }
      
      const data = await fetchApi<{data: any, message: string, statusCode: number}>(`/api/carLogs?${queryParams.toString()}`, undefined, {
        method: 'GET'
      });
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const responseData = data.data || data;
      
      const content = Array.isArray(responseData.content) ? responseData.content : (Array.isArray(responseData) ? responseData : []);
      const totalPages = responseData.totalPages || 1;
      const totalElements = responseData.totalElements || content.length;
      
      if (params) {
        const newFilter = { ...currentFilter };
        
        if (params.vehicleNumber !== undefined) newFilter.vehicleNumber = params.vehicleNumber;
        if (params.startDate !== undefined) newFilter.startDate = params.startDate;
        if (params.endDate !== undefined) newFilter.endDate = params.endDate;
        if (params.driveType !== undefined) newFilter.driveType = params.driveType;
        
        set({ 
          currentFilter: newFilter,
          carLogs: content,
          currentPage: page,
          totalPages: totalPages,
          isLoading: false
        });
      } else {
        set({ 
          carLogs: content,
          currentPage: page,
          totalPages: totalPages,
          isLoading: false
        });
      }
      
      return responseData;
    } catch (error) {
      console.error('운행일지 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '운행일지 데이터를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
      return null;
    }
  },
  
  fetchCarLogsStats: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetchApi<{data: any, message: string, statusCode: number}>('/api/carLogs/statics', undefined, {
        method: 'GET'
      });
      
      // 새로운 API 응답 형식 처리
      const data = response.data || response;
      
      set({ 
        stats: {
          totalMileage: data.totalMileage || 0,
          carLogsCount: data.carLogsCount || "0",
          monthlyMileages: Array.isArray(data) ? data : []
        },
        isLoading: false
      });
    } catch (error) {
      console.error('운행 통계 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '운행 통계 데이터를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
    }
  },
  
  updateCarLog: async (logId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetchApi<{data: string, message: string, statusCode: number}>(`/api/carLogs/${logId}`, undefined, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      await get().fetchCarLogs();
      
      return {
        success: true,
        message: response.message || response.data || '운행일지가 성공적으로 수정되었습니다.'
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
      
      const response = await fetchApi<{data: string, message: string, statusCode: number}>(`/api/carLogs/${logId}`, undefined, {
        method: 'DELETE'
      });
      
      await get().fetchCarLogs();
      
      return {
        success: true,
        message: response.message || response.data || '운행일지가 성공적으로 삭제되었습니다.'
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
    const { currentFilter } = get();
    get().fetchCarLogs({ 
      page,
      vehicleNumber: currentFilter.vehicleNumber,
      startDate: currentFilter.startDate,
      endDate: currentFilter.endDate,
      driveType: currentFilter.driveType
    });
  },
  
  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 0 });
    const { currentFilter } = get();
    get().fetchCarLogs({ 
      page: 0, 
      size,
      vehicleNumber: currentFilter.vehicleNumber,
      startDate: currentFilter.startDate,
      endDate: currentFilter.endDate,
      driveType: currentFilter.driveType
    });
  },
  
  setFilter: (filter) => {
    const { currentFilter } = get();
    const newFilter = { ...currentFilter, ...filter };
    
    // 스토어 상태 업데이트
    set({ currentFilter: newFilter, currentPage: 0 });
    
    // 명시적으로 API 요청 실행
    get().fetchCarLogs({ 
      page: 0,
      vehicleNumber: newFilter.vehicleNumber,
      startDate: newFilter.startDate,
      endDate: newFilter.endDate,
      driveType: newFilter.driveType
    });
  },
  
  resetFilter: () => {
    set({ 
      currentFilter: {
        vehicleNumber: undefined,
        startDate: undefined,
        endDate: undefined,
        driveType: undefined,
      },
      currentPage: 0
    });
    get().fetchCarLogs({ page: 0 });
  }
}));

// 한국 시간으로 변환하는 함수 추가
const formatToKoreaTime = (date: Date | null | undefined, isStartDate: boolean): string => {
  if (!date || isNaN(date.getTime())) {
    // 기본 날짜 포맷 반환
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = isStartDate ? '00' : '23';
    const minutes = isStartDate ? '00' : '59';
    const seconds = isStartDate ? '00' : '59';
    const milliseconds = isStartDate ? '482' : '496';
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // 시작일은 00:00:00.482, 종료일은 23:59:59.496으로 고정
  const hours = isStartDate ? '00' : '23';
  const minutes = isStartDate ? '00' : '59';
  const seconds = isStartDate ? '00' : '59';
  const milliseconds = isStartDate ? '482' : '496';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}; 