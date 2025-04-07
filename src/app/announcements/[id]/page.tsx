"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import PageHeader from "@/components/common/PageHeader";
import { useAnnouncementStore } from "@/lib/announcementStore";
import { AnnouncementType } from "@/types/announcement";
import { ExclamationTriangleIcon, BellIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/authStore";
import { use } from "react";

export default function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const resolvedParams = use(params);
  const announcementId = parseInt(resolvedParams.id);
  
  console.log('URL 파라미터 ID:', resolvedParams.id);
  console.log('파싱된 ID:', announcementId);
  
  // 공지 사항 데이터 가져오기
  const { 
    announcementDetail, 
    announcements,
    isLoading, 
    error, 
    fetchAnnouncementDetail,
    fetchAnnouncements
  } = useAnnouncementStore();
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isNaN(announcementId)) {
      console.error('유효하지 않은 ID입니다:', resolvedParams.id);
      return;
    }
    
    console.log('공지사항 상세 정보 요청 ID:', announcementId);
    fetchAnnouncementDetail(announcementId);
    fetchAnnouncements(0, 5); // 상세 페이지 하단에 표시할 최신 5개 공지사항
  }, [fetchAnnouncementDetail, fetchAnnouncements, announcementId, resolvedParams.id]);
  
  // 로그인 상태 확인
  useEffect(() => {
    const isAuthed = useAuthStore.getState().checkAuth();
    
    if (!isAuthed) {
      console.log('공지사항 상세: 인증되지 않은 사용자 감지. 로그인 페이지로 리다이렉트합니다.');
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
      <PageHeader title="공지사항 상세" />
      
      {/* 뒤로가기 버튼 */}
      <button 
        onClick={() => router.push('/announcements')}
        className={`flex items-center ${currentTheme.activeText} hover:opacity-80 mb-4`}
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        <span>목록으로 돌아가기</span>
      </button>
      
      {/* 공지사항 상세 내용 */}
      {isLoading ? (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border} mb-6`}>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`text-lg ${currentTheme.text}`}>로딩 중...</p>
          </div>
        </div>
      ) : error ? (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border} mb-6`}>
          <div className="text-center py-8">
            <p className={`text-lg ${currentTheme.text} text-red-500`}>{error}</p>
          </div>
        </div>
      ) : announcementDetail ? (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border} mb-6`}>
          <div className={`p-4 rounded-lg ${
            announcementDetail.type === AnnouncementType.ALERT
              ? 'bg-amber-50 border border-amber-200'
              : `${currentTheme.activeBg}`
          }`}>
            <div className="flex items-start mb-4">
              {announcementDetail.type === AnnouncementType.ALERT ? (
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <BellIcon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h2 className={`text-xl font-semibold ${announcementDetail.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
                  {announcementDetail.title}
                </h2>
                <p className={`text-sm ${announcementDetail.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-1' : `${currentTheme.subtext} mt-1`}`}>
                  {announcementDetail.createdAt}
                </p>
              </div>
            </div>
            <div className={`mt-4 ${announcementDetail.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
              {announcementDetail.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border} mb-6`}>
          <div className="text-center py-8">
            <p className={`text-lg ${currentTheme.text}`}>공지사항을 찾을 수 없습니다.</p>
          </div>
        </div>
      )}
      
      {/* 다른 공지사항 목록 */}
      <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
        <h3 className={`text-lg font-medium ${currentTheme.text} mb-4`}>다른 공지사항</h3>
        
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements
              .filter(announcement => announcement.id !== announcementId)
              .map((announcement) => (
                <div 
                  key={announcement.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    announcement.type === AnnouncementType.ALERT
                      ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                      : `${currentTheme.activeBg} hover:bg-opacity-80`
                  }`}
                  onClick={() => {
                    console.log(`공지사항 ID ${announcement.id}로 이동합니다.`);
                    router.push(`/announcements/${announcement.id}`);
                  }}
                  data-announcement-id={announcement.id}
                >
                  <div className="flex items-start">
                    {announcement.type === AnnouncementType.ALERT ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BellIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-medium ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
                        {announcement.title}
                      </h3>
                      <p className={`text-xs ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-1' : currentTheme.subtext} mt-1`}>
                        {announcement.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className={`text-center py-4 text-sm ${currentTheme.subtext}`}>다른 공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
} 