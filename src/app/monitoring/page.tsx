'use client';

import { useEffect, useState, useRef } from 'react';
import CarMap from '@/components/map/CarMap';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  MinusIcon, 
  PlusIcon, 
  MapPinIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TruckIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/common/PageHeader';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface CarLocation {
  carId: string;
  locations: Location[];
}

interface CurrentCarPosition {
  carId: string;
  currentLocation: Location;
  currentIndex: number;
  color: string;
}

const CAR_COLORS = [
  '#FF5252', '#4CAF50', '#2196F3', '#FF9800', 
  '#9C27B0', '#00BCD4', '#FFEB3B', '#795548',
  '#607D8B', '#E91E63'
];

interface VehicleSidebarProps {
  vehicles: CurrentCarPosition[];
  selectedCars: string[];
  toggleCarSelection: (carId: string) => void;
  currentTheme: any;
  carLocations: CarLocation[];
  currentPositions: CurrentCarPosition[];
}

function VehicleSidebar({ 
  vehicles, 
  selectedCars, 
  toggleCarSelection, 
  currentTheme,
  carLocations,
  currentPositions
}: VehicleSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.carId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleVehicleClick = (vehicle: CurrentCarPosition) => {
    setSelectedVehicle(vehicle.carId);
    toggleCarSelection(vehicle.carId);
  };

  const selectedVehicleData = selectedVehicle ? 
    currentPositions.find(pos => pos.carId === selectedVehicle) : null;
  
  const selectedVehicleFullData = selectedVehicle ?
    carLocations.find(car => car.carId === selectedVehicle) : null;
  
  return (
    <div className={`w-80 ${currentTheme.cardBg} ${currentTheme.border} rounded-lg shadow-sm overflow-hidden h-[calc(100vh-160px)] flex flex-col`}>

      <div className={`p-4 ${currentTheme.border} border-b`}>
        <div className="flex items-center gap-1.5 mb-3">
          <TruckIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
          <h2 className={`text-lg font-bold ${currentTheme.headingText}`}>
            차량 목록
            <span className={`ml-2 text-sm font-normal ${currentTheme.mutedText}`}>
              {vehicles.length}대
            </span>
          </h2>
        </div>
        
        <div className={`relative`}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className={`h-4 w-4 ${currentTheme.mutedText}`} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="차량 검색..."
            className={`pl-10 pr-4 py-2 w-full ${currentTheme.inputBg} ${currentTheme.border} rounded-md text-sm ${currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2">
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredVehicles.map(vehicle => (
              <div 
                key={vehicle.carId}
                onClick={() => handleVehicleClick(vehicle)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedVehicle === vehicle.carId
                    ? `${currentTheme.activeBg} ${currentTheme.activeText}`
                    : selectedCars.includes(vehicle.carId)
                      ? `${currentTheme.selectedBg} ${currentTheme.textColor}`
                      : `${currentTheme.hoverBg} ${currentTheme.textColor}`
                } hover:${currentTheme.hoverBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: vehicle.color }}
                    ></div>
                    <span className="font-medium">{vehicle.carId}</span>
                  </div>
                  <CheckCircleIcon className={`h-5 w-5 ${
                    selectedCars.includes(vehicle.carId) 
                      ? currentTheme.activeText 
                      : 'opacity-0'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center h-full ${currentTheme.mutedText}`}>
            <ExclamationCircleIcon className="h-8 w-8 mb-2" />
            <p>검색 결과가 없습니다</p>
          </div>
        )}
      </div>
      
      {selectedVehicleData && (
        <div className={`p-4 ${currentTheme.border} border-t`}>
          <div className="mb-2">
            <h3 className={`text-md font-bold ${currentTheme.headingText}`}>
              {selectedVehicleData.carId} 상세 정보
            </h3>
          </div>
          
          <div className={`${currentTheme.border} border rounded-md p-3 mb-3`}>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <div className={`${currentTheme.mutedText} mb-1`}>현재 위치</div>
                <div className={`${currentTheme.textColor} grid grid-cols-2 gap-1`}>
                  <div>
                    <span className="text-xs text-gray-500">위도: </span>
                    {selectedVehicleData.currentLocation.latitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">경도: </span>
                    {selectedVehicleData.currentLocation.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className={`${currentTheme.mutedText} mb-1`}>시간</div>
                <div className={`${currentTheme.textColor}`}>
                  {new Date(selectedVehicleData.currentLocation.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`${currentTheme.mutedText}`}>이동 경로</span>
            <div className="flex items-center gap-1">
              <ChartBarIcon className={`h-3.5 w-3.5 ${currentTheme.mutedText}`} />
              <span>{selectedVehicleData.currentIndex + 1} / {selectedVehicleFullData?.locations.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonitoringPage() {
  const { currentTheme } = useTheme(); 
  const [wsConnected, setWsConnected] = useState(false);
  const [carLocations, setCarLocations] = useState<CarLocation[]>([]);
  const [currentPositions, setCurrentPositions] = useState<CurrentCarPosition[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [companyId, setCompanyId] = useState<string>('2');
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [showAllCars, setShowAllCars] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [dataReceived, setDataReceived] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [mapSettings, setMapSettings] = useState({
    latitude: 37.5666805,
    longitude: 126.9784147,
    zoom: 13,
    followVehicle: false, 
  });


  const [lastDragTime, setLastDragTime] = useState<number>(0);
  const dragCooldownMs = 5000; 

  const [customAreas, setCustomAreas] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    zoom: number;
  }[]>([
    { name: '서울', latitude: 37.5666805, longitude: 126.9784147, zoom: 11 },
    { name: '부산', latitude: 35.1796, longitude: 129.0756, zoom: 11 },
    { name: '대전', latitude: 36.3504, longitude: 127.3845, zoom: 11 }
  ]);

  const handleMapDrag = (center: {lat: number, lng: number}, zoom: number) => {

    setLastDragTime(Date.now());
    

    setMapSettings(prev => ({
      ...prev,
      latitude: center.lat,
      longitude: center.lng,
      zoom: zoom
    }));
  };

  const changeZoom = (delta: number) => {
    setMapSettings(prev => ({
      ...prev,
      zoom: Math.max(1, Math.min(20, prev.zoom + delta))
    }));
  };

  const toggleVehicleFollow = () => {
    setMapSettings(prev => ({
      ...prev,
      followVehicle: !prev.followVehicle
    }));
  };

  const assignCarColors = (cars: CarLocation[]): CurrentCarPosition[] => {
    return cars.map((car, index) => ({
      carId: car.carId,
      currentLocation: car.locations[0],
      currentIndex: 0,
      color: CAR_COLORS[index % CAR_COLORS.length]
    }));
  };

  useEffect(() => {
    if (carLocations.length > 0) {
      console.log('애니메이션 시작: 차량 데이터 업데이트됨', {
        차량수: carLocations.length,
        첫차량ID: carLocations[0]?.carId
      });

      if (animationRef.current) {
        clearInterval(animationRef.current);
      }

      const initialPositions = assignCarColors(carLocations);
      setCurrentPositions(initialPositions);
      console.log('🏁 초기 위치 설정 완료', initialPositions);

      animationRef.current = setInterval(() => {
        setCurrentPositions(prev => {
          const newPositions = prev.map(position => {
            const carData = carLocations.find(car => car.carId === position.carId);
            if (!carData) return position;

            const nextIndex = (position.currentIndex + 1) % carData.locations.length;
            const nextLocation = carData.locations[nextIndex];
            
            return {
              ...position,
              currentLocation: nextLocation,
              currentIndex: nextIndex
            };
          });
          return newPositions;
        });
      }, 1000);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [carLocations]);

  // 연결 및 데이터 수신 처리
  useEffect(() => {
    connectWebSocket();
    
    // 테스트 데이터 생성은 제거 (직접 입력 기능으로 대체)
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // WebSocket 연결 상태가 변경될 때 자동 구독
  useEffect(() => {
    if (wsConnected && companyId) {
      console.log('WebSocket 연결됨, 자동 구독 시도:', companyId);
      handleSubscribe();
    }
  }, [wsConnected]);

  const connectWebSocket = () => {
    try {
      const wsUrl = 'ws://localhost:8080/ws';
      
      console.log(`WebSocket 연결 시도: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 연결됨', new Date().toLocaleString());
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          console.log('데이터 수신:', new Date().toLocaleString());
          
          const data = JSON.parse(event.data);
          console.log('파싱된 데이터:', data);
          
          if (Array.isArray(data)) {
            const isValidData = data.every(item => 
              item && typeof item === 'object' && 
              item.carId && 
              Array.isArray(item.locations) &&
              item.locations.length > 0 &&
              item.locations.every((loc: Location) => 
                loc && typeof loc === 'object' &&
                typeof loc.latitude === 'number' &&
                typeof loc.longitude === 'number' &&
                typeof loc.timestamp === 'string'
              )
            );
            
            if (isValidData) {
              processReceivedData(data);
            } else {
              console.error('데이터 형식이 올바르지 않습니다:', data);
              setError('데이터 형식이 올바르지 않습니다');
            }
          } else {
            console.error('데이터가 배열이 아닙니다:', data);
            setError('데이터가 배열이 아닙니다');
          }
        } catch (error) {
          console.error('메시지 파싱 에러:', error);
          setError(`메시지 파싱 에러: ${error}`);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log('WebSocket 연결 종료', new Date().toLocaleString());
        setTimeout(connectWebSocket, 5000); 
      };

      ws.onerror = (error) => {
        console.error('WebSocket 에러:', error);
        setError(`WebSocket 에러: ${error}`);
      };
    } catch (error) {
      console.error('WebSocket 연결 시도 중 예외 발생:', error);
      setError(`WebSocket 연결 시도 중 예외 발생: ${error}`);
    }
  };

  const processReceivedData = (data: CarLocation[]) => {
    try {
      console.log('📊 데이터 처리 중...', {
        차량수: data.length,
        첫차량: data[0]?.carId,
        데이터포인트: data[0]?.locations.length
      });
      
      setCarLocations(data);
      setDataReceived(true);
      setLastUpdateTime(new Date().toLocaleString());
      setError(null);
    } catch (error) {
      console.error('데이터 처리 중 오류:', error);
      setError(`데이터 처리 중 오류: ${error}`);
    }
  };

  const toggleCarSelection = (carId: string) => {
    setSelectedCars(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else {
        return [...prev, carId];
      }
    });
  };

  const visibleMarkers = currentPositions
    .filter(pos => showAllCars || selectedCars.includes(pos.carId))
    .map(pos => ({
      lat: pos.currentLocation.latitude,
      lng: pos.currentLocation.longitude,
      label: pos.carId,
      color: pos.color,
      isSelected: selectedCars.includes(pos.carId)
    }));
    
  useEffect(() => {
    if (!mapSettings.followVehicle) {
      return;
    }

    const timeSinceDrag = Date.now() - lastDragTime;
    if (timeSinceDrag < dragCooldownMs) {
      return;
    }

    if (selectedCars.length === 1) {
      const selectedCar = currentPositions.find(pos => pos.carId === selectedCars[0]);
      if (selectedCar) {
        setMapSettings(prev => ({
          ...prev,
          latitude: selectedCar.currentLocation.latitude,
          longitude: selectedCar.currentLocation.longitude
        }));
      }
    }
  }, [currentPositions, selectedCars, mapSettings.followVehicle, lastDragTime]);

  const handleSubscribe = () => {
    if (wsRef.current && companyId && wsConnected) {
      console.log('구독 요청 전송:', companyId);
      
      const subscribeMsg = JSON.stringify({
        type: 'subscribe',
        companyId: companyId
      });
      
      wsRef.current.send(subscribeMsg);
    } else {
      console.warn('WebSocket이 연결되지 않았거나 회사 ID가 없습니다');
      setError('WebSocket이 연결되지 않았거나 회사 ID가 없습니다');
    }
  };

  const handleRefresh = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  return (
    <div className={`${currentTheme.background} min-h-screen`}>
      <div className={`px-6 py-4`}>
        <div className="container mx-auto">
          <PageHeader 
            title="실시간 차량 관제" 
            description="차량의 위치와 이동 경로를 실시간으로 모니터링합니다." 
          />
          
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 ${
                wsConnected 
                  ? `${currentTheme.successBg} ${currentTheme.successText}`
                  : `${currentTheme.dangerBg} ${currentTheme.dangerText}`
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="font-medium">
                  {wsConnected ? '연결됨' : '연결 끊김'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleRefresh}
                className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 cursor-pointer ${currentTheme.primaryButton} ${currentTheme.primaryButtonText} hover:opacity-90`}
              >
                <ArrowPathIcon className="h-4 w-4" />
                새로고침
              </button>
            </div>
          </div>

          {error && (
            <div className={`mb-1 p-4 ${currentTheme.dangerBg} ${currentTheme.dangerText} ${currentTheme.border} rounded-lg`}>
              <h3 className="font-bold mb-2">오류 발생</h3>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>


      <div className="container mx-auto px-6 pb-4">
        <div className="flex gap-6">
          <VehicleSidebar 
            vehicles={currentPositions}
            selectedCars={selectedCars}
            toggleCarSelection={toggleCarSelection}
            currentTheme={currentTheme}
            carLocations={carLocations}
            currentPositions={currentPositions}
          />
          
          <div className={`flex-1 ${currentTheme.cardBg} ${currentTheme.border} rounded-lg shadow-sm overflow-hidden`}>

            <div className={`flex justify-between items-center px-4 py-3 ${currentTheme.border} border-b`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center ${currentTheme.cardBg} rounded-md shadow-sm ${currentTheme.border} p-1`}>
                  <button 
                    onClick={() => changeZoom(-1)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md ${currentTheme.hoverBg} transition-colors`}
                    title="축소"
                  >
                    <MinusIcon className={`h-4 w-4 ${currentTheme.iconColor}`} />
                  </button>
                  <span className={`text-xs font-medium px-2 ${currentTheme.textColor}`}>{mapSettings.zoom}</span>
                  <button 
                    onClick={() => changeZoom(1)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md ${currentTheme.hoverBg} transition-colors`}
                    title="확대"
                  >
                    <PlusIcon className={`h-4 w-4 ${currentTheme.iconColor}`} />
                  </button>
                </div>
                
                <div className={`flex items-center ${currentTheme.cardBg} rounded-md shadow-sm ${currentTheme.border}`}>
                  <button
                    onClick={() => setShowAllCars(true)}
                    className={`px-3 py-1.5 rounded-l-md text-xs font-medium transition-colors ${
                      showAllCars 
                        ? `${currentTheme.activeBg} ${currentTheme.activeText}` 
                        : `${currentTheme.textColor} ${currentTheme.hoverBg}`
                    }`}
                  >
                    전체 차량
                  </button>
                  <button
                    onClick={() => setShowAllCars(false)}
                    className={`px-3 py-1.5 rounded-r-md text-xs font-medium transition-colors ${
                      !showAllCars 
                        ? `${currentTheme.activeBg} ${currentTheme.activeText}` 
                        : `${currentTheme.textColor} ${currentTheme.hoverBg}`
                    }`}
                  >
                    선택 차량만
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  onClick={toggleVehicleFollow}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    selectedCars.length !== 1 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 opacity-60' 
                      : mapSettings.followVehicle 
                        ? `${currentTheme.activeBg} ${currentTheme.activeText} cursor-pointer` 
                        : `${currentTheme.cardBg} ${currentTheme.textColor} ${currentTheme.border} cursor-pointer`
                  }`}
                  disabled={selectedCars.length !== 1}
                >
                  <MapPinIcon className={`h-4 w-4 ${selectedCars.length !== 1 ? 'opacity-60' : ''}`} />
                  <span className="text-sm font-medium">
                    {mapSettings.followVehicle ? "추적 중지" : "차량 추적"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <CarMap
                latitude={mapSettings.latitude}
                longitude={mapSettings.longitude}
                height="calc(100vh - 230px)" 
                width="100%"
                zoom={mapSettings.zoom}
                markers={visibleMarkers}
                onMapDrag={handleMapDrag}
                allowDrag={true}
              />
            </div>
  
            <div className={`px-4 py-2 text-xs ${currentTheme.mutedText} flex justify-between items-center border-t ${currentTheme.border}`}>
              <div>
                위도: {mapSettings.latitude.toFixed(6)}, 경도: {mapSettings.longitude.toFixed(6)}
              </div>
              <div>
                표시 차량: {visibleMarkers.length}대
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 