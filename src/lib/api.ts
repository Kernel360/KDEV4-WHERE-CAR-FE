// API 엔드포인트 기본 URL
export const API_BASE_URL = 'http://211.188.58.97:8080';

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
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // CORS 설정
      ...options?.headers,
    },
    credentials: 'include', // 필요한 경우 쿠키 전송을 위해
    mode: 'cors', // CORS 요청 모드 설정
  });
  
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }
  
  // 응답 크기가 0인 경우 (204 No Content 등)
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return {} as T; // 빈 객체를 반환
  }
  
  // Content-Type 헤더를 확인하여 응답 데이터를 적절히 파싱
  const contentType = response.headers.get('Content-Type') || '';
  
  if (contentType.includes('application/json')) {
    // JSON 응답인 경우
    try {
      return await response.json();
    } catch (e) {
      console.warn('JSON 파싱 실패:', e);
      return {} as T; // 파싱 실패시 빈 객체 반환
    }
  } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
    // 텍스트 응답인 경우
    const text = await response.text();
    
    // 빈 텍스트인 경우
    if (!text) {
      return {} as T;
    }
    
    // 텍스트를 JSON으로 파싱 시도 (일부 API가 Content-Type을 잘못 설정했을 수 있음)
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      // 텍스트를 그대로 반환 (문자열을 T 타입으로 강제 변환)
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
        // 텍스트 읽기도 실패한 경우
        console.warn('응답 읽기 실패:', textError);
        return {} as T;
      }
    }
  }
}; 