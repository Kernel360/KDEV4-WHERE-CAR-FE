import { create } from 'zustand';
import { fetchApi, API_BASE_URL } from '@/lib/api';

// 사용자 정보 인터페이스
export interface UserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  jobTitle: string;
}

// 회사 정보 인터페이스
export interface CompanyRequest {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
}

// 루트 계정 등록 요청 인터페이스
export interface RootUserRequest {
  user: UserRequest;
  company: CompanyRequest;
}

// 회원 가입 상태 인터페이스
interface RegisterState {
  isRegistering: boolean;
  registerError: string | null;
  registerSuccess: boolean;
  
  // 루트 계정 등록 메서드
  registerRootUser: (requestData: RootUserRequest) => Promise<boolean>;
  
  // 성공 상태 초기화
  resetRegisterSuccess: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
  isRegistering: false,
  registerError: null,
  registerSuccess: false,
  
  // 루트 계정 등록 메서드
  registerRootUser: async (requestData: RootUserRequest) => {
    try {
      set({ isRegistering: true, registerError: null });
      
      // API 응답이 성공하면 빈 객체를 반환하므로, 에러가 발생하지 않으면 성공으로 간주
      await fetchApi<any>('/api/users/root', undefined, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      set({ 
        isRegistering: false,
        registerSuccess: true
      });
      
      return true;
    } catch (error) {
      set({ 
        isRegistering: false,
        registerError: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
      
      return false;
    }
  },
  
  // 성공 상태 초기화
  resetRegisterSuccess: () => {
    set({ registerSuccess: false });
  }
})); 