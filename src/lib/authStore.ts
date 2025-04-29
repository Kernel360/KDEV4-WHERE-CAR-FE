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
  lastTokenRefresh: number; // 토큰 재발급 시간 추적
  
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
  
  // 토큰 재발급 메서드
  reissueToken: () => Promise<boolean>;
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
  lastTokenRefresh: 0, // 초기값
  
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
      const apiResponse = await fetchApi<{data: UserResponse, message: string, statusCode: number}>('/api/users/my');
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const response = apiResponse.data || apiResponse;
      
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
        credentials: 'include', // 쿠키를 포함하기 위해 필요
      });
      
      const responseData = await response.json();
      if (responseData.statusCode !== 200) {
        throw new Error(responseData.message || '로그인에 실패했습니다.');
      }
      
      // Authorization 헤더에서 토큰 추출
      const authHeader = response.headers.get('Authorization');
      console.log('응답 헤더:', response.headers);
      console.log('Authorization 헤더:', authHeader);
      
      let token = null;
      
      if (authHeader) {
        // Bearer 접두사 제거
        token = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : authHeader;
        
        // 토큰을 로컬 스토리지에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('Authorization', token);
        }
        
        console.log('토큰 저장 완료:', token);
      } else {
        throw new Error('서버 응답에 Authorization 헤더가 없습니다.');
      }
      
      if (token) {
        // 상태 업데이트
        set({
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: {
            name: credentials.email.split('@')[0] || '사용자',
            email: credentials.email || '',
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
  logout: async () => {
    try {
      // 백엔드 로그아웃 API 호출
      const response = await fetch(`${API_BASE_URL}/token/logout`, {
        method: 'POST',
        credentials: 'include', // 쿠키를 포함하기 위해 필요
      });
      
      console.log('로그아웃 응답 상태:', response.status);
      
      // 로그아웃 실패해도 로컬 상태와 스토리지는 초기화
    } catch (error) {
      console.error('로그아웃 API 호출 중 오류:', error);
      // API 호출 실패해도 로컬에서는 로그아웃 처리 진행
    } finally {
      // 로컬 스토리지에서 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('Authorization');
      }
      
      // 상태 초기화
      set({
        isAuthenticated: false,
        token: null,
        user: null,
        userProfile: null,
      });
      
      // 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  // 사용자 정보 업데이트
  updateUserProfile: async (userRequest: UserRequest) => {
    try {
      await fetchApi<{data: any, message: string, statusCode: number}>('/api/users/my', undefined, {
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

  // 토큰 재발급 메서드
  reissueToken: async () => {
    try {
      console.log('토큰 재발급 시도');
      
      // 임시 변수에 설정하여 상태 변경 최소화
      let tempIsAuthenticated = false;
      let tempToken = null;
      
      const response = await fetch(`${API_BASE_URL}/token/reissue`, {
        method: 'POST',
        credentials: 'include', // 쿠키를 포함하기 위해 필요
      });
      
      if (!response.ok) {
        throw new Error(`토큰 재발급 실패: ${response.status} ${response.statusText}`);
      }
      
      // Authorization 헤더에서 토큰 추출
      const authHeader = response.headers.get('Authorization');
      
      if (authHeader) {
        // Bearer 접두사 제거
        const token = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : authHeader;
        
        try {
          // 토큰을 로컬 스토리지에 저장
          localStorage.removeItem('Authorization'); // 먼저 기존 토큰 삭제
          localStorage.setItem('Authorization', token);
          
          tempToken = token;
          tempIsAuthenticated = true;
        } catch (storageError) {
          console.error('로컬 스토리지 저장 중 오류:', storageError);
          throw new Error('토큰 저장 실패');
        }
        
        // 상태 일괄 업데이트로 렌더링 최소화
        set({
          token: tempToken,
          isAuthenticated: tempIsAuthenticated,
          lastTokenRefresh: Date.now(), // 토큰 재발급 시간 업데이트
        });
        
        // 사용자 프로필 정보도 즉시 갱신 (비동기 처리)
        try {
          const { fetchUserProfile } = get();
          fetchUserProfile().catch(err => {
            console.error('프로필 갱신 실패:', err);
          });
        } catch (profileError) {
          console.error('프로필 갱신 중 오류:', profileError);
          // 프로필 갱신 실패는 치명적 오류가 아니므로 계속 진행
        }
        
        console.log('토큰 재발급 완료');
        return true;
      } else {
        throw new Error('서버 응답에 Authorization 헤더가 없습니다.');
      }
    } catch (error) {
      console.error('토큰 재발급 에러:', error);
      
      // 토큰 재발급 실패 시 로그아웃 처리
      try {
        const { logout } = get();
        logout();
      } catch (logoutError) {
        console.error('로그아웃 중 오류:', logoutError);
        // 로그아웃 실패해도 false 반환
      }
      
      return false;
    }
  },
}));

// 클라이언트 사이드에서 페이지 로드 시 인증 상태 초기화
if (typeof window !== 'undefined') {
  useAuthStore.getState().initAuth();
}

// 쿠키 삭제 함수 추가
function clearAllCookies() {
  if (typeof document === 'undefined') return;
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

// 인증 실패 시 처리하는 함수
function handleAuthFailure() {
  if (typeof window !== 'undefined') {
    // 로컬스토리지 초기화
    localStorage.clear();
    // 쿠키 삭제
    clearAllCookies();
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
}

export const setupAuthInterceptor = () => {
  if (typeof window === 'undefined') return; // 서버 사이드에서는 실행하지 않음
  
  // 진행 중인 토큰 재발급 요청을 추적
  let isRefreshing = false;
  // 토큰 재발급 중 대기 중인 요청들
  let failedQueue: {resolve: (value: any) => void, reject: (reason?: any) => void, config: any}[] = [];
  
  // 대기 중인 요청들 처리
  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    failedQueue = [];
  };
  
  // 원래의 fetch 함수를 저장
  const originalFetch = window.fetch;
  
  // fetch 함수 재정의
  window.fetch = async (input, init) => {
    try {
      // 초기 설정이 없으면 빈 객체로 초기화
      const initOptions = init || {};
      
      // 헤더 설정이 없으면 빈 객체로 초기화
      const headers = new Headers(initOptions.headers || {});
      
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem('Authorization');
      
      // 요청 URL 확인 (디버깅용)
      const url = typeof input === 'string' 
        ? input 
        : input instanceof Request 
          ? input.url 
          : input.toString();
      
      // 토큰 갱신 요청인 경우 이중 헤더 방지
      const isTokenRefreshRequest = url.includes('/token/reissue');
      
      // 토큰이 있고 Authorization 헤더가 아직 설정되지 않았다면 추가
      if (token && !headers.has('Authorization') && !isTokenRefreshRequest) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // 설정된 헤더로 초기 설정 업데이트
      const updatedInit = {
        ...initOptions,
        headers,
      };
      
      // 원래의 fetch 함수 호출
      const response = await originalFetch(input, updatedInit);
      
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const responseClone = response.clone();
        
        try {
          const data = await responseClone.json();
          
          // 401 에러 처리 부분 수정
          if (data.statusCode === 401) {
            console.log('인증 오류 발생:', url);
            
            // 토큰 만료가 아닌 다른 401 에러의 경우 바로 로그아웃 처리
            if (data.message !== 'ACCESS_TOKEN_EXPIRED' || isTokenRefreshRequest) {
              handleAuthFailure();
              throw new Error('인증 오류로 인해 로그아웃 처리됨');
            }

            // 토큰 만료인 경우 재발급 시도
            if (data.message === 'ACCESS_TOKEN_EXPIRED' && !isTokenRefreshRequest) {
              // ... 기존의 토큰 재발급 로직 ...
              
              // 토큰 재발급 실패 시
              if (!reissued) {
                handleAuthFailure();
                throw new Error('토큰 재발급 실패로 로그아웃 처리됨');
              }
            }
          }
        } catch (error) {
          console.error('응답 처리 중 오류:', error);
          throw error;
        }
      }
      
      return response;
    } catch (error) {
      console.error('요청 중 오류:', error);
      throw error;
    }
  };
  
  console.log('인증 인터셉터가 설정되었습니다.');
}; 