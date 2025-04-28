import { create } from 'zustand';
import { API_BASE_URL, fetchApi } from '@/lib/api';
import { Permission, createPermissionFromId } from '@/lib/permissions';

export interface UserResponse {
  userId: number;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
}

// API에서 반환되는 권한 응답 형식
interface PermissionResponse {
  permissionTypes?: string[]; // Set<PermissionType>가 배열 형태로 직렬화되어 옵니다
}

interface UserState {
  users: UserResponse[];
  isLoading: boolean;
  error: string | null;
  userPermissions: Record<string, Permission[]>;
  loadingPermissions: boolean;
  permissionsError: string | null;
  savingPermissions: boolean;
  savePermissionsError: string | null;
  savePermissionsSuccess: boolean;
  
  // Actions
  fetchUsersOfCompany: () => Promise<UserResponse[] | undefined>;
  fetchUserPermissions: (userId: string) => Promise<Permission[] | undefined>;
  updateUserPermissions: (userId: string, permissions: Permission[]) => Promise<boolean>;
  fetchUser: (userId: string) => Promise<UserResponse | undefined>;
  updateUser: (userId: string, userRequest: { name: string; email: string; password?: string; phone: string; jobTitle: string; }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  userPermissions: {},
  loadingPermissions: false,
  permissionsError: null,
  savingPermissions: false,
  savePermissionsError: null,
  savePermissionsSuccess: false,
  
  fetchUsersOfCompany: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetchApi<{data: UserResponse[], message: string, statusCode: number}>('/api/users/companies/my');
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const data = response.data || response;
      
      set({ 
        users: data,
        isLoading: false
      });
      
      return data;
    } catch (error) {
      console.error('직원 데이터 가져오기 실패:', error);
      set({ 
        error: error instanceof Error ? error.message : '직원 데이터를 가져오는 중 오류가 발생했습니다',
        isLoading: false
      });
    }
  },
  
  fetchUserPermissions: async (userId: string) => {
    try {
      set({ loadingPermissions: true, permissionsError: null });
      
      // API에서 권한 정보 가져오기
      const response = await fetchApi<{data: any, message: string, statusCode: number}>(`/api/users/permissions/${userId}`);
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const permissionData = response.data || response;
      
      // 응답에서 권한 타입 배열 추출 (다양한 응답 형식 처리)
      let permissionIds: string[] = [];
      
      // 응답이 배열인 경우 (API가 권한 ID 목록을 직접 반환)
      if (Array.isArray(permissionData)) {
        permissionIds = permissionData;
      } 
      // 응답이 객체이고 permissionTypes 속성이 있는 경우
      else if (permissionData && permissionData.permissionTypes) {
        permissionIds = Array.isArray(permissionData.permissionTypes) 
          ? permissionData.permissionTypes 
          : [];
      }
      // 응답이 객체이고 권한 관련 다른 형식인 경우 
      else if (permissionData && typeof permissionData === 'object') {
        // 객체의 모든 키를 검사하여 권한 ID 같은 형식(PERM_ 접두사)을 찾음
        Object.keys(permissionData).forEach(key => {
          if (typeof permissionData[key] === 'boolean' && permissionData[key] === true && key.startsWith('PERM_')) {
            permissionIds.push(key);
          }
        });
      }
      
      // 권한 ID를 Permission 객체 배열로 변환
      const permissions: Permission[] = permissionIds.map(createPermissionFromId);
      
      // 권한 정보 저장
      set((state) => ({ 
        userPermissions: {
          ...state.userPermissions,
          [userId]: permissions
        },
        loadingPermissions: false
      }));
      
      return permissions;
    } catch (error) {
      console.error('권한 정보 가져오기 실패:', error);
      set({ 
        permissionsError: '권한 정보를 불러오는 중 오류가 발생했습니다.',
        loadingPermissions: false 
      });
    }
  },

  updateUserPermissions: async (userId: string, permissions: Permission[]): Promise<boolean> => {
    set({ savingPermissions: true, savePermissionsError: null, savePermissionsSuccess: false });
    
    try {
      // 권한 중 isGranted가 true인 항목만 서버로 전송
      const grantedPermissions = permissions
        .filter(p => p.isGranted)
        .map(p => p.id);
      
      // API 요청 형식에 맞춰 데이터 구성
      const permissionRequest = {
        permissionTypes: grantedPermissions
      };
      
      // API 요청
      await fetchApi<void>(`/api/users/permissions/${userId}`, undefined, {
        method: 'PUT',
        body: JSON.stringify(permissionRequest)
      });
      
      // 요청 성공 시 상태 업데이트
      const { userPermissions } = get();
      set({ 
        userPermissions: {
          ...userPermissions,
          [userId]: permissions.filter(p => p.isGranted)
        },
        savingPermissions: false,
        savePermissionsSuccess: true
      });
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        set({ savePermissionsSuccess: false });
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('권한 업데이트 중 오류 발생:', error);
      set({ 
        savingPermissions: false, 
        savePermissionsError: '권한 정보를 저장하는 중 오류가 발생했습니다.' 
      });
      return false;
    }
  },

  updateUser: async (userId: string, userRequest) => {
    try {
      console.log(`사용자 정보 업데이트 (ID: ${userId}):`, userRequest);
      
      // 비밀번호가 빈 문자열이면 삭제 (서버에서 업데이트하지 않음)
      const requestData = { ...userRequest };
      if (requestData.password === '') {
        delete requestData.password;
      }
      
      const updateResponse = await fetchApi<{data: any, message: string, statusCode: number}>(`/api/users/${userId}`, undefined, {
        method: 'PUT',
        body: JSON.stringify(requestData)
      });
      
      // API에서 업데이트된 사용자 정보 다시 조회
      try {
        const response = await fetchApi<{data: UserResponse, message: string, statusCode: number}>(`/api/users/${userId}`);
        const updatedUser = response.data || response;
        console.log(`업데이트된 사용자 정보 조회 (ID: ${userId}):`, updatedUser);
        
        // 스토어의 사용자 데이터 업데이트 (API에서 받은 최신 정보 사용)
        set((state) => ({
          users: state.users.map(user => 
            user.userId.toString() === userId 
              ? updatedUser 
              : user
          )
        }));
      } catch (fetchError) {
        console.error(`업데이트된 사용자 정보 조회 실패 (ID: ${userId}):`, fetchError);
        
        // 조회 실패 시 기존 방식대로 요청 데이터로 업데이트
        set((state) => ({
          users: state.users.map(user => 
            user.userId.toString() === userId 
              ? { ...user, ...requestData } 
              : user
          )
        }));
      }
      
      return true;
    } catch (error) {
      console.error('사용자 업데이트 중 오류 발생:', error);
      return false;
    }
  },

  fetchUser: async (userId: string) => {
    try {
      const response = await fetchApi<{data: UserResponse, message: string, statusCode: number}>(`/api/users/${userId}`);
      console.log(`API에서 사용자 정보 가져옴 (ID: ${userId}):`, response);
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const userData = response.data || response;
      
      // 캐시된 사용자 목록에 없는 경우 추가
      set((state) => {
        const exists = state.users.some(u => u.userId.toString() === userId);
        if (!exists) {
          return { 
            users: [...state.users, userData] 
          };
        }
        return state;
      });
      
      return userData;
    } catch (error) {
      console.error(`사용자 정보 가져오기 실패 (ID: ${userId}):`, error);
      return undefined;
    }
  },
  
  deleteUser: async (userId: string) => {
    try {
      const response = await fetchApi<{data: any, message: string, statusCode: number}>(`/api/users/${userId}`, undefined, {
        method: 'DELETE'
      });
      
      // 스토어에서 해당 사용자 제거
      set((state) => ({
        users: state.users.filter(user => user.userId.toString() !== userId),
        // 해당 사용자의 권한 정보도 제거
        userPermissions: Object.fromEntries(
          Object.entries(state.userPermissions).filter(([key]) => key !== userId)
        )
      }));
      
      return true;
    } catch (error) {
      console.error('사용자 삭제 중 오류 발생:', error);
      return false;
    }
  }
})); 