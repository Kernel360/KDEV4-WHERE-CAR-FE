import { useEffect, useRef, useState } from 'react';
import { NAVER_CLIENT_ID } from '@/lib/env';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  isSelected?: boolean;
  vehicleId?: string;
  onClick?: (vehicleId: string) => void;
}

interface NaverMapProps {
  // 기본 지도 속성
  latitude?: number;
  longitude?: number;
  height?: string;
  width?: string;
  zoom?: number;
  
  // 마커 관련 속성
  markers?: MarkerData[];
  
  // 단순화된 속성들
  allowDrag?: boolean; // 드래그 허용 (기본값: true)
  onMapDrag?: (center: {lat: number, lng: number}, zoom: number) => void; // 지도 드래그 콜백
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
      existingScript.addEventListener('load', () => {
        resolve();
      });
      
      existingScript.addEventListener('error', (e) => {
        reject(e);
      });
      
      return;
    }
    
    // 새 스크립트 태그 생성
    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.type = 'text/javascript';
    
    // 환경변수에서 CLIENT ID 가져오기
    const clientId = NAVER_CLIENT_ID || 'xefwc1thif';
    
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    
    script.onload = () => {
      if (!window.naver || !window.naver.maps) {
        reject(new Error('Naver maps API objects not available after script load'));
        return;
      }
      resolve();
    };
    
    script.onerror = (e) => {
      reject(e);
    };
    
    document.head.appendChild(script);
  });
};

export default function CarMap({
  latitude = 37.5666805,
  longitude = 126.9784147,
  height = '400px',
  width = '100%',
  zoom = 15,
  markers = [],
  allowDrag = true,
  onMapDrag
}: NaverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isRefReady, setIsRefReady] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // DOM ref가 준비되었는지 확인하고 설정하는 효과
  useEffect(() => {
    if (mapContainerRef.current) {
      setIsRefReady(true);
    }
  }, []);
  
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
      // DOM 참조 확인
      if (!mapContainerRef.current) {
        return;
      }
      
      try {
        // 중심 좌표 설정
        const center = new window.naver.maps.LatLng(latitude, longitude);
        
        // 지도 객체 생성
        const mapOptions = {
          center: center,
          zoom: zoom,
          minZoom: 6,
          maxZoom: 20,
          zoomControl: false,
          mapTypeControl: false,
          draggable: allowDrag // 드래그 허용 여부
        };
        
        if (!mapInstance.current) {
          mapInstance.current = new window.naver.maps.Map(mapContainerRef.current, mapOptions);
        } else {
          // 이미 지도가 생성된 경우 중심 좌표와 줌 레벨만 업데이트
          mapInstance.current.setCenter(center);
          mapInstance.current.setZoom(zoom);
        }
        
        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 지도 이벤트 리스너 설정
        if (onMapDrag) {
          // 드래그 종료 시 현재 위치 전달
          window.naver.maps.Event.addListener(mapInstance.current, 'dragend', () => {
            const center = mapInstance.current.getCenter();
            onMapDrag({
              lat: center.lat(),
              lng: center.lng()
            }, mapInstance.current.getZoom());
          });

          // 줌 변경 시 현재 위치 전달
          window.naver.maps.Event.addListener(mapInstance.current, 'zoom_changed', () => {
            const center = mapInstance.current.getCenter();
            onMapDrag({
              lat: center.lat(), 
              lng: center.lng()
            }, mapInstance.current.getZoom());
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setError('지도를 초기화하는데 실패했습니다.');
      }
    };
    
    if (isMapLoaded && mapContainerRef.current) {
      initializeMap();
    }
    
    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, zoom, isMapLoaded, allowDrag, onMapDrag]);
  
  // 마커 업데이트 효과
  useEffect(() => {
    if (mapInstance.current && window.naver && markers.length > 0) {
      // 기존 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      
      // 새 마커 생성
      const newMarkers = markers.map(markerData => {
        // 마커 스타일 설정
        const markerColor = markerData.color || '#3B82F6';
        const borderColor = markerData.isSelected ? '#000000' : '#FFFFFF';
        const borderWidth = markerData.isSelected ? 3 : 2;
        
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstance.current,
          title: markerData.label,
          icon: {
            content: `
              <div style="
                background-color: ${markerColor};
                color: #FFFFFF;
                padding: 6px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                border: ${borderWidth}px solid ${borderColor};
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                white-space: nowrap;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                ${markerData.label || ''}
              </div>
            `,
            anchor: new window.naver.maps.Point(15, 15)
          }
        });

        // 마커 클릭 이벤트 추가
        if (markerData.vehicleId && markerData.onClick) {
          window.naver.maps.Event.addListener(marker, 'click', () => {
            markerData.onClick!(markerData.vehicleId!);
          });
        }
        
        return marker;
      });

      markersRef.current = newMarkers;
    } else if (markers.length === 0) {
      // 모든 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
  }, [markers]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center max-w-md p-4">
          <p className="text-red-500 mb-2 font-semibold">⚠️ 네이버 지도 오류</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <div className="relative" style={{ height }}>
        <div
          ref={mapContainerRef}
          style={{
            width: width,
            height: '100%',
            position: 'relative',
            cursor: allowDrag ? 'grab' : 'default'
          }}
          className="rounded overflow-hidden"
          data-testid="naver-map-container"
        />
      </div>
    </div>
  );
} 