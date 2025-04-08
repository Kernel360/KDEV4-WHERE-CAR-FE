// 공지 사항 타입 정의
export enum AnnouncementType {
  ALERT = 'ALERT',
  INFO = 'INFO'
}

// API 응답에서 사용하는 백엔드 데이터 타입
export interface AnnouncementApiResponse {
  announcementId?: number;
  id?: number;
  title: string;
  content: string;
  announcementType: string;
  createdAt: string;
}

// 프론트엔드에서 사용하는 공지사항 타입
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  createdAt: string;
}

// 공지 사항 목록 페이지네이션 응답 타입
export interface AnnouncementsResponse {
  content: AnnouncementApiResponse[];
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