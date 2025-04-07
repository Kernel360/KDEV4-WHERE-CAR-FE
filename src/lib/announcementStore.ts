import { create } from 'zustand';
import { fetchApi } from './api';
import { Announcement, AnnouncementsResponse, AnnouncementDetailResponse } from '@/types/announcement';

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
      
      // ID 값이 없는 경우 기본 ID 값을 설정
      const processedAnnouncements = response.content.map((announcement, index) => ({
        ...announcement,
        id: announcement.id || index + 1 // ID가 없는 경우 인덱스+1을 ID로 사용
      }));
      
      console.log('API 응답:', response);
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
      const response = await fetchApi<AnnouncementDetailResponse>(`/api/announcement/${id}`);
      
      // ID 값이 없는 경우 기본 ID 값을 설정
      const processedDetail = {
        ...response,
        id: response.id || id // ID가 없는 경우 URL 파라미터의 ID를 사용
      };
      
      console.log('상세 API 응답:', response);
      console.log('처리된 상세 공지사항:', processedDetail);
      
      set({
        announcementDetail: processedDetail,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '공지 사항 상세 정보를 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  }
})); 