"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import PageHeader from "@/components/common/PageHeader";
import { useAnnouncementStore } from "@/lib/announcementStore";
import { AnnouncementType } from "@/types/announcement";
import { ExclamationTriangleIcon, BellIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/authStore";

export default function AnnouncementsPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  // URL 쿼리 파라미터에서 페이지 번호 가져오기
  const pageParam = searchParams.get('page');
  const page = pageParam ? parseInt(pageParam) : 0;
  
  // 공지 사항 데이터 가져오기
  const { 
    announcements, 
    totalElements, 
    totalPages, 
    currentPage, 
    pageSize, 
    isLoading, 
    error, 
    fetchAnnouncements 
  } = useAnnouncementStore();
  
  // 공지사항 목록의 페이지당 항목 수 설정
  const listPageSize = 5;
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    // URL에 페이지 번호 반영
    router.push(`/announcements?page=${newPage}`);
    // 로컬 스토리지에 현재 페이지 번호 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('announcementCurrentPage', newPage.toString());
    }
    fetchAnnouncements(newPage, listPageSize);
  };
  
  // 공지 사항 상세 페이지로 이동
  const handleAnnouncementClick = (id: number) => {
    console.log(`공지사항 ID ${id}로 이동합니다.`);
    if (id === undefined || id === null) {
      console.error('공지사항 ID가 유효하지 않습니다.');
      return;
    }
    // 현재 페이지 번호 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('announcementCurrentPage', page.toString());
    }
    router.push(`/announcements/${id}`);
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAnnouncements(page, listPageSize);
    
    // 로컬 스토리지에 현재 페이지 번호 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('announcementCurrentPage', page.toString());
    }
  }, [fetchAnnouncements, page]);
  
  // 공지사항 데이터 로드 후 ID 확인
  useEffect(() => {
    if (announcements.length > 0) {
      console.log('로드된 공지사항:', announcements);
      announcements.forEach(announcement => {
        console.log(`공지사항 ID: ${announcement.id}, 제목: ${announcement.title}`);
      });
    }
  }, [announcements]);
  
  // 로그인 상태 확인
  useEffect(() => {
    const isAuthed = useAuthStore.getState().checkAuth();
    
    if (!isAuthed) {
      console.log('공지사항: 인증되지 않은 사용자 감지. 로그인 페이지로 리다이렉트합니다.');
      router.push('/login');
    }
  }, [router]);
  
  // 로그인되지 않았거나 로딩 중인 경우 로딩 화면 표시
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${currentTheme.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${currentTheme.text}`}>로딩 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <PageHeader title="공지사항" />
      
      {/* 공지사항 목록 */}
      <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border} mb-6`}>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`text-lg ${currentTheme.text}`}>로딩 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className={`text-lg ${currentTheme.text} text-red-500`}>{error}</p>
          </div>
        ) : announcements.length > 0 ? (
          <>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    announcement.type === AnnouncementType.ALERT
                      ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                      : `${currentTheme.activeBg} hover:bg-opacity-80`
                  }`}
                  onClick={() => handleAnnouncementClick(announcement.id)}
                  data-announcement-id={announcement.id}
                >
                  <div className="flex items-start">
                    {announcement.type === AnnouncementType.ALERT ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BellIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-medium ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
                        {announcement.title}
                      </h3>
                      <p className={`text-sm ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-1' : `${currentTheme.subtext} mt-1`}`}>
                        {announcement.content.length > 100 
                          ? `${announcement.content.substring(0, 100)}...` 
                          : announcement.content}
                      </p>
                      <p className={`text-xs ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-2' : currentTheme.subtext} mt-2`}>
                        {announcement.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${
                        currentPage === i
                          ? `${currentTheme.activeBg} ${currentTheme.activeText}`
                          : `${currentTheme.subtext} hover:${currentTheme.activeBg} hover:${currentTheme.activeText}`
                      }`}
                      onClick={() => handlePageChange(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className={`text-lg ${currentTheme.text}`}>공지사항이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}