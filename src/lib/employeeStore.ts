import { create } from 'zustand';
import { fetchApi, API_BASE_URL } from './api';

interface UserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  jobTitle: string;
}

interface PermissionRequest {
  permissionTypes: string[];
}

interface SubUserRequest {
  user: UserRequest;
  permission: PermissionRequest;
}

interface EmployeeState {
  isRegistering: boolean;
  registerError: string | null;
  registerSuccess: boolean;
  
  // 직원 등록 메서드
  registerEmployee: (requestData: SubUserRequest) => Promise<boolean>;
  
  // 성공 상태 초기화
  resetRegisterSuccess: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  isRegistering: false,
  registerError: null,
  registerSuccess: false,
  
  registerEmployee: async (requestData: SubUserRequest) => {
    try {
      set({ isRegistering: true, registerError: null });
      
      console.log('직원 등록 요청 데이터:', requestData);
      
      try {
        // fetchApi 함수를 사용하여 API 호출 (빈 응답도 성공 처리)
        const response = await fetchApi<any>('/api/users/sub', undefined, {
          method: 'POST',
          body: JSON.stringify(requestData)
        });
        
        console.log('직원 등록 API 응답:', response);
        
        // 응답이 비어있거나 객체가 아니더라도 성공으로 처리
        set({ 
          isRegistering: false,
          registerSuccess: true
        });
        
        return true;
      } catch (apiError: any) {
        // API 오류 처리
        console.error('직원 등록 API 호출 실패:', apiError);
        throw new Error(apiError.message || '직원 등록 API 요청 실패');
      }
    } catch (error) {
      console.error('직원 등록 오류:', error);
      
      set({ 
        isRegistering: false,
        registerError: error instanceof Error ? error.message : '직원 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
      
      return false;
    }
  },
  
  resetRegisterSuccess: () => {
    set({ registerSuccess: false });
  }
})); 