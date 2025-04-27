"use client";

import { useState, useEffect, useRef } from "react";
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
import { NAVER_CLIENT_ID } from "@/lib/env";

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

// 열지도 클래스 타입 정의
declare global {
  interface Window {
    naver: any;
  }
}

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

  // 지도 관련 상태 - 통합
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [mapMode, setMapMode] = useState<'departure' | 'arrival'>('departure'); // 지도 모드 상태 추가
  const [mapInstance, setMapInstance] = useState<any>(null); // 네이버 맵 인스턴스 보관

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

  // 네이버 맵 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}&submodules=visualization`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 지도 인스턴스 초기화
  useEffect(() => {
    if (!mapLoaded || !window.naver || !mapRef.current || loading) return;

    try {
      // 네이버 맵 인스턴스 생성 - 한국 전체가 보이도록 설정
      const mapOptions = {
        center: new window.naver.maps.LatLng(36.5, 127.5), // 한국의 중심 좌표
        zoom: 7, // 한국 전체가 보이는 줌 레벨
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT
        }
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMapInstance(map);

      return () => {
        if (heatmap) {
          heatmap.setMap(null);
        }
      };
    } catch (error) {
      console.error("지도 초기화 오류:", error);
    }
  }, [mapLoaded, loading]);

  // 지도 모드가 변경되거나 데이터가 변경될 때 히트맵 업데이트
  useEffect(() => {
    if (!mapLoaded || !window.naver || !mapInstance || loading) return;

    // 이전 히트맵 제거 (효과 보장을 위해 최상단에서 실행)
    if (heatmap) {
      console.log('이전 히트맵 제거');
      heatmap.setMap(null);
      setHeatmap(null);
    }

    // 지도 모드에 따라 데이터 선택
    const locationData = mapMode === 'departure' 
      ? statistics.onList.map(item => ({
          lat: item.latitude,
          lng: item.longitude,
          weight: 1.0
        }))
      : statistics.offList.map(item => ({
          lat: item.latitude,
          lng: item.longitude,
          weight: 1.0
        }));

    // 데이터가 없는 경우 메시지 표시
    if (locationData.length === 0) {
      console.log(`${mapMode === 'departure' ? '출발지' : '도착지'} 분포를 위한 위치 데이터가 없습니다.`);
      return;
    }

    console.log(`${mapMode === 'departure' ? '출발지' : '도착지'} 분포 데이터:`, locationData.length, "개 포인트");

    // 항상 출발지와 도착지 데이터를 모두 고려한 bounds 계산
    if (statistics.onList.length > 0 || statistics.offList.length > 0) {
      // 도착지와 출발지 모두의 위치 데이터로 통합 bounds 계산
      const allLocationData = [...statistics.onList, ...statistics.offList].map(item => ({
        lat: item.latitude,
        lng: item.longitude
      }));
      
      const bounds = new window.naver.maps.LatLngBounds();
      
      // 모든 위치 데이터를 경계에 추가
      allLocationData.forEach(point => {
        bounds.extend(new window.naver.maps.LatLng(point.lat, point.lng));
      });
      
      // 데이터 포인트가 충분히 있는 경우에만 경계 조정
      const hasValidBounds = bounds.hasOwnProperty('_ne') && bounds.hasOwnProperty('_sw');
      if (hasValidBounds) {
        // 경계에 맞게 지도 영역 조정 (여백 추가)
        setTimeout(() => {
          try {
            mapInstance.fitBounds(bounds, {
              top: 50,    // 위쪽 여백
              right: 50,  // 오른쪽 여백
              bottom: 50, // 아래쪽 여백
              left: 50    // 왼쪽 여백
            });
            console.log("지도 경계 설정 완료 (출발지와 도착지 모두 포함)");
          } catch (e) {
            console.error("지도 경계 설정 오류:", e);
          }
        }, 100);
      }
    }

    // 현재 모드에 맞는 데이터만 사용하여 히트맵 생성
    console.log(`${mapMode === 'departure' ? '출발지' : '도착지'} 히트맵 생성 시작`);
    
    // 히트맵 데이터 포맷 변환 (현재 모드에 맞는 데이터만 표시)
    const heatmapData = locationData.map(point => {
      // 네이버 맵 LatLng 객체 생성
      const latLng = new window.naver.maps.LatLng(point.lat, point.lng);
      
      // WeightedLocation 객체처럼 location과 weight 속성 설정
      latLng.weight = point.weight;
      
      return latLng;
    });

    // 히트맵 옵션 및 인스턴스 생성
    const heatmapOptions = {
      map: mapInstance,
      data: heatmapData,
      opacity: 0.7,
      radius: 10
    };

    // 잠시 대기 후 히트맵 생성 (지도 로드 완료 대기)
    setTimeout(() => {
      try {
        const heatmapInstance = new window.naver.maps.visualization.HeatMap(heatmapOptions);
        console.log(`${mapMode === 'departure' ? '출발지' : '도착지'} 히트맵 생성 성공 (${heatmapData.length}개 포인트)`);
        setHeatmap(heatmapInstance);
      } catch (e) {
        console.error(`${mapMode === 'departure' ? '출발지' : '도착지'} 히트맵 생성 오류:`, e);
      }
    }, 500);

  }, [mapLoaded, statistics, loading, mapMode, mapInstance]);

  // 컴포넌트 언마운트 시 정리 작업 추가
  useEffect(() => {
    return () => {
      if (heatmap) {
        heatmap.setMap(null);
      }
    };
  }, [heatmap]);

  // 모드 변경 핸들러
  const toggleMapMode = () => {
    setMapMode(prev => prev === 'departure' ? 'arrival' : 'departure');
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
                  <p className="text-2xl font-semibold text-gray-700">
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
                  <p className="text-2xl font-semibold text-gray-700">{statistics.totalDistance}km</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 운행 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-700">{formatTime(statistics.totalDriveTime)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">최고 속도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-700">{statistics.maxSpeed}km/h</p>
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
                  <p className="text-2xl font-semibold text-gray-700">{statistics.averageDistance}km</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">최대 운행 거리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-700">{statistics.maxDistance}km</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">평균 속도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-700">
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
                  <p className="text-2xl font-semibold text-gray-700">{formatTime(statistics.maxDriveTime)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 운행 종류 분류와 지도 - 레이아웃 유지하고 지도만 변경 */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-8">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>운행 목적별 운행건수</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
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

            {/* 하나의 지도로 통합하고 모드 전환 버튼 추가 */}
            <Card className="md:col-span-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{mapMode === 'departure' ? '출발지 분포' : '도착지 분포'}</CardTitle>
                <div className="flex space-x-1 rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setMapMode('departure')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border 
                      ${mapMode === 'departure' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    출발지
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('arrival')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border 
                      ${mapMode === 'arrival' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    도착지
                  </button>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                {mapLoaded ? (
                  <div ref={mapRef} className="w-full h-full rounded-md"></div>
                ) : (
                  <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">지도를 불러오는 중...</p>
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-500">
                  * 빨간색 영역일수록 차량 {mapMode === 'departure' ? '출발' : '도착'}이 자주 발생한 지역입니다.
                </p>
                <p className="text-xs text-gray-500">
                  * {mapMode === 'departure' ? '출발' : '도착'} 위치 데이터 기준: 
                  {mapMode === 'departure' ? statistics.onList.length : statistics.offList.length}개 데이터
                </p>
              </div>
            </Card>
          </div>
          
          {/* 시간/요일별 차트 - 기존 코드 유지 */}
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