import { useEffect, useRef, useState } from 'react';

interface NaverMapProps {
  latitude?: number;
  longitude?: number;
  height?: string;
  width?: string;
  zoom?: number;
  debug?: boolean;
}

// 환경 정보 디버깅 컴포넌트
const DebugModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'xefwc1thif';
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
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'xefwc1thif';
    
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
    
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=xefwc1thif`;
    
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
}: NaverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isRefReady, setIsRefReady] = useState(false);
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
  
  // 지도 초기화 효과
  useEffect(() => {
    let isMounted = true;
    
    // 지도 초기화 함수
    const initializeMap = async () => {
      addDebugInfo(`NaverMap: 컴포넌트 마운트됨 (${new Date().toISOString()})`);
      addDebugInfo(`NaverMap: 위도=${latitude}, 경도=${longitude}`);
      
      // 환경 디버깅 정보
      if (debug) {
        addDebugInfo(`NaverMap: 현재 도메인 = ${window.location.hostname}`);
        addDebugInfo(`NaverMap: 현재 포트 = ${window.location.port}`);
        addDebugInfo(`NaverMap: 현재 프로토콜 = ${window.location.protocol}`);
        addDebugInfo(`NaverMap: 현재 전체 URL = ${window.location.href}`);
      }
      
      // DOM 참조 확인
      if (!mapContainerRef.current) {
        addDebugInfo('NaverMap: mapContainerRef.current가 없음 (DOM 엘리먼트를 찾을 수 없음)');
        addDebugInfo(`NaverMap: 컨테이너 HTML: ${mapContainerRef.current}`);
        return;
      }
      
      // 컨테이너 크기 확인
      const containerWidth = mapContainerRef.current.clientWidth;
      const containerHeight = mapContainerRef.current.clientHeight;
      
      addDebugInfo(`NaverMap: 지도 컨테이너 크기 = ${containerWidth}x${containerHeight}px`);
      
      // 컨테이너 크기가 0인 경우 경고
      if (containerWidth === 0 || containerHeight === 0) {
        addDebugInfo('NaverMap: 지도 컨테이너의 크기가 0입니다. 스타일 문제가 있을 수 있습니다.');
      }
      
      try {
        // 스크립트 로드
        addDebugInfo('NaverMap: 스크립트 로드 시도');
        await loadNaverScript();
        
        // 컴포넌트가 언마운트된 경우 초기화 중단
        if (!isMounted) {
          addDebugInfo('NaverMap: 컴포넌트가 언마운트됨, 초기화 중단');
          return;
        }
        
        // Naver 객체 확인
        if (!window.naver) {
          addDebugInfo('NaverMap: window.naver 객체가 없음');
          return;
        }
        
        // Naver Maps 객체 확인
        if (!window.naver.maps) {
          addDebugInfo('NaverMap: window.naver.maps 객체가 없음');
          return;
        }
        
        // DOM 참조 재확인
        if (!mapContainerRef.current) {
          addDebugInfo('NaverMap: 스크립트 로드 완료 후 mapContainerRef.current가 없음');
          return;
        }
        
        try {
          // 지도 초기화
          addDebugInfo('NaverMap: 지도 초기화 시작');
          
          // LatLng 객체 생성
          addDebugInfo('NaverMap: 네이버 LatLng 객체 생성 시도');
          const latLng = new window.naver.maps.LatLng(latitude, longitude);
          addDebugInfo('NaverMap: LatLng 객체 생성 성공: ' + latLng);
          
          // 지도 옵션 설정
          const mapOptions = {
            center: latLng,
            zoom: zoom,
            mapTypeId: window.naver.maps.MapTypeId.NORMAL
          };
          
          // 지도 객체 생성
          addDebugInfo('NaverMap: 지도 객체 생성 시도');
          addDebugInfo(`NaverMap: 지도 DOM 확인 - ${mapContainerRef.current ? 'DOM 존재' : 'DOM 없음'}`);
          
          const map = new window.naver.maps.Map(mapContainerRef.current, mapOptions);
          addDebugInfo('NaverMap: 지도 객체 생성 성공');
          
          // 마커 추가
          addDebugInfo('NaverMap: 마커 생성 시도');
          new window.naver.maps.Marker({
            position: latLng,
            map: map,
            title: '현재 위치',
            icon: {
              content: '<div style="background-color:#4B70FD; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;"><div style="width:8px; height:8px; border-radius:50%; background-color:white;"></div></div>',
              anchor: new window.naver.maps.Point(12, 12)
            }
          });
          
          addDebugInfo('NaverMap: 마커 생성 성공');
          addDebugInfo('NaverMap: 지도 초기화 완료');
        } catch (innerError) {
          addDebugInfo(`NaverMap: 지도 생성 중 오류: ${innerError instanceof Error ? innerError.message : '알 수 없는 오류'}`);
          throw innerError;
        }
      } catch (err) {
        // 이미 컴포넌트가 언마운트된 경우 오류를 표시하지 않음
        if (!isMounted) return;
        
        console.error('NaverMap: 지도 초기화 오류:', err);
        addDebugInfo(`NaverMap: 초기화 중 오류 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
        if (err instanceof Error && err.message.includes('authentication')) {
          setError('인증 오류: 현재 도메인이 Naver Developers Console에 등록되지 않았습니다. Naver Developers Console에서 웹 서비스 URL에 http://localhost:3000을 추가해주세요.');
        } else {
          setError(`지도 초기화 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
        }
      }
    };
    
    // isRefReady가 true일 때만 초기화 진행
    if (isRefReady) {
      initializeMap();
    }
    
    // 정리 함수
    return () => {
      isMounted = false;
      addDebugInfo('NaverMap: 컴포넌트 언마운트');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, zoom, debug, isRefReady]);
  
  return (
    <div className="relative">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/90 dark:bg-gray-800/90 p-4 rounded overflow-hidden">
          <div className="text-center max-w-md">
            <p className="text-red-500 mb-2 font-semibold">⚠️ 네이버 지도 오류</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-left mb-4">
              <p className="font-medium text-sm mb-1">해결 방법:</p>
              <ol className="text-xs text-gray-700 dark:text-gray-300 list-decimal pl-4 space-y-2">
                <li><a href="https://console.naver.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">네이버 개발자 센터</a>에 로그인합니다.</li>
                <li>애플리케이션 &gt; 내 애플리케이션에서 해당 앱을 선택합니다.</li>
                <li>앱 설정 &gt; 웹 서비스 URL에 <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">http://localhost:3000</code>를 추가합니다.</li>
                <li>로컬 환경 접속시 Client ID가 <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'xefwc1thif'}</code> 인지 확인합니다.</li>
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
      )}
      <div
        ref={mapContainerRef}
        style={{
          width: width,
          height: height,
          backgroundColor: '#F5F5F5', // 지도 로딩 전 배경색
        }}
        className="rounded overflow-hidden"
        data-testid="naver-map-container"
      />
      
      {/* 디버그 도구 */}
      {(debug || error) && (
        <button
          onClick={() => setShowDebugModal(true)}
          className="absolute bottom-2 right-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full hover:bg-gray-700/70 transition-colors"
        >
          디버그 정보
        </button>
      )}
      
      <DebugModal 
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
      />
    </div>
  );
} 