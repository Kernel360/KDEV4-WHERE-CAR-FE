import { useEffect, useRef, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { NAVER_CLIENT_ID } from '@/lib/env';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface NaverMapProps {
  // 기본 지도 속성
  latitude?: number;
  longitude?: number;
  height?: string;
  width?: string;
  zoom?: number;
  debug?: boolean;
  
  // 경로 관련 속성
  routePoints?: RoutePoint[];
  isLoading?: boolean;
  showRouteInfo?: boolean;
}

declare global {
  interface Window {
    naver: any;
    hasNaverMapErrorHandler?: boolean;
  }
}

// 환경 정보 디버깅 컴포넌트
const DebugModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  const clientId = NAVER_CLIENT_ID || 'Not Set';
  const currentURL = typeof window !== 'undefined' ? window.location.href : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
  const hasNaver = typeof window !== 'undefined' && 'naver' in window;
  const hasNaverMaps = typeof window !== 'undefined' && 'naver' in window && window.naver && 'maps' in window.naver;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">네이버 지도 디버그 정보</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">환경 설정:</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
              <pre className="text-xs text-gray-700 dark:text-gray-300">
                {`CLIENT_ID: ${clientId}
NODE_ENV: ${process.env.NODE_ENV}
Hostname: ${hostname}
Protocol: ${protocol}
Full URL: ${currentURL}`}
              </pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">네이버 객체 상태:</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <pre className="text-xs text-gray-700 dark:text-gray-300">
                {`window.naver 존재: ${hasNaver ? '✅' : '❌'}
window.naver.maps 존재: ${hasNaverMaps ? '✅' : '❌'}`}
              </pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">문제 해결 방법:</h4>
            <ol className="text-xs text-gray-700 dark:text-gray-300 list-decimal pl-4 space-y-2">
              <li>네이버 개발자 콘솔에서 등록된 웹 서비스 URL 확인</li>
              <li>현재 URL(<code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{hostname}</code>)이 네이버 개발자 콘솔에 등록되어 있는지 확인</li>
              <li>CLIENT_ID가 올바른지 확인</li>
              <li>브라우저 콘솔에서 오류 메시지 확인</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// Naver Maps API 스크립트 로드 함수
const loadNaverScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('NaverMap: 스크립트 로드 시작');
    
    // 이미 로드되어 있는 경우
    if (window.naver && window.naver.maps) {
      console.log('NaverMap: window.naver와 naver.maps 객체가 이미 존재함');
      resolve();
      return;
    }
    
    // window.naver 객체 디버깅
    console.log('NaverMap: window.naver 객체:', window.naver);
    
    // 이미 스크립트 태그가 존재하는 경우
    const existingScript = document.getElementById('naver-map-script');
    if (existingScript) {
      console.log('NaverMap: 이미 스크립트 태그가 존재함, 이벤트 리스너 추가');
      existingScript.addEventListener('load', () => {
        console.log('NaverMap: 기존 스크립트 로드 완료');
        resolve();
      });
      
      existingScript.addEventListener('error', (e) => {
        console.error('NaverMap: 기존 스크립트 로드 실패:', e);
        reject(e);
      });
      
      return;
    }
    
    // 새 스크립트 태그 생성
    console.log('NaverMap: 새 스크립트 태그 생성');
    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.type = 'text/javascript';
    
    // 환경변수에서 CLIENT ID 가져오기
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    
    console.log(`NaverMap: 사용 clientId=${clientId}`);
    
    // 전역 에러 핸들러 등록 (한 번만)
    if (!window.hasNaverMapErrorHandler) {
      window.hasNaverMapErrorHandler = true;
      window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('naver') && e.message.includes('authentication')) {
          console.error('NaverMap: 인증 관련 오류 발생:', e.message);
          alert('네이버 지도 API 인증 오류가 발생했습니다.\n\n이 오류는 일반적으로 현재 도메인이 Naver Developers Console에 등록되지 않았을 때 발생합니다.\n\n1. Naver Developers Console에 접속 (https://console.naver.com/)\n2. 애플리케이션 > 내 애플리케이션 > 해당 앱 선택\n3. 웹 서비스 URL에 http://localhost:3000 추가\n\n문제가 지속되면 클라이언트 ID('+clientId+')가 올바른지 확인하세요.');
        }
      });
    }
    
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    
    script.onload = () => {
      console.log('NaverMap: 스크립트 로드 완료, window.naver 객체:', window.naver);
      if (!window.naver || !window.naver.maps) {
        console.error('NaverMap: 스크립트는 로드됐지만 window.naver 또는 naver.maps 객체가 없음');
        reject(new Error('Naver maps API objects not available after script load'));
        return;
      }
      resolve();
    };
    
    script.onerror = (e) => {
      console.error('NaverMap: 스크립트 로드 실패 (네트워크 오류):', e);
      reject(e);
    };
    
    document.head.appendChild(script);
    console.log('NaverMap: 스크립트 태그를 head에 추가함');
  });
};

