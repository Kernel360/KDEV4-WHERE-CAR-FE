import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatNumber(num: number): string {
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
    '드라이브 타입': item.driveType === 'PERSONAL' ? '개인' : 
                    item.driveType === 'CORPORATE' ? '법인' : '미등록',
    '드라이버': item.driver?.name || '미등록',
    '비고': item.note || '-'
  })));

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '운행일지');

  // 파일 다운로드
  XLSX.writeFile(workbook, `${filename}.xlsx`);
} 