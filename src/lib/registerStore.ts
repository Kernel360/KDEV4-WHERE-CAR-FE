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
  registerRootUser: (data: RootUserRequest) => Promise<void>;
  
  // 성공 상태 초기화
  resetRegisterSuccess: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
  isRegistering: false,
  registerError: null,
  registerSuccess: false,
  
  // 루트 계정 등록 메서드
  registerRootUser: async (data: RootUserRequest) => {
    try {
      set({ isRegistering: true, registerError: null });
      
      console.log('회원가입 요청 데이터:', data);
      console.log('API 요청 URL:', `${API_BASE_URL}/api/users/root`);
      
      // 요청 본문 구성 (서버 형식에 맞게 조정)
      const requestBody = JSON.stringify(data);
      console.log('요청 본문:', requestBody);
      
      // API 요청 - 엔드포인트에 '/api' 접두사 추가, 메소드 명시적으로 POST로 지정
      const response = await fetchApi('/api/users/root', undefined, {
        method: 'POST',
        body: requestBody,
      });
      
      console.log('회원가입 응답:', response);
      
      set({ 
        isRegistering: false, 
        registerSuccess: true,
        registerError: null,
      });
    } catch (error) {
      console.error('회원가입 에러:', error);
      
      // 에러 메시지를 더 자세히 표시
      const errorMessage = error instanceof Error 
        ? `${error.message} (${JSON.stringify(error)})`
        : '회원가입 중 오류가 발생했습니다.';
      
      set({ 
        isRegistering: false,
        registerError: errorMessage,
      });
    }
  },
  
  // 성공 상태 초기화
  resetRegisterSuccess: () => set({ registerSuccess: false }),
})); 