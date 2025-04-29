"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { VehicleLogList } from "@/components/logs/VehicleLogList";
import { VehicleLogFilter } from "@/components/logs/VehicleLogFilter";
import { VehicleLogFilter as FilterType, VehicleLog, DriveType } from "@/types/logs";
import { useTheme } from "@/contexts/ThemeContext";
import VehicleLogDetailSlidePanel from "@/components/logs/VehicleLogDetailSlidePanel";
import { useCarLogsStore } from "@/lib/carLogsStore";

export default function LogsPage() {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>({});
  const [selectedLog, setSelectedLog] = useState<VehicleLog | null>(null);
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  
  const { fetchCarLogs, isLoading, carLogs, deleteCarLog, currentFilter } = useCarLogsStore();
  
  useEffect(() => {
    fetchCarLogs();
  }, [fetchCarLogs]);
  
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSearch = async () => {
    console.log('검색 시작, 현재 필터:', filter);
    // filter에 있는 데이터로 검색을 수행함
    await fetchCarLogs({
      vehicleNumber: filter.vehicleNumber,
      startDate: filter.startDate,
      endDate: filter.endDate
    });
    console.log('검색 완료, 필터 적용됨');
  };

  const handleLogSelect = (log: VehicleLog) => {
    setSelectedLog(log);
    setIsSlidePanelOpen(true);
  };

  const handleCloseSlidePanel = () => {
    setSelectedLog(null);
    setIsSlidePanelOpen(false);
    
    setTimeout(() => {
      fetchCarLogs().catch(err => {
        console.error('로그 목록 새로고침 오류:', err);
      });
    }, 300);
  };

  const handleDeleteLog = (id: string) => {
    console.log(`삭제할 운행 기록 ID: ${id}`);
    
    setSelectedLog(null);
    setIsSlidePanelOpen(false);
    
    setTimeout(() => {
      fetchCarLogs().catch(err => {
        console.error('목록 새로고침 오류:', err);
      });
    }, 1000);
  };
  
  const handleUpdateLog = (log: VehicleLog) => {
    console.log('운행 기록 업데이트:', log);
    fetchCarLogs();
  };
  
  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <PageHeader 
          title="운행일지" 
          description="차량 운행 기록을 관리하고 조회할 수 있습니다." 
        />
      </div>

      <div className="mt-4">
        <VehicleLogFilter 
          initialFilter={currentFilter as FilterType}
          onApplyFilter={() => {
            // 필터 적용 시 첫 페이지부터 데이터 가져오기
            fetchCarLogs({ page: 0 });
          }}
        />
        <div className="mt-4">
          <VehicleLogList 
            filter={currentFilter as FilterType}
            onLogSelect={handleLogSelect}
            isSlideOpen={isSlidePanelOpen}
            onCloseSlide={handleCloseSlidePanel}
            selectedLog={selectedLog}
            isLoading={isLoading}
          />
        </div>
      </div>

      <VehicleLogDetailSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={handleCloseSlidePanel}
        log={selectedLog}
        onDelete={handleDeleteLog}
        onUpdate={handleUpdateLog}
      />
    </div>
  );
} 