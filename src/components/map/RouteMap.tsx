import { useEffect, useRef, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
}

interface RouteMapProps {
  routePoints: RoutePoint[];
  isLoading?: boolean;
}

declare global {
  interface Window {
    naver: any;
  }
}

// Naver Maps API 스크립트 로드 함수
const loadNaverScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있는 경우
    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    // 이미 스크립트 태그가 존재하는 경우
    const existingScript = document.getElementById('naver-map-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    // 새 스크립트 태그 생성
    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=xefwc1thif`;

    script.onload = () => {
      if (!window.naver || !window.naver.maps) {
        reject(new Error('Naver maps API objects not available after script load'));
        return;
      }
      resolve();
    };

    script.onerror = (e) => reject(e);

    document.head.appendChild(script);
  });
};

export default function RouteMap({ routePoints, isLoading }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
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

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current && isMapLoaded) {
      // 경로 데이터가 있는 경우 첫 번째 지점을 중심으로 설정
      const initialCenter = routePoints && routePoints.length > 0
        ? new window.naver.maps.LatLng(routePoints[0].lat, routePoints[0].lng)
        : new window.naver.maps.LatLng(37.5666805, 126.9784147);

      const mapOptions = {
        center: initialCenter,
        zoom: 15,
      };
      mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);

      // 경로 데이터가 있는 경우 지도 범위 조정
      if (routePoints && routePoints.length > 0) {
        const bounds = new window.naver.maps.LatLngBounds();
        routePoints.forEach(point => {
          bounds.extend(new window.naver.maps.LatLng(point.lat, point.lng));
        });
        mapInstance.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [isMapLoaded, routePoints]);

  useEffect(() => {
    if (mapInstance.current && isMapLoaded && routePoints && routePoints.length > 0) {
      // 기존 마커 제거
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];

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
    }
  }, [routePoints, isMapLoaded]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted">
        <p className="text-red-500">지도를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px] bg-muted">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-sm text-muted-foreground">위치 정보를 불러오는 중...</p>
          </div>
        </div>
      ) : (
        <div className="h-[400px] relative">
          <div
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
            className="rounded overflow-hidden"
          />

          {routePoints && routePoints.length > 0 ? (
            <>
              {/* 위치 정보 */}
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
          ) : (
            <div className="absolute bottom-8 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <p className="text-sm font-medium">위치 정보 없음</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                최근 위치 정보가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 