import React, { useEffect, useRef } from 'react';
import kakao from 'kakao-maps-sdk';

const GpsMap: React.FC = () => {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);
  const startMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const endMarkerRef = useRef<kakao.maps.Marker | null>(null);

  useEffect(() => {
    if (gpsData && gpsData.data && gpsData.data.route && gpsData.data.route.length > 0) {
      console.log('GPS 데이터 로드됨:', gpsData.data.route.length, '개의 위치 포인트');
      
      // 중복 제거: 같은 타임스탬프의 위치 데이터는 한 번만 사용
      const uniquePoints = [];
      const seenTimestamps = new Set();
      
      for (const point of gpsData.data.route) {
        if (!seenTimestamps.has(point.timestamp)) {
          uniquePoints.push(point);
          seenTimestamps.add(point.timestamp);
        }
      }
      
      console.log('중복 제거 후 위치 포인트:', uniquePoints.length, '개');
      
      // 지도 경계 설정을 위한 좌표 범위 계산
      if (uniquePoints.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        
        // 경로 그리기
        const path = uniquePoints.map(point => {
          const latLng = new kakao.maps.LatLng(point.latitude, point.longitude);
          bounds.extend(latLng);
          return latLng;
        });
        
        const polyline = new kakao.maps.Polyline({
          path: path,
          strokeWeight: 5,
          strokeColor: '#FF0000',
          strokeOpacity: 0.7,
          strokeStyle: 'solid'
        });
        
        // 기존 경로 삭제
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }
        
        // 새 경로 설정
        polylineRef.current = polyline;
        polyline.setMap(mapRef.current);
        
        // 지도 범위 조정
        mapRef.current.setBounds(bounds);
        
        // 시작점과 끝점 마커 표시
        if (startMarkerRef.current) startMarkerRef.current.setMap(null);
        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        
        const startMarker = new kakao.maps.Marker({
          position: path[0],
          map: mapRef.current,
          title: '시작 위치'
        });
        
        const endMarker = new kakao.maps.Marker({
          position: path[path.length - 1],
          map: mapRef.current,
          title: '종료 위치'
        });
        
        startMarkerRef.current = startMarker;
        endMarkerRef.current = endMarker;
      }
    }
  }, [gpsData]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '300px' }} />
  );
};

export default GpsMap; 