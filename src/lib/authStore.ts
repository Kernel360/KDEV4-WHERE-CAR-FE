import { create } from 'zustand';
import { fetchApi, API_BASE_URL } from '@/lib/api';
import { UserRequest } from '@/lib/registerStore';

// 로그인 요청 인터페이스
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답 인터페이스
export interface LoginResponse {
  token: string;
  name: string;
  email: string;
  // 필요한 경우 추가 필드
}

// 사용자 정보 응답 인터페이스
export interface UserResponse {
  userId: number;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  createdAt: string;
  updatedAt?: string;
}

// 사용자 정보 인터페이스
export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  updatedAt: Date | string | null;
}

// 인증 상태 인터페이스
interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: {
    name: string;
    email: string;
  } | null;
  error: string | null;
  userProfile: UserInfo | null;
  profileLoading: boolean;
  profileError: string | null;
  
  // 로그인 메서드
  login: (credentials: LoginRequest) => Promise<boolean>;
  
  // 로그아웃 메서드
  logout: () => void;

  // 인증 상태 초기화 메서드
  initAuth: () => void;

  // 인증 상태 확인 메서드
  checkAuth: () => boolean;
  
  // 사용자 프로필 조회 메서드
  fetchUserProfile: () => Promise<UserInfo | null>;

  // 사용자 정보 업데이트
  updateUserProfile: (userRequest: UserRequest) => Promise<boolean>;
}

