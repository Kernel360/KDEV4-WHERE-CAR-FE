import { create } from 'zustand';
import { CarLogResponse, CarLogsParams, DriveType } from '@/types/logs';
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
  currentFilter: {
    vehicleNumber?: string;
    startDate?: string;
    endDate?: string;
    driveType?: DriveType;
  };
  
  fetchCarLogs: (params?: Partial<CarLogsParams>) => Promise<any>;
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
  
  fetchCarLogs: async (params) => {
    try {
      set({ isLoading: true, error: null });
      
      const { currentPage, pageSize, currentFilter } = get();
      const page = params?.page !== undefined ? params.page : currentPage;
      const size = params?.size !== undefined ? params.size : pageSize;
      
      const url = `${API_BASE_URL}/carLogs?page=${page}&size=${size}`;
      
      const vehicleNumber = params?.vehicleNumber !== undefined ? params.vehicleNumber : currentFilter.vehicleNumber;
      const startDate = params?.startDate !== undefined ? params.startDate : currentFilter.startDate;
      const endDate = params?.endDate !== undefined ? params.endDate : currentFilter.endDate;
      const driveType = params?.driveType !== undefined ? params.driveType : currentFilter.driveType;
      
      const requestBody: Record<string, any> = {};
      
      if (vehicleNumber) {
        requestBody.mdn = vehicleNumber;
      }
      
      if (startDate) {
        const formattedStartDate = new Date(startDate);
        formattedStartDate.setHours(0, 0, 0, 0);
        
        // 한국 시간대로 변환 (UTC+9)
        const koreaTimeString = formatToKoreaTime(formattedStartDate, true);
        requestBody.startTime = koreaTimeString;
      }
      
      if (endDate) {
        const formattedEndDate = new Date(endDate);
        formattedEndDate.setHours(23, 59, 59, 999);
        
        // 한국 시간대로 변환 (UTC+9)
        const koreaTimeString = formatToKoreaTime(formattedEndDate, false);
        requestBody.endTime = koreaTimeString;
      }
      
      if (driveType) {
        requestBody.driveType = driveType;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      const content = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
      const totalPages = data.totalPages || 1;
      const totalElements = data.totalElements || content.length;
      
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
      
      return data;
    } catch (error) {
      console.error('운행일지 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '운행일지 데이터를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
      return null;
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
const formatToKoreaTime = (date: Date, isStartDate: boolean): string => {
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