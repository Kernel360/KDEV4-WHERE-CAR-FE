import { create } from 'zustand';
import { fetchApi } from './api';
import { Announcement, AnnouncementsResponse, AnnouncementDetailResponse, AnnouncementApiResponse, AnnouncementType } from '@/types/announcement';

interface AnnouncementState {
  announcements: Announcement[];
  announcementDetail: AnnouncementDetailResponse | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  fetchAnnouncements: (page?: number, size?: number) => Promise<void>;
  fetchAnnouncementDetail: (id: number) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  announcementDetail: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  isLoading: false,
  error: null,
  
  // 공지 사항 목록 조회
  fetchAnnouncements: async (page = 0, size = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchApi<AnnouncementsResponse>('/api/announcement', {
        page,
        size
      });
      
      console.log('API 원본 응답:', response);
      
      // announcementId를 id로 매핑하여 처리
      const processedAnnouncements = response.content.map((item, index) => {
        // API 응답 구조 확인 및 로깅
        console.log(`항목 ${index}:`, item);
        
        return {
          id: item.announcementId || item.id || index + 1, // announcementId 또는 id가 없는 경우 인덱스+1 사용
          title: item.title,
          content: item.content,
          type: item.announcementType === 'ALERT' ? AnnouncementType.ALERT : AnnouncementType.INFO,
          createdAt: item.createdAt
        } as Announcement;
      });
      
      console.log('처리된 공지사항:', processedAnnouncements);
      
      set({
        announcements: processedAnnouncements,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
        pageSize: response.size,
        isLoading: false
      });
    } catch (error) {
      console.error('공지사항 조회 오류:', error);
      set({ 
        error: error instanceof Error ? error.message : '공지 사항을 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  // 공지 사항 상세 조회
  fetchAnnouncementDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchApi<AnnouncementApiResponse>(`/api/announcement/${id}`);
      
      console.log('상세 API 원본 응답:', response);
      
      // announcementId를 id로 매핑하여 처리
      const processedDetail = {
        id: response.announcementId || response.id || id, // announcementId 또는 id가 없는 경우 URL 파라미터 ID 사용
        title: response.title,
        content: response.content,
        type: response.announcementType === 'ALERT' ? AnnouncementType.ALERT : AnnouncementType.INFO,
        createdAt: response.createdAt
      } as AnnouncementDetailResponse;
      
      console.log('처리된 상세 공지사항:', processedDetail);
      
      set({
        announcementDetail: processedDetail,
        isLoading: false
      });
    } catch (error) {
      console.error('공지사항 상세 조회 오류:', error);
      set({ 
        error: error instanceof Error ? error.message : '공지 사항 상세 정보를 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  }
})); 