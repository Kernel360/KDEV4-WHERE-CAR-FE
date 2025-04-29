import { API_BASE_URL as ENV_API_BASE_URL } from './env';

// API 기본 URL 설정
export const API_BASE_URL = ENV_API_BASE_URL;

// API 요청 함수
export const fetchApi = async <T>(endpoint: string, queryParams?: Record<string, any>, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('Authorization') || '';
  let url = `${API_BASE_URL}${endpoint}`;
  
  // 쿼리 파라미터 추가
  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
      
    url = `${url}?${queryString}`;
  }
  
  // 기본 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // 옵션에 헤더가 있으면 병합
  if (options?.headers) {
    const optionHeaders = options.headers as Record<string, string>;
    Object.keys(optionHeaders).forEach(key => {
      headers[key] = optionHeaders[key];
    });
  }
  
  // 토큰이 있을 경우에만 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 쿠키를 포함하기 위해 'omit'에서 'include'로 변경
      mode: 'cors', // CORS 요청 모드 설정
    });
    
    if (!response.ok) {
      // 401 응답은 인터셉터가 처리할 것이므로 특별히 표시
      if (response.status === 401) {
        const responseData = await response.json().catch(() => ({}));
        if (responseData.message === 'ACCESS_TOKEN_EXPIRED') {
          throw new Error(`토큰 만료로 인한 인증 오류: ${response.status}`);
        } else {
          throw new Error(`인증 오류: ${response.status} - ${response.statusText}`);
        }
      }
      throw new Error(`API 요청 실패: ${response.status} - ${response.statusText}`);
    }
    
    // 응답 크기가 0인 경우 (204 No Content 등)
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return {} as T; // 빈 객체를 반환
    }
    
    // Content-Type 헤더를 확인하여 응답 데이터를 적절히 파싱
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (e) {
        console.warn('JSON 파싱 실패:', e);
        return {} as T; 
      }
    } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
      const text = await response.text();
      
      if (!text) {
        return {} as T;
      }
      
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        return text as unknown as T;
      }
    } else {
      // 기본적으로 JSON 파싱 시도
      try {
        return await response.json();
      } catch (e) {
        // JSON 파싱 실패 시 텍스트로 시도
        try {
          const text = await response.text();
          if (!text) {
            return {} as T;
          }
          return text as unknown as T;
        } catch (textError) {
          console.warn('응답 읽기 실패:', textError);
          return {} as T;
        }
      }
    }
  } catch (error) {
    console.error(`[${endpoint}] API 요청 실패:`, error);
    throw error;
  }
};

export async function fetchLatestPosition(mdn: string): Promise<{
  data: {
    mdn: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  message: string;
  statusCode: number;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gps/position?mdn=${mdn}`);
    if (!response.ok) {
      if (response.status === 500) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest position:', error);
    return null;
  }
}

export async function fetchGpsRoute(mdn: string, startTime: string, endTime: string) {
  try {
    const requestBody = {
      mdn,
      startTime,
      endTime,
    };

    console.log('GPS 경로 요청 데이터:', requestBody);

    const response = await fetch(`${API_BASE_URL}/api/gps/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('GPS 경로 데이터를 가져오는데 실패했습니다.');
    }

    const responseData = await response.json();
    console.log('GPS 경로 응답 데이터:', responseData);
    return responseData;
  } catch (error) {
    console.error('GPS 경로 데이터 조회 오류:', error);
    throw error;
  }
} 