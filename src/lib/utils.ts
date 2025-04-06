import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return '-'; // 날짜가 없는 경우 대시 반환
  }
  
  try {
    const date = new Date(dateString);
    
    // 유효하지 않은 날짜인 경우 체크
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error);
    return '-';
  }
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) {
    return '0';
  }
  return num.toLocaleString('ko-KR');
}

export function downloadExcel(data: any[], filename: string) {
  // 데이터를 Excel 형식에 맞게 변환
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    '차량 번호': item.vehicleNumber,
    '시작 시간': formatDate(item.startTime),
    '종료 시간': formatDate(item.endTime),
    '시작 주행거리': `${formatNumber(item.startMileage)} km`,
    '종료 주행거리': `${formatNumber(item.endMileage)} km`,
    '총 주행거리': `${formatNumber(item.totalDistance)} km`,
    '드라이브 타입': item.driveType === 'COMMUTE' ? '출퇴근' : 
                  item.driveType === 'WORK' ? '업무' : '미등록',
    '드라이버': item.driver?.name || '미등록',
    '비고': item.note || '-'
  })));

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '운행일지');

  // 파일 다운로드
  XLSX.writeFile(workbook, `${filename}.xlsx`);
} 