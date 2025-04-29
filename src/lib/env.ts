/**
 * 환경 변수 관리 및 접근을 위한 헬퍼 함수들입니다.
 * 이 파일은 환경변수를 보다 안전하고 편리하게 사용할 수 있게 해줍니다.
 */

/**
 * 네이버 지도 API 클라이언트 ID
 */
export const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '';

/**
 * 백엔드 API 기본 URL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 현재 실행 환경을 확인합니다.
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * 환경변수에 문제가 있는지 확인합니다.
 * 필수 환경변수가 설정되어 있지 않으면 경고를 출력합니다.
 */
export function validateEnvVariables(): { valid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];
  
  if (!NAVER_CLIENT_ID) {
    missingVars.push('NEXT_PUBLIC_NAVER_CLIENT_ID');
    console.warn('경고: NEXT_PUBLIC_NAVER_CLIENT_ID 환경변수가 설정되지 않았습니다.');
  }
  
  if (!API_BASE_URL) {
    missingVars.push('NEXT_PUBLIC_API_BASE_URL');
    console.warn('경고: NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }
  
  return {
    valid: missingVars.length === 0,
    missingVars
  };
}

// 개발 환경에서 시작 시 자동으로 환경변수 검증
if (isDevelopment && typeof window !== 'undefined') {
  const { valid, missingVars } = validateEnvVariables();
  
  if (!valid) {
    console.warn(`주의: 일부 환경변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    console.warn('필요한 환경변수는 .env.example 파일을 참조하세요.');
  }
} 