// 로컬 스토리지에서 토큰 추출 함수
const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null; // 서버 사이드에서는 실행하지 않음
  
  return localStorage.getItem('Authorization');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: false,
  isAuthenticated: false,
  token: null,
  user: null,
  error: null,
  userProfile: null,
  profileLoading: false,
  profileError: null,
  
  // 인증 상태 초기화 메서드
  initAuth: () => {
    // 로컬 스토리지에서 토큰 확인
    const token = getTokenFromStorage();
    
    if (token && token.length > 10) { // 유효한 JWT 토큰은 일반적으로 길이가 깁니다
      // 토큰이 있으면 인증 상태로 설정
      console.log('로컬 스토리지에서 토큰을 찾았습니다. 인증 상태 설정됨');
      
      set({
        isAuthenticated: true,
        token: token,
        user: {
          name: '사용자', // 토큰으로부터 디코딩하여 사용자 정보를 가져올 수도 있습니다
          email: '',
        },
      });
      
      // 인증 상태가 설정되면 사용자 프로필 정보도 가져옴
      const { fetchUserProfile } = get();
      fetchUserProfile();
      
      return true;
    }
    
    console.log('로컬 스토리지에서 토큰을 찾을 수 없습니다. 미인증 상태 유지');
    return false;
  },
  
  // 인증 상태 확인 메서드
  checkAuth: () => {
    const token = get().token || getTokenFromStorage();
    const isAuthenticated = !!token && token.length > 10;
    
    // 상태 업데이트 (변경이 필요한 경우에만)
    if (isAuthenticated !== get().isAuthenticated) {
      set({ isAuthenticated, token });
      
      // 인증 상태가 변경되고 인증되었다면 프로필 정보 가져오기
      if (isAuthenticated) {
        const { fetchUserProfile } = get();
        fetchUserProfile();
      }
    }
    
    return isAuthenticated;
  },
  
  // 사용자 프로필 조회 메서드
  fetchUserProfile: async () => {
    try {
      const { token } = get();
      if (!token) {
        console.log('토큰이 없어 사용자 프로필을 가져올 수 없습니다.');
        return null;
      }
      
      set({ profileLoading: true, profileError: null });
      
      // 백엔드 API 호출
      const response = await fetchApi<UserResponse>('/api/users/my');
      
      // API 응답을 UserInfo 형태로 변환
      const userInfo: UserInfo = {
        userId: response.userId ? response.userId.toString() : '',
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        jobTitle: response.jobTitle || '',
        updatedAt: response.updatedAt ? new Date(response.updatedAt) : null
      };
      
      // 상태 업데이트
      set({
        profileLoading: false,
        userProfile: userInfo,
        // 기본 사용자 정보도 업데이트
        user: {
          name: userInfo.name,
          email: userInfo.email
        }
      });
      
      return userInfo;
    } catch (error) {
      console.error('사용자 프로필 조회 중 오류가 발생했습니다:', error);
      const errorMessage = error instanceof Error 
        ? error.message
        : '사용자 정보를 불러오는 중 오류가 발생했습니다.';
      
      set({
        profileLoading: false,
        profileError: errorMessage
      });
      
      return null;
    }
  },
  
  // 로그인 메서드
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('로그인 요청 데이터:', credentials);
      console.log('API 요청 URL:', `${API_BASE_URL}/login`);
      
      // API 요청을 fetch를 사용하여 직접 실행하여 헤더에 접근할 수 있도록 함
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error(`로그인 실패: ${response.status} ${response.statusText}`);
      }
      
      // 헤더에서 Authorization 토큰 추출
      const authHeader = response.headers.get('Authorization');
      console.log('응답 헤더:', response.headers);
      console.log('Authorization 헤더:', authHeader);
      
      let token = null;
      
      if (authHeader) {
        // Bearer 접두사 제거
        token = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : authHeader;
        
        // 토큰을 로컬 스토리지에만 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('Authorization', token);
        }
        
        console.log('토큰 저장 완료:', token);
      } else {
        console.warn('Authorization 헤더가 응답에 없습니다.');
      }
      
      // 응답 본문이 있는 경우에만 파싱 시도
      let data: Partial<LoginResponse> = {};
      const contentLength = response.headers.get('Content-Length');
      const contentType = response.headers.get('Content-Type');
      
      if (contentLength && contentLength !== '0' && contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('로그인 응답 데이터:', data);
        } catch (e) {
          console.warn('응답 본문 파싱 실패:', e);
          // 파싱 실패는 무시하고 계속 진행 (헤더에서 토큰을 이미 얻었으므로)
        }
      } else {
        console.log('응답 본문이 비어있거나 JSON 형식이 아닙니다.');
      }
      
      // 헤더에서 토큰을 가져오지 못한 경우 응답 본문의 토큰 사용 (fallback)
      if (!token && data.token) {
        token = data.token;
        
        // 토큰을 로컬 스토리지에만 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('Authorization', token);
        }
        
        console.log('응답 본문에서 토큰 저장:', token);
      }
      
      if (token) {
        // 상태 업데이트 (데이터가 없을 수 있으므로 조건부로 사용)
        set({
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: {
            name: data.name || credentials.email.split('@')[0] || '사용자',
            email: data.email || credentials.email || '',
          },
          error: null,
        });
        
        // 로그인 성공 후 사용자 프로필 정보 가져오기
        const { fetchUserProfile } = get();
        fetchUserProfile();
        
        return true;
      } else {
        throw new Error('토큰이 없습니다. 서버 응답에 Authorization 헤더가 없습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      
      // 에러 메시지를 더 자세히 표시
      const errorMessage = error instanceof Error 
        ? error.message
        : '로그인 중 오류가 발생했습니다.';
      
      set({ 
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
        error: errorMessage,
      });
      
      return false;
    }
  },
  
  // 로그아웃 메서드
  logout: () => {
    // 로컬 스토리지에서 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('Authorization');
    }
    
    // 상태 초기화
    set({
      isAuthenticated: false,
      token: null,
      user: null,
      error: null,
      userProfile: null,
      profileError: null
    });
  },

  // 사용자 정보 업데이트
  updateUserProfile: async (userRequest: UserRequest) => {
    try {
      await fetchApi<void>('/api/users/my', undefined, {
        method: 'PUT',
        body: JSON.stringify(userRequest)
      });
      
      // 업데이트된 프로필 정보 다시 가져오기
      await useAuthStore.getState().fetchUserProfile();
      
      return true;
    } catch (error) {
      console.error('프로필 업데이트 중 오류가 발생했습니다:', error);
      throw error;
    }
  },
}));

// 클라이언트 사이드에서 페이지 로드 시 인증 상태 초기화
if (typeof window !== 'undefined') {
  useAuthStore.getState().initAuth();
}

// Next.js 클라이언트 사이드에서 API 요청 전에 인증 헤더 추가
export const setupAuthInterceptor = () => {
  if (typeof window === 'undefined') return; // 서버 사이드에서는 실행하지 않음
  
  // 원래의 fetch 함수를 저장
  const originalFetch = window.fetch;
  
  // fetch 함수 재정의
  window.fetch = async (input, init) => {
    // 초기 설정이 없으면 빈 객체로 초기화
    const initOptions = init || {};
    
    // 헤더 설정이 없으면 빈 객체로 초기화
    const headers = new Headers(initOptions.headers || {});
    
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('Authorization');
    
    // 토큰이 있고 x-authorization 헤더가 아직 설정되지 않았다면 추가
    if (token && !headers.has('x-authorization')) {
      headers.set('x-authorization', token);
    }
    
    // 설정된 헤더로 초기 설정 업데이트
    const updatedInit = {
      ...initOptions,
      headers,
    };
    
    // 원래의 fetch 함수 호출
    return originalFetch(input, updatedInit);
  };
  
  console.log('인증 인터셉터가 설정되었습니다.');
}; 