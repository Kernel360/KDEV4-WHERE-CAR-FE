"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import {
  UserMinusIcon,
  TruckIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClockIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import PageHeader from "@/components/common/PageHeader";
import Link from "next/link";
import { useCarOverviewStore } from "@/lib/carOverviewStore";
import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useCarLogsStore } from '@/lib/carLogsStore';
import { useAnnouncementStore } from '@/lib/announcementStore';
import { AnnouncementType } from '@/types/announcement';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// 사용자 정보 (실제로는 API에서 가져올 데이터)
const userInfo = {
  name: "홍길동",
  role: "관리자",
  lastLogin: "2023-06-15 09:30",
};


// 월간 데이터를 상수로 유지
const monthlyData = {
  labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
  datasets: [
    {
      label: "운행 거리 (km)",
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: "rgb(79, 70, 229)",
      backgroundColor: "rgba(79, 70, 229, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

// 사용자 활동 및 일간 운행 데이터를 상수로 유지
const userActivityData = {
  labels: ["활성", "비활성"],
  datasets: [
    {
      data: [1100, 134],
      backgroundColor: [
        "rgba(79, 70, 229, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
    },
  ],
};

const dailyTripsData = {
  labels: ["월", "화", "수", "목", "금", "토", "일"],
  datasets: [
    {
      label: "운행 건수",
      data: [320, 450, 380, 420, 390, 180, 120],
      backgroundColor: "rgba(79, 70, 229, 0.5)",
      borderColor: "rgb(79, 70, 229)",
      borderWidth: 1,
    },
  ],
};

export default function DashboardPage() {
  const { currentTheme } = useTheme();
  const [timeRange, setTimeRange] = useState("week");
  
  // Get car overview data from store
  const { data: carOverview, isLoading, error, fetchOverview } = useCarOverviewStore();
  
  // Get employee data from user store
  const { users, isLoading: isEmployeeLoading, fetchUsersOfCompany } = useUserStore();
  
  // Get car logs stats from store
  const { stats, fetchCarLogsStats } = useCarLogsStore();

  // Get announcements data from store
  const { announcements, isLoading: isAnnouncementLoading, fetchAnnouncements } = useAnnouncementStore();
  
  // Get current user info from auth store
  const { userProfile, fetchUserProfile } = useAuthStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchOverview();
    fetchUsersOfCompany();
    fetchCarLogsStats();
    fetchAnnouncements(0, 3); // 대시보드에서는 최신 3개만 표시
    fetchUserProfile(); // 현재 사용자 정보 가져오기
  }, [fetchOverview, fetchUsersOfCompany, fetchCarLogsStats, fetchAnnouncements, fetchUserProfile]);
  
  // Prepare car status data for chart - moved inside component
  const vehicleStatusData = {
    labels: ["운행", "미운행", "미관제"],
    datasets: [
      {
        data: carOverview 
          ? [carOverview.activeCars, carOverview.inactiveCars, carOverview.untrackedCars] 
          : [0, 0, 0],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };
  
  // Prepare ownership data for chart - moved inside component
  const ownershipData = {
    labels: ["법인", "개인"],
    datasets: [
      {
        data: carOverview 
          ? [carOverview.totalCorporateCars, carOverview.totalPrivateCars] 
          : [0, 0],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)",
          "rgba(249, 115, 22, 0.8)",
        ],
      },
    ],
  };

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // 로그인 상태 확인 후 리다이렉트
  useEffect(() => {
    // 초기화 및 인증 상태 갱신
    const isAuthed = useAuthStore.getState().checkAuth();
    
    if (!isAuthed) {
      console.log('대시보드: 인증되지 않은 사용자 감지. 로그인 페이지로 리다이렉트합니다.');
      router.push('/login');
    }
  }, [router]);

  // 페이지 진입 시마다 인증 상태 확인
  useEffect(() => {
    const checkAuthentication = () => {
      const isAuthed = useAuthStore.getState().checkAuth();
      if (!isAuthed) {
        console.log('대시보드: 인증 상태 변경 감지. 로그인 페이지로 리다이렉트합니다.');
        router.push('/login');
      }
    };
    
    // 초기 확인
    checkAuthentication();
    
    // 페이지 포커스를 받았을 때 다시 확인
    window.addEventListener('focus', checkAuthentication);
    
    return () => {
      window.removeEventListener('focus', checkAuthentication);
    };
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

  // Prepare monthly data for chart
  const monthlyChartData = {
    labels: stats?.monthlyMileages
      ? [...stats.monthlyMileages]
          .sort((a, b) => a.month.localeCompare(b.month))
          .map(item => {
            const [year, month] = item.month.split('-');
            return `${year.slice(2)}년 ${parseInt(month)}월`;
          })
      : [],
    datasets: [
      {
        label: "운행 거리 (km)",
        data: stats?.monthlyMileages
          ? [...stats.monthlyMileages]
              .sort((a, b) => a.month.localeCompare(b.month))
              .map(item => item.totalMileage)
          : [],
        borderColor: "rgb(79, 70, 229)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
      <div className="p-8">
        <PageHeader 
          title="대시보드"
        />

        {/* 환영 메시지와 공지사항, 점검 차량 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 환영 메시지와 공지사항 */}
          <div className={`lg:col-span-4 ${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center mb-6">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${currentTheme.profileGradient} flex items-center justify-center mr-4`}>
                <span className="text-sm font-medium text-white">{userProfile?.name ? userProfile.name.charAt(0) : '사'}</span>
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${currentTheme.text}`}>안녕하세요, {userProfile?.name || '사용자'}님</h2>
                <p className={`text-sm ${currentTheme.subtext}`}>
                  {userProfile?.jobTitle || '직원'} | {userProfile?.email || ''}
                </p>
              </div>
            </div>

            {/* 공지사항 */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-base font-medium ${currentTheme.text}`}>공지사항</h3>
                <Link href="/announcements" className={`text-sm ${currentTheme.activeText} hover:opacity-80 font-medium flex items-center`}>
                  <BellIcon className="h-4 w-4 mr-1" />
                  전체보기
                </Link>
              </div>
              <div className="space-y-3">
                {isAnnouncementLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className={`text-sm ${currentTheme.subtext}`}>로딩 중...</p>
                  </div>
                ) : announcements.length > 0 ? (
                  announcements.map((notice) => (
                    <div 
                      key={notice.id} 
                      className={`p-3 rounded-lg ${notice.type === AnnouncementType.ALERT
                        ? 'bg-amber-50 border border-amber-200' 
                        : `${currentTheme.activeBg} hover:bg-opacity-80 transition-colors`
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          {notice.type === AnnouncementType.ALERT && (
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h3 className={`font-medium ${notice.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.text}`}>{notice.title}</h3>
                            <p className={`text-sm ${notice.type === AnnouncementType.ALERT ? 'text-black dark:text-black mt-1' : `${currentTheme.subtext} mt-1`}`}>{notice.content}</p>
                          </div>
                        </div>
                        <span className={`text-xs ${notice.type === AnnouncementType.ALERT ? 'text-black dark:text-black' : currentTheme.subtext} whitespace-nowrap ml-4`}>{notice.createdAt}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-center py-4 text-sm ${currentTheme.subtext}`}>공지사항이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 사용자 현황 카드 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-medium ${currentTheme.text}`}>사용자</h3>
              <button className={`text-sm ${currentTheme.activeText} hover:opacity-80 font-medium`}>
                + 등록
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <UserIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  신규 사용자
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isEmployeeLoading ? "로딩 중..." : `${users.length}명`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <UserMinusIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  미사용 사용자
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>0명</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <ClockIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  기간변경 사용자
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>0명</span>
              </div>
            </div>
          </div>

          {/* 차량 현황 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-medium ${currentTheme.text}`}>차량 현황</h3>
              <Link href="/vehicles" className={`text-sm ${currentTheme.activeText} hover:opacity-80 font-medium`}>
                자세히
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <TruckIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  운행
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isLoading ? "로딩 중..." : `${carOverview?.activeCars || 0}대`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <TruckIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  미운행
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isLoading ? "로딩 중..." : `${carOverview?.inactiveCars || 0}대`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <TruckIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  미관제
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isLoading ? "로딩 중..." : `${carOverview?.untrackedCars || 0}대`}
                </span>
              </div>
            </div>
          </div>

          {/* 차량 정보 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-medium ${currentTheme.text}`}>차량 정보</h3>
              <Link href="/vehicles" className={`text-sm ${currentTheme.activeText} hover:opacity-80 font-medium`}>
                자세히
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <BuildingOfficeIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  법인
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isLoading ? "로딩 중..." : `${carOverview?.totalCorporateCars || 0}대`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <UserIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  개인
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isLoading ? "로딩 중..." : `${carOverview?.totalPrivateCars || 0}대`}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${currentTheme.subtext} flex items-center font-medium`}>
                  전체 차량
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {isLoading ? "로딩 중..." : `${carOverview?.totalCars || 0}대`}
                </span>
              </div>
            </div>
          </div>

          {/* 운행 통계 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-medium ${currentTheme.text}`}>운행 통계</h3>
              <Link href="/logs" className={`text-sm ${currentTheme.activeText} hover:opacity-80 font-medium`}>
                자세히
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext}`}>이번 달</span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {stats ? `${stats.totalMileage.toLocaleString()} km` : "로딩 중..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext}`}>운행 건수</span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>
                  {stats ? `${stats.carLogsCount}건` : "로딩 중..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 월간 주행거리 차트 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <h3 className={`text-lg font-medium ${currentTheme.text} mb-4`}>월간 주행거리</h3>
            <div className="h-80">
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        callback: (value) => `${Number(value).toLocaleString()} km`
                      },
                    },
                    x: {
                      grid: {
                        color: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${Number(context.raw).toLocaleString()} km`
                      }
                    }
                  },
                }}
              />
            </div>
          </div>

          {/* 차량 상태 분포 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <h3 className={`text-lg font-medium ${currentTheme.text} mb-4`}>차량 상태 분포</h3>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: vehicleStatusData.labels,
                  datasets: [{
                    ...vehicleStatusData.datasets[0],
                    backgroundColor: currentTheme.chartColors,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: currentTheme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        padding: 20,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
  );
} 