import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

export function downloadExcel(data: any[], filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(data: any[]): string {
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const cell = row[header];
      return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return "0분";

  const days = Math.floor(seconds / (24 * 3600));
  seconds %= (24 * 3600);
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  
  let result = "";
  if (days > 0) result += `${days}일 `;
  if (hours > 0) result += `${hours}시간 `;
  if (minutes > 0) result += `${minutes}분`;
  
  return result.trim();
}