export default function NaverMap({
  latitude = 37.5666805, // 서울시청 기본 좌표
  longitude = 126.9784147,
  height = '400px',
  width = '100%',
  zoom = 15,
  debug = false,
  routePoints = [],
  isLoading = false,
  showRouteInfo = true,
}: NaverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [isRefReady, setIsRefReady] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  
  // 디버깅 정보를 콘솔에 출력하는 함수
  const addDebugInfo = (message: string) => {
    if (debug) {
      console.log(message);
    }
  };
  
  // DOM ref가 준비되었는지 확인하고 설정하는 효과
  useEffect(() => {
    if (mapContainerRef.current) {
      addDebugInfo(`NaverMap: DOM ref가 준비됨`);
      setIsRefReady(true);
    } else {
      addDebugInfo(`NaverMap: DOM ref가 준비되지 않음 (컨테이너가 아직 렌더링되지 않음)`);
      
      // 타임아웃을 통해 다시 확인
      const timeout = setTimeout(() => {
        if (mapContainerRef.current) {
          addDebugInfo(`NaverMap: DOM ref가 타임아웃 후 준비됨`);
          setIsRefReady(true);
        } else {
          addDebugInfo(`NaverMap: DOM ref가 타임아웃 후에도 준비되지 않음 (심각한 렌더링 문제)`);
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug]);
  
  // 지도 초기화 효과 - 스크립트 로드
  useEffect(() => {
    let isMounted = true;

    const initializeMapScript = async () => {
      try {
        await loadNaverScript();
        if (isMounted) {
          setIsMapLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error('네이버 지도 API 로드 실패:', err);
          setError('네이버 지도 API를 로드하는데 실패했습니다.');
        }
      }
    };

    if (isRefReady) {
      initializeMapScript();
    }

    return () => {
      isMounted = false;
    };
  }, [isRefReady]);
  
  // 지도 초기화 효과 - 지도 및 마커 생성
  useEffect(() => {
    let isMounted = true;
    
    // 지도 초기화 함수
    const initializeMap = async () => {
      addDebugInfo(`NaverMap: 초기화 시작 (${new Date().toISOString()})`);
      
      // DOM 참조 확인
      if (!mapContainerRef.current) {
        addDebugInfo('NaverMap: mapContainerRef.current가 없음');
        return;
      }
      
      try {
        // 지도 옵션 설정
        const hasRouteData = routePoints && routePoints.length > 0;
        
        // 중심 좌표 설정
        const center = hasRouteData 
          ? new window.naver.maps.LatLng(routePoints[0].lat, routePoints[0].lng)
          : new window.naver.maps.LatLng(latitude, longitude);
        
        // 지도 객체 생성
        const mapOptions = {
          center: center,
          zoom: zoom,
          mapTypeId: window.naver.maps.MapTypeId.NORMAL
        };
        
        if (!mapInstance.current) {
          mapInstance.current = new window.naver.maps.Map(mapContainerRef.current, mapOptions);
        } else {
          // 이미 지도가 생성된 경우 중심 좌표와 줌 레벨만 업데이트
          mapInstance.current.setCenter(center);
          mapInstance.current.setZoom(zoom);
        }
        
        // 경로가 있는 경우 지도 범위 조정
        if (hasRouteData) {
          const bounds = new window.naver.maps.LatLngBounds();
          routePoints.forEach(point => {
            bounds.extend(new window.naver.maps.LatLng(point.lat, point.lng));
          });
          mapInstance.current.fitBounds(bounds, { padding: 50 });
        }
        
        // 기존 마커 제거
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
        
        if (hasRouteData) {
          // 경로 선 그리기
          const path = routePoints.map(point => new window.naver.maps.LatLng(point.lat, point.lng));
          const polyline = new window.naver.maps.Polyline({
            path: path,
            strokeColor: '#4B70FD',
            strokeWeight: 4,
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            map: mapInstance.current
          });
          
          // 출발지 마커 추가
          const startMarker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(routePoints[0].lat, routePoints[0].lng),
            map: mapInstance.current,
            icon: {
              content: '<div style="background-color:#10B981; width:16px; height:16px; border-radius:50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              size: new window.naver.maps.Size(16, 16),
              anchor: new window.naver.maps.Point(8, 8),
            },
          });
          markers.current.push(startMarker);
          
          // 도착지 마커 추가
          const endMarker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng),
            map: mapInstance.current,
            icon: {
              content: '<div style="background-color:#EF4444; width:16px; height:16px; border-radius:50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              size: new window.naver.maps.Size(16, 16),
              anchor: new window.naver.maps.Point(8, 8),
            },
          });
          markers.current.push(endMarker);
          
          // 중간 지점 마커 추가 (더 적은 수의 지점에만 표시)
          const step = Math.max(1, Math.floor(routePoints.length / 10)); // 총 점의 약 10%만 표시
          for (let i = step; i < routePoints.length - step; i += step) {
            // 다음 지점과의 각도 계산
            const nextPoint = routePoints[i + 1];
            const angle = Math.atan2(nextPoint.lng - routePoints[i].lng, nextPoint.lat - routePoints[i].lat) * 180 / Math.PI;
            
            const marker = new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(routePoints[i].lat, routePoints[i].lng),
              map: mapInstance.current,
              icon: {
                content: `<div style="transform: rotate(${angle}deg);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#2196F3">
                    <path d="M12 2L2 12h7v10h6V12h7z" />
                  </svg>
                </div>`,
                size: new window.naver.maps.Size(12, 12),
                anchor: new window.naver.maps.Point(6, 6),
              },
            });
            markers.current.push(marker);
          }
        } else {
          // 단일 위치 마커 추가
          const marker = new window.naver.maps.Marker({
            position: center,
            map: mapInstance.current,
            title: '현재 위치',
            icon: {
              content: '<div style="background-color:#4B70FD; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;"><div style="width:8px; height:8px; border-radius:50%; background-color:white;"></div></div>',
              anchor: new window.naver.maps.Point(12, 12)
            }
          });
          markers.current.push(marker);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('NaverMap: 지도 초기화 오류:', err);
        if (err instanceof Error && err.message.includes('authentication')) {
          setError('인증 오류: 현재 도메인이 Naver Developers Console에 등록되지 않았습니다. Naver Developers Console에서 웹 서비스 URL에 http://localhost:3000을 추가해주세요.');
        } else {
          setError(`지도 초기화 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
        }
      }
    };
    
    if (isMapLoaded && mapContainerRef.current) {
      initializeMap();
    }
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, zoom, routePoints, isMapLoaded]);
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center max-w-md p-4">
          <p className="text-red-500 mb-2 font-semibold">⚠️ 네이버 지도 오류</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-left mb-4">
            <p className="font-medium text-sm mb-1">해결 방법:</p>
            <ol className="text-xs text-gray-700 dark:text-gray-300 list-decimal pl-4 space-y-2">
              <li><a href="https://console.naver.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">네이버 개발자 센터</a>에 로그인합니다.</li>
              <li>애플리케이션 &gt; 내 애플리케이션에서 해당 앱을 선택합니다.</li>
              <li>앱 설정 &gt; 웹 서비스 URL에 <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">http://localhost:3000</code>를 추가합니다.</li>
              <li>Client ID가 올바른지 확인합니다.</li>
              <li>변경사항을 저장하고 페이지를 새로고침합니다.</li>
            </ol>
          </div>
          
          <div className="flex space-x-2 justify-center">
            <button 
              onClick={() => window.open('https://console.naver.com/', '_blank')}
              className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              네이버 개발자 센터 열기
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      {isLoading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">지도 정보를 불러오는 중...</p>
          </div>
        </div>
      ) : (
        <div className="relative" style={{ height }}>
          <div
            ref={mapContainerRef}
            style={{
              width: width,
              height: '100%',
              backgroundColor: '#F5F5F5', // 지도 로딩 전 배경색
            }}
            className="rounded overflow-hidden"
            data-testid="naver-map-container"
          />
          
          {/* 위치 정보 (경로가 있고 showRouteInfo가 true인 경우에만 표시) */}
          {routePoints.length > 0 && showRouteInfo && (
            <>
              <div className="absolute bottom-8 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">출발지</p>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>위도: {routePoints[0]?.lat.toFixed(6)}</p>
                      <p>경도: {routePoints[0]?.lng.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">도착지</p>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>위도: {routePoints[routePoints.length - 1]?.lat.toFixed(6)}</p>
                      <p>경도: {routePoints[routePoints.length - 1]?.lng.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* 디버그 도구 */}
          {(debug || error) && (
            <button
              onClick={() => setShowDebugModal(true)}
              className="absolute bottom-2 right-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full hover:bg-gray-700/70 transition-colors"
            >
              디버그 정보
            </button>
          )}
        </div>
      )}
      
      <DebugModal 
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
      />
    </div>
  );
} 