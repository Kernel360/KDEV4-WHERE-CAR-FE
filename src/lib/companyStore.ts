import { create } from 'zustand';
import { API_BASE_URL, fetchApi } from '@/lib/api';

export interface CompanyResponse {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  website: string;
}

export interface CompanyRequest {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  website: string;
}

interface CompanyState {
  company: CompanyResponse | null;
  isLoading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  
  // Actions
  fetchMyCompany: () => Promise<CompanyResponse | undefined>;
  updateMyCompany: (companyRequest: CompanyRequest) => Promise<boolean>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  company: null,
  isLoading: false,
  error: null,
  updating: false,
  updateError: null,
  updateSuccess: false,
  
  fetchMyCompany: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetchApi<{data: CompanyResponse, message: string, statusCode: number}>('/api/companies/my');
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const data = response.data || response;
      
      set({ 
        company: data,
        isLoading: false
      });
      
      return data;
    } catch (error) {
      console.error('회사 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '회사 데이터를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
    }
  },
  
  updateMyCompany: async (companyRequest: CompanyRequest) => {
    try {
      set({ updating: true, updateError: null, updateSuccess: false });
      
      const updateResponse = await fetchApi<{data: any, message: string, statusCode: number}>('/api/companies/my', undefined, {
        method: 'PUT',
        body: JSON.stringify(companyRequest)
      });
      
      // 업데이트가 성공하면 회사 정보를 다시 가져옴
      const response = await fetchApi<{data: CompanyResponse, message: string, statusCode: number}>('/api/companies/my');
      const updatedCompany = response.data || response;
      
      set({ 
        company: updatedCompany,
        updating: false,
        updateSuccess: true
      });
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        set({ updateSuccess: false });
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('회사 정보 업데이트 중 오류 발생:', error);
      set({ 
        updateError: error instanceof Error ? error.message : '회사 정보를 업데이트하는 중 오류가 발생했습니다',
        updating: false
      });
      return false;
    }
  }
})); 