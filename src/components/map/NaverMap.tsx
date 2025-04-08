import { useEffect, useRef } from 'react';

interface NaverMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function NaverMap({ latitude, longitude, zoom }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(latitude, longitude),
        zoom: zoom,
      };
      mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(new window.naver.maps.LatLng(latitude, longitude));
      mapInstance.current.setZoom(zoom);
    }
  }, [latitude, longitude, zoom]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
} 