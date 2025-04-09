import NaverMap from './NaverMap';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface RouteMapProps {
  routePoints: RoutePoint[];
  isLoading?: boolean;
}

/**
 * 경로 표시에 특화된 지도 컴포넌트입니다.
 * 기존 코드와의 호환성을 위해 유지합니다.
 */
export default function RouteMap({ routePoints, isLoading }: RouteMapProps) {
  return (
    <NaverMap
      routePoints={routePoints}
      isLoading={isLoading}
      showRouteInfo={true}
      height="400px" 
    />
  );
} 