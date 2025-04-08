"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import PageHeader from "@/components/common/PageHeader";
import { useAnnouncementStore } from "@/lib/announcementStore";
import { AnnouncementType } from "@/types/announcement";
import { ExclamationTriangleIcon, BellIcon, ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
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
  
  // 목록으로 돌아갈 때 사용할 페이지 번호
  const [savedPage, setSavedPage] = useState<number>(0);
  // 현재 표시 중인 공지사항 페이지
  const [displayPage, setDisplayPage] = useState<number>(0);
  
  // 로컬 스토리지에서 페이지 번호 가져오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPageStr = localStorage.getItem('announcementCurrentPage');
      if (savedPageStr) {
        const page = parseInt(savedPageStr);
        setSavedPage(page);
        setDisplayPage(page);
        console.log('저장된 페이지 번호:', page);
      }
    }
  }, []);
  
  // 공지 사항 데이터 가져오기
  const { 
    announcementDetail, 
    announcements,
    totalPages,
    isLoading, 
    error, 
    fetchAnnouncementDetail,
    fetchAnnouncements
  } = useAnnouncementStore();
  
  // 상세 페이지의 다른 공지사항 목록 페이지 사이즈
  const detailPageListSize = 5;
  
  // 다른 공지사항 클릭 핸들러
  const handleOtherAnnouncementClick = (id: number) => {
    console.log(`공지사항 ID ${id}로 이동합니다.`);
    // 현재 표시 중인 페이지 번호를 저장합니다 (원래 저장된 페이지가 아닌 현재 보고 있는 페이지)
    if (typeof window !== 'undefined') {
      localStorage.setItem('announcementCurrentPage', displayPage.toString());
    }
    router.push(`/announcements/${id}`);
  };
  
  // 이전 페이지로 변경
  const handlePrevPage = () => {
    if (displayPage > 0) {
      const newPage = displayPage - 1;
      setDisplayPage(newPage);
      fetchAnnouncements(newPage, detailPageListSize);
    }
  };
  
  // 다음 페이지로 변경
  const handleNextPage = () => {
    if (displayPage < totalPages - 1) {
      const newPage = displayPage + 1;
      setDisplayPage(newPage);
      fetchAnnouncements(newPage, detailPageListSize);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isNaN(announcementId)) {
      console.error('유효하지 않은 ID입니다:', resolvedParams.id);
      return;
    }
    
    console.log('공지사항 상세 정보 요청 ID:', announcementId);
    fetchAnnouncementDetail(announcementId);
    
    // 로컬 스토리지에서 페이지 번호를 가져와서 해당 페이지의 공지사항 로드
    if (typeof window !== 'undefined') {
      const savedPageStr = localStorage.getItem('announcementCurrentPage');
      const pageToLoad = savedPageStr ? parseInt(savedPageStr) : 0;
      console.log('공지사항 목록을 가져올 페이지:', pageToLoad);
      setDisplayPage(pageToLoad);
      fetchAnnouncements(pageToLoad, detailPageListSize);
    } else {
      fetchAnnouncements(0, detailPageListSize);
    }
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
        onClick={() => router.push(`/announcements?page=${savedPage}`)}
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
        <div className={`${currentTheme.cardBg} p-8 rounded-xl shadow-sm ${currentTheme.border} mb-8`}>
          <div className={`p-6 rounded-lg min-h-[300px] ${
            announcementDetail.type === AnnouncementType.ALERT
              ? 'bg-amber-50 border border-amber-200'
              : `${currentTheme.activeBg}`
          }`}>
            <div className="flex items-start mb-6">
              {announcementDetail.type === AnnouncementType.ALERT ? (
                <ExclamationTriangleIcon className="h-7 w-7 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <BellIcon className="h-7 w-7 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h2 className={`text-2xl font-semibold ${announcementDetail.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
                  {announcementDetail.title}
                </h2>
                <p className={`text-sm ${announcementDetail.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-2' : `${currentTheme.subtext} mt-2`}`}>
                  {announcementDetail.createdAt}
                </p>
              </div>
            </div>
            <div className={`mt-6 text-lg ${announcementDetail.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
              {announcementDetail.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4">{line}</p>
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
      <div className={`${currentTheme.cardBg} p-5 rounded-xl shadow-sm ${currentTheme.border}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-base font-medium ${currentTheme.text}`}>관련 공지사항</h3>
          <div className="flex items-center">
            <button 
              onClick={handlePrevPage}
              disabled={displayPage <= 0}
              className={`px-2 py-1 rounded mr-2 ${
                displayPage <= 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <p className={`text-xs ${currentTheme.subtext}`}>
              페이지 {displayPage + 1}
            </p>
            <button 
              onClick={handleNextPage}
              disabled={displayPage >= totalPages - 1}
              className={`px-2 py-1 rounded ml-2 ${
                displayPage >= totalPages - 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {announcements.length > 0 ? (
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  announcement.id === announcementId 
                    ? `border-2 border-blue-500 ${announcement.type === AnnouncementType.ALERT ? 'bg-amber-50' : currentTheme.activeBg}`
                    : announcement.type === AnnouncementType.ALERT
                      ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                      : `${currentTheme.activeBg} hover:bg-opacity-80`
                }`}
                onClick={() => announcement.id !== announcementId && handleOtherAnnouncementClick(announcement.id)}
                data-announcement-id={announcement.id}
              >
                <div className="flex items-start">
                  {announcement.type === AnnouncementType.ALERT ? (
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  ) : (
                    <BellIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className={`text-sm font-medium ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>
                        {announcement.title}
                      </h3>
                      {announcement.id === announcementId && (
                        <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs rounded-full">
                          현재 글
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${announcement.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-1' : currentTheme.subtext} mt-0.5`}>
                      {announcement.createdAt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-3 text-xs ${currentTheme.subtext}`}>현재 페이지에 공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
} 