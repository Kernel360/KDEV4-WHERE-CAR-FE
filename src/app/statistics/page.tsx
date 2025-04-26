"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import PageHeader from "@/components/common/PageHeader";
import * as React from "react";
import { cn } from "@/lib/utils";
import { MapPinIcon, ClockIcon, TagIcon } from "@heroicons/react/24/outline";
import { formatTime } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";
import { API_BASE_URL, fetchApi } from "@/lib/api";

// Chart.js 등록
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

// 위치 데이터 타입 정의
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}

// 통계 데이터 타입 정의
interface StatisticsData {
  totalDistance: number;
  maxDistance: number;
  averageDistance: number;
  maxSpeed: number;
  averageSpeed: number;
  totalDriveTime: number;
  maxDriveTime: number;
  averageDriveTime: number;
  unclassifiedCount: number;
  commuteCount: number;
  businessCount: number;
  personalCount: number;
  onList: LocationData[];
  offList: LocationData[];
}

// Card 컴포넌트 생성
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalDistance: 0,
    maxDistance: 0,
    averageDistance: 0,
    maxSpeed: 0,
    averageSpeed: 0,
    totalDriveTime: 0,
    maxDriveTime: 0,
    averageDriveTime: 0,
    unclassifiedCount: 0,
    commuteCount: 0,
    businessCount: 0,
    personalCount: 0,
    onList: [],
    offList: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: formatDateToYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30일 전
    to: formatDateToYYYYMMDD(new Date()) // 오늘
  });

  const router = useRouter();
  const { token } = useAuthStore();

  // 날짜를 'YYYYMMDD' 형식으로 변환하는 함수
  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // 날짜 변경 처리 함수
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'from' | 'to') => {
    const date = e.target.value;
    if (date) {
      // YYYY-MM-DD 형식을 YYYYMMDD로 변환
      const formattedDate = date.replace(/-/g, '');
      setDateRange(prev => ({
        ...prev,
        [type]: formattedDate
      }));
    }
  };

  // 통계 데이터 가져오기
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // API 모듈의 fetchApi 함수 사용
      const responseData = await fetchApi<{
        data: StatisticsData;
        message: string;
        statusCode: number;
      }>(`/api/stat/companies/my`, {
        from: dateRange.from,
        to: dateRange.to
      });
      
      console.log('통계 데이터 응답:', responseData);
      
      if (responseData.statusCode === 200) {
        setStatistics(responseData.data);
      } else {
        throw new Error(responseData.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('통계 데이터를 가져오는 중 오류 발생:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 범위가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchStatistics();
  }, [dateRange.from, dateRange.to]);

  // 로그인 확인
  useEffect(() => {
    const isAuthed = useAuthStore.getState().checkAuth();
    if (!isAuthed) {
      router.push('/login');
    }
  }, [router]);

  // 운행 유형 데이터 (도넛 차트)
  const tripTypeData = {
    labels: ["출퇴근", "업무", "개인", "미분류"],
    datasets: [
      {
        data: [
          statistics.commuteCount,
          statistics.businessCount,
          statistics.personalCount,
          statistics.unclassifiedCount
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)"
        ],
        borderWidth: 1,
      },
    ],
  };

  // 시간대별 통계 데이터 계산 (onList의 timestamp 기준)
  const calculateHourlyData = () => {
    // 24시간에 대한 빈 배열 초기화 (0시~23시)
    const hourCounts = Array(24).fill(0);
    
    // onList의 각 항목에 대해 시간 추출 및 카운트
    statistics.onList.forEach(item => {
      const timestamp = item.timestamp;
      if (timestamp) {
        // "2025-04-26 20:46:57" 형식에서 시간 부분 추출
        const hour = new Date(timestamp).getHours();
        if (hour >= 0 && hour < 24) {
          hourCounts[hour]++;
        }
      }
    });
    
    return hourCounts;
  };

  // 요일별 통계 데이터 계산 (offList의 timestamp 기준)
  const calculateDailyData = () => {
    // 7일에 대한 빈 배열 초기화 (0: 일요일 ~ 6: 토요일)
    const dayCounts = Array(7).fill(0);
    
    // offList의 각 항목에 대해 요일 추출 및 카운트
    statistics.offList.forEach(item => {
      const timestamp = item.timestamp;
      if (timestamp) {
        // "2025-04-26 20:46:57" 형식에서 요일 추출
        const day = new Date(timestamp).getDay(); // 0(일)~6(토)
        dayCounts[day]++;
      }
    });
    
    // 월~일 순서로 재배열 (한국 기준)
    return [
      dayCounts[1], // 월
      dayCounts[2], // 화
      dayCounts[3], // 수
      dayCounts[4], // 목
      dayCounts[5], // 금
      dayCounts[6], // 토
      dayCounts[0]  // 일
    ];
  };

  // 시간별 통계 데이터 (막대 차트) - 동적 생성
  const timeData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}시`),
    datasets: [
      {
        label: "운행 횟수",
        data: calculateHourlyData(),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  // 요일별 주행 통계 (라인 차트) - 동적 생성
  const dayData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "운행 횟수",
        data: calculateDailyData(),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // 차트 옵션
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // 날짜 입력값용 포맷 변환
  const formatDateForInput = (dateString: string) => {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="운행 통계" 
        description="차량 운행에 대한 종합 통계 정보입니다." 
      />

      {/* 날짜 범위 선택 */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="from-date" className="text-sm font-medium">시작일:</label>
          <input
            id="from-date"
            type="date"
            value={formatDateForInput(dateRange.from)}
            onChange={(e) => handleDateChange(e, 'from')}
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="to-date" className="text-sm font-medium">종료일:</label>
          <input
            id="to-date"
            type="date"
            value={formatDateForInput(dateRange.to)}
            onChange={(e) => handleDateChange(e, 'to')}
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <button 
          onClick={fetchStatistics}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          조회
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg font-medium">데이터를 불러오는 중...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">오류 발생</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* 주요 통계 카드 - 더 많은 데이터 활용 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 운행 건수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics.commuteCount + statistics.businessCount + statistics.personalCount + statistics.unclassifiedCount}건
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 운행 거리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalDistance}km</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 운행 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">{formatTime(statistics.totalDriveTime)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">최고 속도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">{statistics.maxSpeed}km/h</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 추가 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">평균 운행 거리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">{statistics.averageDistance}km</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">최대 운행 거리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">{statistics.maxDistance}km</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">평균 속도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics.averageSpeed < 0 ? '0' : statistics.averageSpeed}km/h
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">최대 운행 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">{formatTime(statistics.maxDriveTime)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 운행 종류 분류 - 제목 변경 및 데이터 활용 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>운행 목적별 운행건수</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <Doughnut 
                  data={tripTypeData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>도착지 분포</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">지도 영역</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 시간/요일별 차트 유지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>시간대별 운행 건수</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <Bar 
                  data={timeData} 
                  options={lineOptions} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>요일별 운행 건수</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <Line 
                  data={dayData} 
                  options={lineOptions} 
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 