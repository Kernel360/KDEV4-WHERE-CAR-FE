"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { VehicleLogList } from "@/components/logs/VehicleLogList";
import { VehicleLogFilter } from "@/components/logs/VehicleLogFilter";
import { VehicleLogFilter as FilterType, VehicleLog } from "@/types/logs";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { downloadExcel } from "@/lib/utils";
import VehicleLogDetailSlidePanel from "@/components/logs/VehicleLogDetailSlidePanel";
import { useCarLogsStore } from "@/lib/carLogsStore";

export default function LogsPage() {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>({});
  const [selectedLog, setSelectedLog] = useState<VehicleLog | null>(null);
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  
  const { fetchCarLogs, isLoading, carLogs } = useCarLogsStore();
  
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
    await fetchCarLogs();
  };

  const handleLogSelect = (log: VehicleLog) => {
    setSelectedLog(log);
    setIsSlidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSlidePanelOpen(false);
  };

  const handleExportExcel = (logs: VehicleLog[]) => {
    downloadExcel(logs, 'vehicle-logs');
  };

  const handleDeleteLog = (id: string) => {
    console.log(`삭제할 운행 기록 ID: ${id}`);
  };
  
  const handleUpdateLog = (log: VehicleLog) => {
    console.log('운행 기록 업데이트:', log);
  };
  
  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <PageHeader 
          title="운행일지" 
          description="차량 운행 기록을 관리하고 조회할 수 있습니다." 
        />
        <button
          onClick={() => handleExportExcel([])} 
          className={`flex items-center px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm`}
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
          <span>Excel 내보내기</span>
        </button>
      </div>

      <div className="mt-4">
        <VehicleLogFilter 
          filter={filter} 
          onFilterChange={handleFilterChange} 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
        />
        <div className="mt-4">
          <VehicleLogList 
            filter={filter} 
            searchTerm={searchTerm} 
            onExport={handleExportExcel}
            onLogSelect={handleLogSelect}
            isLoading={isLoading}
          />
        </div>
      </div>

      <VehicleLogDetailSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={handleCloseSidePanel}
        log={selectedLog}
        onDelete={handleDeleteLog}
        onUpdate={handleUpdateLog}
      />
    </div>
  );
} 