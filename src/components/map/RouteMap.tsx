import { useEffect, useRef, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Point {
  lat: number;
  lng: number;
}

interface RouteMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  routePoints?: Point[];
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

export default function RouteMap({ latitude, longitude, zoom, routePoints, isLoading }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const polylines = useRef<any[]>([]);
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
      const mapOptions = {
        center: new window.naver.maps.LatLng(latitude, longitude),
        zoom: zoom,
      };
      mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    }
  }, [isMapLoaded]);

  useEffect(() => {
    if (mapInstance.current && isMapLoaded) {
      // 기존 마커 제거
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];

      // 기존 경로 제거
      polylines.current.forEach(polyline => polyline.setMap(null));
      polylines.current = [];

      if (routePoints && routePoints.length > 0) {
        // 시작점 마커 추가
        const startMarker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(routePoints[0].lat, routePoints[0].lng),
          map: mapInstance.current,
          icon: {
            content: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%;"></div>',
            size: new window.naver.maps.Size(20, 20),
            anchor: new window.naver.maps.Point(10, 10),
          },
        });
        markers.current.push(startMarker);

        // 도착점 마커 추가
        const endMarker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            routePoints[routePoints.length - 1].lat,
            routePoints[routePoints.length - 1].lng
          ),
          map: mapInstance.current,
          icon: {
            content: '<div style="background-color: #F44336; width: 20px; height: 20px; border-radius: 50%;"></div>',
            size: new window.naver.maps.Size(20, 20),
            anchor: new window.naver.maps.Point(10, 10),
          },
        });
        markers.current.push(endMarker);

        // 중간 지점 마커 추가
        for (let i = 1; i < routePoints.length - 1; i++) {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(routePoints[i].lat, routePoints[i].lng),
            map: mapInstance.current,
            icon: {
              content: '<div style="background-color: #2196F3; width: 15px; height: 15px; border-radius: 50%;"></div>',
              size: new window.naver.maps.Size(15, 15),
              anchor: new window.naver.maps.Point(7.5, 7.5),
            },
          });
          markers.current.push(marker);
        }

        // 경로 그리기
        const path = routePoints.map(point => 
          new window.naver.maps.LatLng(point.lat, point.lng)
        );

        const polyline = new window.naver.maps.Polyline({
          path: path,
          strokeColor: '#FF0000',
          strokeWeight: 3,
          map: mapInstance.current
        });
        polylines.current.push(polyline);
      }

      // 지도 중심과 줌 레벨 업데이트
      mapInstance.current.setCenter(new window.naver.maps.LatLng(latitude, longitude));
      mapInstance.current.setZoom(zoom);
    }
  }, [latitude, longitude, zoom, routePoints, isMapLoaded]);

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
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <p className="text-sm font-medium">현재 위치</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                위도: {routePoints[0].lat.toFixed(6)}<br />
                경도: {routePoints[0].lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
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