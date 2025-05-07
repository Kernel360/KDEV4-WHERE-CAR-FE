import { create } from 'zustand';
import { fetchApi } from './api';

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
    set({ isRegistering: true, registerError: null, registerSuccess: false });
    try {
      await fetchApi<any>('/api/users/sub', undefined, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      set({ 
        isRegistering: false,
        registerSuccess: true
      });
      
      localStorage.setItem('employeeRegisterSuccess', 'true');
      return true;
    } catch (error) {
      set({ 
        isRegistering: false, 
        registerError: error instanceof Error ? error.message : '직원 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        registerSuccess: false
      });
      return false;
    }
  },
  
  resetRegisterSuccess: () => {
    set({ registerSuccess: false });
    localStorage.removeItem('employeeRegisterSuccess');
  }
})); 