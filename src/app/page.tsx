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

// 공지사항 데이터
const notices = [
  {
    id: 1,
    title: "시스템 점검 안내",
    content: "6월 20일 새벽 2시부터 4시까지 시스템 점검이 있을 예정입니다.",
    date: "2023-06-15",
    isImportant: true,
  },
  {
    id: 2,
    title: "신규 기능 안내",
    content: "차량 실시간 위치 추적 기능이 추가되었습니다.",
    date: "2023-06-10",
    isImportant: false,
  },
  {
    id: 3,
    title: "보고서 양식 변경",
    content: "월간 운행 보고서 양식이 변경되었습니다. 새로운 양식을 확인해주세요.",
    date: "2023-06-05",
    isImportant: false,
  },
];

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

const vehicleStatusData = {
  labels: ["운행", "미운행", "미관제"],
  datasets: [
    {
      data: [380, 46, 30],
      backgroundColor: [
        "rgba(79, 70, 229, 0.8)",
        "rgba(234, 179, 8, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
    },
  ],
};

const ownershipData = {
  labels: ["법인", "개인"],
  datasets: [
    {
      data: [320, 136],
      backgroundColor: [
        "rgba(79, 70, 229, 0.8)",
        "rgba(249, 115, 22, 0.8)",
      ],
    },
  ],
};

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
  const [employeeAddSuccess, setEmployeeAddSuccess] = useState(false);
  const [employeeAddName, setEmployeeAddName] = useState('');

  // 컴포넌트가 마운트될 때 로컬 스토리지에서 직원 추가 성공 정보를 확인
  useEffect(() => {
    const success = localStorage.getItem('employeeAddSuccess');
    const name = localStorage.getItem('employeeAddName');
    
    if (success === 'true' && name) {
      setEmployeeAddSuccess(true);
      setEmployeeAddName(name);
      
      // 성공 메시지를 표시한 후 로컬 스토리지에서 제거
      localStorage.removeItem('employeeAddSuccess');
      localStorage.removeItem('employeeAddName');
      
      // 5초 후 성공 메시지 숨기기
      const timer = setTimeout(() => {
        setEmployeeAddSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
      <div className="p-8">
        <PageHeader 
          title="대시보드"
        />

        {/* 직원 추가 성공 메시지 */}
        {employeeAddSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center justify-between">
            <p className="font-medium"><span className="font-bold">{employeeAddName}</span> 직원이 성공적으로 추가되었습니다.</p>
            <button 
              onClick={() => setEmployeeAddSuccess(false)}
              className="text-green-700 hover:text-green-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* 환영 메시지와 공지사항, 점검 차량 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 환영 메시지와 공지사항 */}
          <div className={`lg:col-span-4 ${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center mb-6">
              <div className={`h-12 w-12 rounded-full ${currentTheme.activeBg} flex items-center justify-center mr-4`}>
                <UserIcon className={`h-6 w-6 ${currentTheme.activeText}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${currentTheme.text}`}>안녕하세요, {userInfo.name}님</h2>
                <p className={`text-sm ${currentTheme.subtext}`}>마지막 로그인: {userInfo.lastLogin}</p>
              </div>
            </div>

            {/* 공지사항 */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-base font-medium ${currentTheme.text}`}>공지사항</h3>
                <button className={`text-sm ${currentTheme.activeText} hover:opacity-80 font-medium flex items-center`}>
                  <BellIcon className="h-4 w-4 mr-1" />
                  전체보기
                </button>
              </div>
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div 
                    key={notice.id} 
                    className={`p-3 rounded-lg ${notice.isImportant 
                      ? 'bg-amber-50 border border-amber-200' 
                      : `${currentTheme.activeBg} hover:bg-opacity-80 transition-colors`
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        {notice.isImportant && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h3 className={`font-medium ${notice.isImportant ? 'text-black dark:text-black' : currentTheme.text}`}>{notice.title}</h3>
                          <p className={`text-sm ${notice.isImportant ? 'text-black dark:text-black mt-1' : `${currentTheme.subtext} mt-1`}`}>{notice.content}</p>
                        </div>
                      </div>
                      <span className={`text-xs ${notice.isImportant ? 'text-black dark:text-black' : currentTheme.subtext} whitespace-nowrap ml-4`}>{notice.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 사용자 현황 카드 */}
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-sm ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-medium ${currentTheme.text}`}>사용자 (총 6명)</h3>
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
                <span className={`text-sm font-medium ${currentTheme.text}`}>5명</span>
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
                <span className={`text-sm font-medium ${currentTheme.text}`}>380대</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <TruckIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  미운행
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>46대</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <TruckIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  미관제
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>30대</span>
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
                <span className={`text-sm font-medium ${currentTheme.text}`}>320대</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext} flex items-center`}>
                  <UserIcon className={`h-4 w-4 mr-2 ${currentTheme.activeText}`} />
                  개인
                </span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>136대</span>
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
                <span className={`text-sm font-medium ${currentTheme.text}`}>1,342,000 km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${currentTheme.subtext}`}>운행 건수</span>
                <span className={`text-sm font-medium ${currentTheme.text}`}>2,345건</span>
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
                data={{
                  labels: monthlyData.labels,
                  datasets: [{
                    ...monthlyData.datasets[0],
                    borderColor: currentTheme.chartColors[0],
                    backgroundColor: currentTheme.chartColors[0],
                  }],
                }}
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