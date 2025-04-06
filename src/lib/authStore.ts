import { create } from 'zustand';
import { fetchApi, API_BASE_URL } from '@/lib/api';

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
  
  // 로그인 메서드
  login: (credentials: LoginRequest) => Promise<boolean>;
  
  // 로그아웃 메서드
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: false,
  isAuthenticated: false,
  token: null,
  user: null,
  error: null,
  
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
        
        // 토큰을 로컬 스토리지와 쿠키에 저장
        localStorage.setItem('Authorization', token);
        
        // 쿠키에 토큰 저장 (HttpOnly 옵션 없이 JavaScript에서 접근 가능하도록)
        document.cookie = `Authorization=${token}; path=/; max-age=2592000; SameSite=Strict`;
        
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
        
        // 토큰을 로컬 스토리지와 쿠키에 저장
        localStorage.setItem('Authorization', token);
        
        // 쿠키에 토큰 저장 (HttpOnly 옵션 없이 JavaScript에서 접근 가능하도록)
        document.cookie = `Authorization=${token}; path=/; max-age=2592000; SameSite=Strict`;
        
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
    // 로컬 스토리지와 쿠키에서 토큰 제거
    localStorage.removeItem('Authorization');
    document.cookie = 'Authorization=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    
    // 상태 초기화
    set({
      isAuthenticated: false,
      token: null,
      user: null,
      error: null,
    });
  },
})); 