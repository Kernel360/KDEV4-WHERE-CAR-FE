"use client";

import PageHeader from "@/components/common/PageHeader";
import CompanyInfo from "@/components/common/CompanyInfo";
import EmployeeList from "@/components/common/EmployeeList";
import { useTheme } from "@/contexts/ThemeContext";

// 샘플 회사 정보
const companyData = {
  name: "위카 주식회사",
  address: "서울특별시 강남구 테헤란로 123 위카타워 10층",
  phone: "02-1234-5678",
  email: "info@whercar.com",
  description: "위카는 차량 관리 시스템 분야에서 선도적인 기업으로, 혁신적인 솔루션과 높은 품질의 서비스를 제공합니다. 2018년에 설립된 이래로 지속적인 성장을 이루어왔으며, 고객 만족을 최우선 가치로 삼고 있습니다.",
  foundedYear: 2018
};

// EmployeeList 컴포넌트에서 내부적으로 mockEmployees 데이터를 사용하므로 샘플 데이터는 제거

export default function CompaniesPage() {
  const { currentTheme } = useTheme();
  
  return (
    <div className={`p-6 md:p-8 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <PageHeader 
            title="업체 정보" 
            description="위카 주식회사 정보와 직원 목록을 관리합니다" 
          />
          
          <div className="hidden md:flex space-x-2">
            <button className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center shadow-md hover:shadow-lg transition-all`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 직원 추가
            </button>
            
            <button className={`px-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              내보내기
            </button>
          </div>
        </div>
        
        <div className="mb-10">
          <CompanyInfo
            name={companyData.name}
            address={companyData.address}
            phone={companyData.phone}
            email={companyData.email}
            description={companyData.description}
            foundedYear={companyData.foundedYear}
          />
        </div>
        
        <div className="md:flex md:justify-between md:items-center mb-6">
          <h2 className={`text-2xl font-bold ${currentTheme.text}`}>인력 관리</h2>
          
          <div className="mt-4 md:mt-0 flex md:hidden space-x-2">
            <button className={`flex-grow px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center justify-center shadow-md`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              추가
            </button>
            
            <button className={`flex-grow px-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} text-sm font-medium flex items-center justify-center`}>
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