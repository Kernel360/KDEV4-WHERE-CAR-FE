// API 엔드포인트 기본 URL
export const API_BASE_URL = '/api';

// API 요청 함수
export const fetchApi = async <T>(endpoint: string, queryParams?: Record<string, any>, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('authToken') || '';
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
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }
  
  return response.json();
}; 