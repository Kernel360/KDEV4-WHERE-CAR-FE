// 공지 사항 타입 정의
export enum AnnouncementType {
  ALERT = 'ALERT',
  INFO = 'INFO'
}

// 공지 사항 목록 조회 응답 타입
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  createdAt: string;
}

// 공지 사항 목록 페이지네이션 응답 타입
export interface AnnouncementsResponse {
  content: Announcement[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 공지 사항 상세 조회 응답 타입
export interface AnnouncementDetailResponse {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  createdAt: string;
} 