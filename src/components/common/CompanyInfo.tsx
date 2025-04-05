"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import CompanyDetailPanel, { Company } from "./CompanyDetailPanel";
import { useCompanyStore, CompanyRequest } from "@/lib/companyStore";

interface CompanyInfoProps {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  website: string;
}

export default function CompanyInfo({
  name,
  address,
  phone,
  email,
  description,
  website,
}: CompanyInfoProps) {
  const { currentTheme } = useTheme();
  const { updateMyCompany, company: storeCompany, fetchMyCompany } = useCompanyStore();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [localCompany, setLocalCompany] = useState<Company>({
    name,
    address,
    phone,
    email,
    description,
    website
  });

  // 스토어에서 회사 정보가 업데이트되면 로컬 상태도 업데이트
  useEffect(() => {
    if (storeCompany) {
      setLocalCompany({
        name: storeCompany.name,
        address: storeCompany.address,
        phone: storeCompany.phone,
        email: storeCompany.email,
        description: storeCompany.description,
        website: storeCompany.website
      });
    }
  }, [storeCompany]);

  const handleCompanyClick = () => {
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleUpdateCompany = async (updatedCompany: Company) => {
    // API를 호출하여 회사 정보 업데이트
    const companyRequest: CompanyRequest = {
      name: updatedCompany.name,
      address: updatedCompany.address,
      phone: updatedCompany.phone,
      email: updatedCompany.email,
      description: updatedCompany.description,
      website: updatedCompany.website
    };
    
    const success = await updateMyCompany(companyRequest);
    
    if (success) {
      // 업데이트가 성공하면 로컬 상태도 업데이트
      setLocalCompany(updatedCompany);
      
      // 업데이트된 회사 정보를 다시 가져옴
      fetchMyCompany();
    }
  };

  return (
    <>
      <div 
        className={`mb-8 p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} cursor-pointer hover:shadow-xl transition-shadow`}
        onClick={handleCompanyClick}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${currentTheme.text}`}>{localCompany.name}</h2>
          </div>
        </div>
        
        <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-700 mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-start mb-4">
              <div className="mr-3">
                <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${currentTheme.subtext}`}>주소</p>
                <p className={`${currentTheme.text}`}>{localCompany.address}</p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="mr-3">
                <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${currentTheme.subtext}`}>전화번호</p>
                <p className={`${currentTheme.text}`}>{localCompany.phone}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start mb-4">
              <div className="mr-3">
                <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${currentTheme.subtext}`}>이메일</p>
                <p className={`${currentTheme.text}`}>{localCompany.email}</p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="mr-3">
                <svg className={`w-5 h-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${currentTheme.subtext}`}>웹사이트</p>
                <p className={`${currentTheme.text}`}>
                  <a href={localCompany.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {localCompany.website}
                  </a>
                </p>
              </div>
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
          <p className={`${currentTheme.text} leading-relaxed`}>{localCompany.description}</p>
        </div>
      </div>

      {/* 회사 상세 정보 패널 */}
      <CompanyDetailPanel
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        company={localCompany}
        onUpdate={handleUpdateCompany}
      />
    </>
  );
} 