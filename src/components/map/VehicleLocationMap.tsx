import NaverMap from './NaverMap';

interface VehicleLocationMapProps {
  latitude: number;
  longitude: number;
  height?: string;
  isLoading?: boolean;
  zoom?: number;
  showLocationInfo?: boolean;
}

/**
 * 차량 위치 표시에 특화된 지도 컴포넌트입니다.
 * NaverMap을 래핑하여 차량 위치 표시 기능을 제공합니다.
 */
export default function VehicleLocationMap({ 
  latitude, 
  longitude, 
  height = '400px',
  isLoading = false,
  zoom = 15,
  showLocationInfo = true 
}: VehicleLocationMapProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-sm text-gray-500">위치 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <NaverMap
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        height={height}
        debug={false}
      />
      
      {/* 위치 정보 (showLocationInfo가 true인 경우에만 표시) */}
      {showLocationInfo && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <p className="text-sm font-medium">현재 위치</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            위도: {latitude.toFixed(6)}<br />
            경도: {longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
} 