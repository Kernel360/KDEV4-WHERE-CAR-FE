"use client";

import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { MagnifyingGlassIcon, TruckIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import VehicleDetailSlidePanel from "@/components/vehicles/VehicleDetailSlidePanel";
import VehicleAddModal from "@/components/vehicles/VehicleAddModal";
import { useVehicleStore, Vehicle } from "@/lib/vehicleStore";
import { useCarOverviewStore } from "@/lib/carOverviewStore";

export default function VehiclesPage() {
  const { currentTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(8); // 페이지당 항목 수를 상태로 관리
  
  const { 
    vehicles, 
    isLoading, 
    error, 
    selectedVehicle,
    fetchVehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    setSelectedVehicle 
  } = useVehicleStore();
  
  // 차량 개요 데이터 가져오기
  const { 
    data: carOverview, 
    isLoading: isOverviewLoading, 
    fetchOverview 
  } = useCarOverviewStore();
  
  // 차량 데이터 가져오기
  useEffect(() => {
    fetchVehicles(); // 모든 차량 데이터를 한 번에 가져옴
    fetchOverview();
  }, [fetchVehicles, fetchOverview]);
  
  // 검색 필터링
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => 
      vehicle.mdn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, vehicles]);
  
  // 페이지네이션 계산 - 클라이언트 측에서 처리
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 상태에 따른 배경색 클래스
  const getStatusClass = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-teal-50 text-teal-700 dark:bg-teal-50 dark:text-teal-700";
      case "STOPPED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-50 dark:text-amber-700";
      case "NOT_REGISTERED":
        return "bg-slate-50 text-slate-700 dark:bg-slate-50 dark:text-slate-700";
      default:
        return "";
    }
  };
  
  // 상태 텍스트 변환 함수
  const getStatusText = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "운행";
      case "STOPPED":
        return "미운행";
      case "NOT_REGISTERED":
        return "미관제";
      default:
        return status;
    }
  };
  
  // 소유구분에 따른 배경색 클래스
  const getOwnershipClass = (type: string) => {
    return "font-medium";
  };

  // 차량 추가 핸들러
  const handleAddVehicle = () => {
    setIsAddModalOpen(true);
  };

  // 차량 추가 완료 핸들러
  const handleAddVehicleComplete = async (newVehicle: Omit<Vehicle, 'id'>) => {
    try {
      const message = await addVehicle(newVehicle);
      // 차량 추가 후 차량 개요 데이터 갱신
      fetchOverview();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('차량 추가 오류:', err);
    }
  };

  // 차량 선택 핸들러 - 슬라이드 패널에 표시할 차량 선택
  const handleVehicleClick = (vehicle: Vehicle) => {
    // 스토어의 selectedVehicle 상태에 저장
    setSelectedVehicle(vehicle);
    setIsSlidePanelOpen(true);
  };

  // 슬라이드 패널 닫기 핸들러
  const handleCloseSlidePanel = () => {
    // 패널이 닫힐 때 선택된 차량 정보 완전히 초기화
    setSelectedVehicle(null);
    setIsSlidePanelOpen(false);
    
    // 변경 사항이 있을 수 있으므로 차량 목록을 다시 불러옴
    fetchVehicles().catch(err => {
      console.error('차량 목록 새로고침 오류:', err);
    });
  };

  // 차량 삭제 핸들러
  const handleDeleteVehicle = async (id: string) => {
    try {
      await deleteVehicle(id);
      // 차량 삭제 후 차량 개요 데이터 갱신
      fetchOverview();
      setIsSlidePanelOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      console.error('차량 삭제 오류:', err);
      alert('차량 삭제에 실패했습니다.');
    }
  };

  // 차량 수정 핸들러
  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    try {
      await updateVehicle(updatedVehicle);
      // 차량 수정 후 차량 개요 데이터 갱신
      fetchOverview();
    } catch (err) {
      console.error('차량 수정 오류:', err);
      alert('차량 수정에 실패했습니다.');
    }
  };

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <PageHeader 
          title="차량 관리" 
          description="차량을 관리하고 조회할 수 있습니다." 
        />
        <button
          onClick={handleAddVehicle}
          className={`flex items-center px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm`}
        >
          <PlusIcon className="h-4 w-4 mr-1.5" />
          <span>차량 추가</span>
        </button>
      </div>
      
      {/* 차량 상태 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-sm ${currentTheme.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${currentTheme.subtext}`}>전체 차량</p>
              <p className={`text-xl font-bold ${currentTheme.text} mt-0.5`}>
                {isOverviewLoading ? "로딩 중..." : carOverview?.totalCars || 0}
              </p>
            </div>
            <div className={`p-2 ${currentTheme.activeBg} rounded-lg`}>
              <TruckIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
            </div>
          </div>
        </div>
        
        <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-sm ${currentTheme.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${currentTheme.subtext}`}>운행 중</p>
              <p className={`text-xl font-bold ${currentTheme.text} mt-0.5`}>
                {isOverviewLoading ? "로딩 중..." : carOverview?.activeCars || 0}
              </p>
            </div>
            <div className={`p-2 ${currentTheme.activeBg} rounded-lg`}>
              <CheckCircleIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
            </div>
          </div>
        </div>
        
        <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-sm ${currentTheme.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${currentTheme.subtext}`}>미운행</p>
              <p className={`text-xl font-bold ${currentTheme.text} mt-0.5`}>
                {isOverviewLoading ? "로딩 중..." : carOverview?.inactiveCars || 0}
              </p>
            </div>
            <div className={`p-2 ${currentTheme.activeBg} rounded-lg`}>
              <ExclamationTriangleIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
            </div>
          </div>
        </div>
        
        <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-sm ${currentTheme.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${currentTheme.subtext}`}>미관제</p>
              <p className={`text-xl font-bold ${currentTheme.text} mt-0.5`}>
                {isOverviewLoading ? "로딩 중..." : carOverview?.untrackedCars || 0}
              </p>
            </div>
            <div className={`p-2 ${currentTheme.activeBg} rounded-lg`}>
              <XCircleIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 검색바 */}
      <div className={`mb-4 ${currentTheme.cardBg} rounded-xl shadow-sm ${currentTheme.border} p-3`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className={`block w-full pl-9 pr-3 py-2 border ${currentTheme.border} rounded-lg leading-5 ${currentTheme.cardBg} ${currentTheme.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
            placeholder="차량 번호, 제조사, 모델명으로 검색"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // 검색 시 첫 페이지로 이동
            }}
          />
        </div>
      </div>
      
      {/* 차량 목록 테이블 */}
      <div className={`flex-grow ${currentTheme.cardBg} rounded-xl shadow-sm ${currentTheme.border} overflow-hidden flex flex-col`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        ) : currentVehicles.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">등록된 차량이 없습니다.</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-grow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-200">
                <thead className={`${currentTheme.cardBg} dark:bg-gray-500`}>
                  <tr>
                    <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                      차량 번호
                    </th>
                    <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                      제조사
                    </th>
                    <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                      모델
                    </th>
                    <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                      소유구분
                    </th>
                    <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                      상태
                    </th>
                    <th scope="col" className={`px-5 py-3.5 text-left text-xs font-medium ${currentTheme.subtext} dark:text-gray-100 uppercase tracking-wider`}>
                      총 주행 거리
                    </th>
                  </tr>
                </thead>
                <tbody className={`${currentTheme.cardBg} divide-y divide-gray-200 dark:divide-gray-200 dark:bg-white`}>
                  {currentVehicles.map((vehicle) => (
                    <tr 
                      key={vehicle.id} 
                      className={`${currentTheme.cardBg} hover:bg-gray-200 transition-colors duration-150 dark:bg-white dark:hover:bg-gray-200 cursor-pointer`}
                      onClick={() => handleVehicleClick(vehicle)}
                    >
                      <td className={`px-5 py-3.5 whitespace-nowrap text-sm font-medium ${currentTheme.text} dark:text-gray-800`}>
                        {vehicle.mdn}
                      </td>
                      <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                        {vehicle.make}
                      </td>
                      <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                        {vehicle.model}
                      </td>
                      <td className={`px-5 py-3.5 whitespace-nowrap text-sm`}>
                        <span className={`${getOwnershipClass(vehicle.ownerType)} ${currentTheme.text} dark:text-gray-800`}>
                          {vehicle.ownerType === "CORPORATE" ? "법인" : "개인"}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 whitespace-nowrap text-sm`}>
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusClass(vehicle.carState)}`}>
                          {getStatusText(vehicle.carState)}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${currentTheme.text} dark:text-gray-800`}>
                        {vehicle.mileage.toLocaleString()} km
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 페이지네이션 */}
            <div className={`px-4 py-3 flex items-center justify-between border-t ${currentTheme.border} dark:bg-gray-100`}>
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-3 py-1.5 border ${currentTheme.border} text-sm font-medium rounded-md ${
                    currentPage === 1 
                      ? `${currentTheme.subtext} cursor-not-allowed` 
                      : `${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-200 dark:text-gray-800`
                  }`}
                >
                  이전
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-3 py-1.5 border ${currentTheme.border} text-sm font-medium rounded-md ${
                    currentPage === totalPages 
                      ? `${currentTheme.subtext} cursor-not-allowed` 
                      : `${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-200 dark:text-gray-800`
                  }`}
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className={`text-xs ${currentTheme.text} dark:text-gray-800`}>
                    총 <span className="font-medium">{filteredVehicles.length}</span>개 중{' '}
                    <span className="font-medium">{startIndex + 1}</span>부터{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredVehicles.length)}</span>까지 표시
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-1.5 rounded-l-md border ${currentTheme.border} bg-white dark:bg-gray-100 text-sm font-medium ${
                        currentPage === 1 
                          ? `${currentTheme.subtext} cursor-not-allowed` 
                          : `${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-200 dark:text-gray-800`
                      }`}
                    >
                      <span className="sr-only">이전</span>
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-3 py-1.5 border ${
                          currentPage === page
                            ? `z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-100 dark:border-indigo-500 dark:text-indigo-800`
                            : `${currentTheme.border} ${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-200 dark:text-gray-800`
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border ${currentTheme.border} bg-white dark:bg-gray-100 text-sm font-medium ${
                        currentPage === totalPages 
                          ? `${currentTheme.subtext} cursor-not-allowed` 
                          : `${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-200 dark:text-gray-800`
                      }`}
                    >
                      <span className="sr-only">다음</span>
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 차량 상세 슬라이드 패널 */}
      <VehicleDetailSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={handleCloseSlidePanel}
        vehicle={selectedVehicle}
      />

      {/* 차량 추가 모달 */}
      <VehicleAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onComplete={handleAddVehicleComplete}
      />
    </div>
  );
} 