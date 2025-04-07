"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeftIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useRegisterStore, UserRequest, CompanyRequest, RootUserRequest } from '@/lib/registerStore';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function RegisterPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('user'); // 'user' 또는 'company'
  
  // 사용자 정보 폼 데이터
  const [userFormData, setUserFormData] = useState<UserRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    jobTitle: '',
  });
  
  // 회사 정보 폼 데이터
  const [companyFormData, setCompanyFormData] = useState<CompanyRequest>({
    name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    description: '',
  });
  
  // 회원가입 스토어에서 상태와 메서드 가져오기
  const { 
    isRegistering, 
    registerError, 
    registerSuccess, 
    registerRootUser,
    resetRegisterSuccess
  } = useRegisterStore();

  // 사용자 정보 입력 필드 변경 처리
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 회사 정보 입력 필드 변경 처리
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    router.back();
  };

  // 탭 변경 처리
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // useEffect를 사용하여 등록 성공 시 리다이렉션 처리
  useEffect(() => {
    if (registerSuccess) {
      // alert 대신 토스트 메시지 사용
      showToast('회원가입이 성공적으로 완료되었습니다.', 'success');
      
      // 짧은 지연 후 로그인 페이지로 이동 (자연스러운 사용자 경험을 위함)
      const redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 1500);
      
      // 컴포넌트 언마운트 시 타이머 정리
      return () => clearTimeout(redirectTimer);
    }
  }, [registerSuccess, router, showToast]);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 두 탭의 필수 입력값이 모두 채워졌는지 확인
    const requestData: RootUserRequest = {
      user: userFormData,
      company: companyFormData
    };
    
    console.log('폼 제출 데이터:', requestData);
    console.log('JSON 문자열:', JSON.stringify(requestData));
    
    // 스토어의 registerRootUser 메서드 호출
    await registerRootUser(requestData);
  };

  return (
    <div className={`min-h-screen ${currentTheme.background} p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex items-center">
          <button 
            onClick={handleGoBack}
            className={`mr-4 p-2 rounded-full hover:${currentTheme.hoverBg}`}
          >
            <ArrowLeftIcon className={`h-5 w-5 ${currentTheme.text}`} />
          </button>
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>회원가입</h1>
        </div>

        {/* 오류 메시지 */}
        {registerError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            <p className="font-medium">{registerError}</p>
          </div>
        )}

        {/* 탭 메뉴 */}
        <div className="flex border-b mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'user'
                ? `border-b-2 border-blue-500 ${currentTheme.text}`
                : currentTheme.subtext
            }`}
            onClick={() => handleTabChange('user')}
          >
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              사용자 정보
            </div>
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'company'
                ? `border-b-2 border-blue-500 ${currentTheme.text}`
                : currentTheme.subtext
            }`}
            onClick={() => handleTabChange('company')}
          >
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              회사 정보
            </div>
          </button>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'user' ? (
            <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
              <div className="space-y-6">
                {/* 이름 */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userFormData.name}
                    onChange={handleUserInputChange}
                    required
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="이름을 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserInputChange}
                    required
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="이메일 주소를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    required
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="비밀번호를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userFormData.phone}
                    onChange={handleUserInputChange}
                    required
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="연락처를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 직책 */}
                <div>
                  <label htmlFor="jobTitle" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    직책 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={userFormData.jobTitle}
                    onChange={handleUserInputChange}
                    required
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="직책을 입력하세요"
                    disabled={isRegistering}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
              <div className="space-y-6">
                {/* 회사명 */}
                <div>
                  <label htmlFor="companyName" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    회사명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="name"
                    value={companyFormData.name}
                    onChange={handleCompanyInputChange}
                    required
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사명을 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 주소 */}
                <div>
                  <label htmlFor="address" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    주소
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={companyFormData.address}
                    onChange={handleCompanyInputChange}
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사 주소를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 회사 이메일 */}
                <div>
                  <label htmlFor="companyEmail" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    회사 이메일
                  </label>
                  <input
                    type="text"
                    id="companyEmail"
                    name="email"
                    value={companyFormData.email}
                    onChange={handleCompanyInputChange}
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사 이메일을 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 회사 전화번호 */}
                <div>
                  <label htmlFor="companyPhone" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    회사 전화번호
                  </label>
                  <input
                    type="tel"
                    id="companyPhone"
                    name="phone"
                    value={companyFormData.phone}
                    onChange={handleCompanyInputChange}
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사 전화번호를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 웹사이트 */}
                <div>
                  <label htmlFor="website" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    웹사이트
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={companyFormData.website}
                    onChange={handleCompanyInputChange}
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사 웹사이트 주소를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>

                {/* 회사 설명 */}
                <div>
                  <label htmlFor="description" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    회사 소개
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={companyFormData.description}
                    onChange={handleCompanyInputChange}
                    rows={4}
                    className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사 소개를 입력하세요"
                    disabled={isRegistering}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="mt-8 flex justify-between">
            {activeTab === 'user' ? (
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  onClick={() => handleTabChange('company')}
                  className="py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  다음: 회사 정보
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-between">
                <button
                  type="button"
                  onClick={() => handleTabChange('user')}
                  className={`py-3 px-6 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  이전: 사용자 정보
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isRegistering ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isRegistering ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : '회원가입'}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* 로그인 링크 */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${currentTheme.subtext}`}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className={`font-medium ${currentTheme.activeText} hover:underline`}>
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 