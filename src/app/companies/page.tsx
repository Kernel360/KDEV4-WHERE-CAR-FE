"use client";

import { useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import CompanyInfo from "@/components/common/CompanyInfo";
import EmployeeList from "@/components/common/EmployeeList";
import { useTheme } from "@/contexts/ThemeContext";
import { useCompanyStore } from "@/lib/companyStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function CompaniesPage() {
  const { currentTheme } = useTheme();
  const { company, isLoading, error, fetchMyCompany } = useCompanyStore();
  const router = useRouter();
  const { showToast } = useToast();
  
  useEffect(() => {
    // API를 통해 회사 정보 가져오기
    fetchMyCompany();
  }, [fetchMyCompany]);
  
  useEffect(() => {
    // 직원 추가 성공 시 토스트 메시지 표시
    const employeeAddSuccess = localStorage.getItem('employeeAddSuccess');
    const employeeName = localStorage.getItem('employeeAddName');
    
    if (employeeAddSuccess === 'true' && employeeName) {
      showToast(`${employeeName} 직원이 성공적으로 추가되었습니다.`, 'success');
      
      // 로컬 스토리지 정보 삭제
      localStorage.removeItem('employeeAddSuccess');
      localStorage.removeItem('employeeAddName');
    }
  }, [showToast]);
  
  const handleAddEmployee = () => {
    router.push('/employees/add');
  };

  const handleExportData = () => {
    // 데이터를 CSV 형식으로 변환
    if (!company) return;
    
    const companyData = [
      ['회사명', '주소', '연락처', '이메일', '웹사이트', '설명'],
      [company.name, company.address, company.phone, company.email, company.website, company.description]
    ];
    
    // CSV 문자열 생성
    const csvContent = companyData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    // Blob 생성 및 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${company.name}_정보.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={`p-6 md:p-8 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <PageHeader 
            title="업체 정보" 
            description="위카 주식회사 정보와 직원 목록을 관리합니다" 
          />
          
          <div className="hidden md:flex space-x-2">
            <button 
              onClick={handleAddEmployee}
              className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center shadow-md hover:shadow-lg transition-all`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 직원 추가
            </button>
            
            <button 
              onClick={handleExportData}
              className={`px-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              내보내기
            </button>
          </div>
        </div>
        
        <div className="mb-10">
          {isLoading ? (
            <div className={`mb-8 p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} flex justify-center`}>
              <span className={`${currentTheme.text}`}>회사 정보를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className={`mb-8 p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} flex justify-center`}>
              <span className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</span>
            </div>
          ) : company ? (
            <CompanyInfo
              name={company.name}
              address={company.address}
              phone={company.phone}
              email={company.email}
              description={company.description}
              website={company.website}
            />
          ) : (
            <div className={`mb-8 p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} flex justify-center`}>
              <span className={`${currentTheme.text}`}>회사 정보가 없습니다.</span>
            </div>
          )}
        </div>
        
        <div className="md:flex md:justify-between md:items-center mb-6">
          <h2 className={`text-2xl font-bold ${currentTheme.text}`}>인력 관리</h2>
          
          <div className="mt-4 md:mt-0 flex md:hidden space-x-2">
            <button 
              onClick={handleAddEmployee}
              className={`flex-grow px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center justify-center shadow-md`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              추가
            </button>
            
            <button 
              onClick={handleExportData}
              className={`flex-grow px-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium flex items-center justify-center`}
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              내보내기
            </button>
          </div>
        </div>
        
        <div>
          <EmployeeList />
        </div>
      </div>
    </div>
  );
} 