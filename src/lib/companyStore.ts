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
      
      const data = await fetchApi<CompanyResponse>('/companies/my');
      
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
      
      const response = await fetch(`${API_BASE_URL}/companies/my`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyRequest)
      });
      
      if (!response.ok) {
        throw new Error(`회사 정보 업데이트 실패: ${response.status}`);
      }
      
      // 업데이트가 성공하면 회사 정보를 다시 가져옴
      const updatedCompany = await fetch(`${API_BASE_URL}/companies/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        }
      }).then(res => {
        if (!res.ok) throw new Error('회사 정보를 가져오는데 실패했습니다.');
        return res.json();
      });
      
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