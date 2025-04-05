"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import CompanyDetailPanel, { Company } from "./CompanyDetailPanel";

interface CompanyInfoProps {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  foundedYear: number;
}

export default function CompanyInfo({
  name,
  address,
  phone,
  email,
  description,
  foundedYear,
}: CompanyInfoProps) {
  const { currentTheme } = useTheme();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const company: Company = {
    name,
    address,
    phone,
    email,
    description,
    foundedYear
  };

  const handleCompanyClick = () => {
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    // 여기서는 예시로만 로그 출력. 실제로는 상태 업데이트나 API 호출 필요
    console.log("회사 정보 업데이트:", updatedCompany);
  };

  return (
    <>
      <div 
        className={`mb-8 p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} cursor-pointer hover:shadow-xl transition-shadow`}
        onClick={handleCompanyClick}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${currentTheme.text}`}>{name}</h2>
            <p className={`text-sm ${currentTheme.subtext}`}>설립: {foundedYear}년</p>
          </div>
        </div>
        
        <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-700 mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${currentTheme.subtext}`}>주소</p>
              <p className={`${currentTheme.text}`}>{address}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${currentTheme.subtext}`}>연락처</p>
              <p className={`${currentTheme.text}`}>{phone}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${currentTheme.subtext}`}>이메일</p>
              <p className={`${currentTheme.text}`}>{email}</p>
            </div>
          </div>
        </div>
        
        <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800 mt-6">
          <div className="flex items-start mb-3">
            <div className="mr-3">
              <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-sm font-medium ${currentTheme.subtext}`}>회사 소개</p>
          </div>
          <p className={`${currentTheme.text} leading-relaxed`}>{description}</p>
        </div>
      </div>

      {/* 회사 상세 정보 패널 */}
      <CompanyDetailPanel
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        company={company}
        onUpdate={handleUpdateCompany}
      />
    </>
  );
} 