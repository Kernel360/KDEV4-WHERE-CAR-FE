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
      
      const data = await fetchApi<UserResponse[]>('/users/companies/my');
      
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
      
      console.log(`권한 정보 요청 시작: 사용자 ID ${userId}`);
      
      // API에서 권한 정보 가져오기
      const response = await fetchApi<any>(`/users/permissions/${userId}`);
      console.log('API에서 받은 원본 권한 응답:', response);
      
      // 응답에서 권한 타입 배열 추출 (다양한 응답 형식 처리)
      let permissionIds: string[] = [];
      
      // 응답이 배열인 경우 (API가 권한 ID 목록을 직접 반환)
      if (Array.isArray(response)) {
        console.log('응답이 배열 형태입니다');
        permissionIds = response;
      } 
      // 응답이 객체이고 permissionTypes 속성이 있는 경우
      else if (response && response.permissionTypes) {
        console.log('응답이 permissionTypes 속성을 가진 객체입니다');
        permissionIds = Array.isArray(response.permissionTypes) 
          ? response.permissionTypes 
          : [];
      }
      // 응답이 객체이고 권한 관련 다른 형식인 경우 
      else if (response && typeof response === 'object') {
        console.log('응답이 일반 객체입니다. 권한 ID를 찾습니다');
        // 객체의 모든 키를 검사하여 권한 ID 같은 형식(PERM_ 접두사)을 찾음
        Object.keys(response).forEach(key => {
          if (typeof response[key] === 'boolean' && response[key] === true && key.startsWith('PERM_')) {
            permissionIds.push(key);
          }
        });
      }
      
      console.log('추출된 권한 ID 목록:', permissionIds);
      
      // 권한 ID를 Permission 객체 배열로 변환
      const permissions: Permission[] = permissionIds.map(createPermissionFromId);
      console.log('변환된 권한 객체 목록:', permissions);
      
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
      const response = await fetch(`${API_BASE_URL}/users/permissions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionRequest)
      });
      
      // 요청 성공 시 상태 업데이트
      if (response.ok) {
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
      } else {
        throw new Error(`권한 업데이트 실패: ${response.status}`);
      }
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
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`사용자 업데이트 실패: ${response.status}`);
      }
      
      // API에서 업데이트된 사용자 정보 다시 조회
      try {
        const updatedUser = await fetchApi<UserResponse>(`/users/${userId}`);
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
      const response = await fetchApi<UserResponse>(`/users/${userId}`);
      console.log(`API에서 사용자 정보 가져옴 (ID: ${userId}):`, response);
      
      // 캐시된 사용자 목록에 없는 경우 추가
      set((state) => {
        const exists = state.users.some(u => u.userId.toString() === userId);
        if (!exists) {
          return { 
            users: [...state.users, response] 
          };
        }
        return state;
      });
      
      return response;
    } catch (error) {
      console.error(`사용자 정보 가져오기 실패 (ID: ${userId}):`, error);
      return undefined;
    }
  },
  
  deleteUser: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`사용자 삭제 실패: ${response.status}`);
      }
      
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