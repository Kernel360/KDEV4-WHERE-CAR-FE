"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeftIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useRegisterStore, UserRequest, CompanyRequest, RootUserRequest } from '@/lib/registerStore';
import Link from 'next/link';

export default function RegisterPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
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
  
  // 유효성 검증 에러 상태
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});
  
  // 회원가입 스토어에서 상태와 메서드 가져오기
  const { 
    isRegistering, 
    registerError, 
    registerSuccess, 
    registerRootUser,
    resetRegisterSuccess
  } = useRegisterStore();

  // 전화번호 형식화 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      // 지역번호가 2자리인 경우(02)
      if (numbers.startsWith('02') && numbers.length <= 10) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } 
      // 일반적인 경우(3-4-4)
      else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
      }
    }
  };

  // 사용자 정보 입력 필드 변경 처리
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 필드인 경우 형식화 적용
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setUserFormData((prev) => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setUserFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    
    // 오류 상태 초기화 (사용자가 수정 중)
    if (userErrors[name]) {
      const newErrors = { ...userErrors };
      delete newErrors[name];
      setUserErrors(newErrors);
    }
  };
  
  // 회사 정보 입력 필드 변경 처리
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 필드인 경우 형식화 적용
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setCompanyFormData((prev) => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setCompanyFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    
    // 오류 상태 초기화 (사용자가 수정 중)
    if (companyErrors[name]) {
      const newErrors = { ...companyErrors };
      delete newErrors[name];
      setCompanyErrors(newErrors);
    }
  };

  // 다음 버튼 클릭 핸들러
  const handleNextButtonClick = () => {
    // 필수 필드 비어있는지 확인
    const newErrors: Record<string, string> = {};
    
    // 각 필수 필드 검사
    if (!userFormData.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!userFormData.email.trim()) newErrors.email = "이메일을 입력해주세요";
    if (!userFormData.password.trim()) newErrors.password = "비밀번호를 입력해주세요";
    if (!userFormData.phone.trim()) newErrors.phone = "전화번호를 입력해주세요";
    if (!userFormData.jobTitle.trim()) newErrors.jobTitle = "직책을 입력해주세요";
    
    // 형식 검사 (값이 있는 경우만)
    if (userFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }
    
    if (userFormData.phone && !/^\d{2,3}-\d{3,4}-\d{4}$/.test(userFormData.phone)) {
      newErrors.phone = "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)";
    }
    
    // 오류 상태 업데이트
    setUserErrors(newErrors);
    
    // 오류가 없을 때만 탭 변경
    if (Object.keys(newErrors).length === 0) {
      setActiveTab('company');
    }
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    router.back();
  };

  // 탭 변경 처리
  const handleTabChange = (tab: string) => {
    // 회사 정보 탭에서 사용자 정보 탭으로 이동할 때는 항상 허용
    if (tab === 'user') {
      setActiveTab(tab);
    }
  };

  // useEffect를 사용하여 등록 성공 시 리다이렉션 처리
  useEffect(() => {
    if (registerSuccess) {
      console.log('회원가입이 성공적으로 완료되었습니다.');
      
      // 짧은 지연 후 로그인 페이지로 이동 (자연스러운 사용자 경험을 위함)
      const redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 1500);
      
      // 컴포넌트 언마운트 시 타이머 정리
      return () => clearTimeout(redirectTimer);
    }
  }, [registerSuccess, router]);

  // 회사 정보 유효성 검증
  const validateCompanyInfo = () => {
    const newErrors: Record<string, string> = {};
    
    // 필수 필드는 회사명과 전화번호
    if (!companyFormData.name.trim()) newErrors.name = "회사명을 입력해주세요";
    if (!companyFormData.phone.trim()) newErrors.phone = "회사 전화번호를 입력해주세요";
    
    // 이메일 형식 검사 (입력된 경우)
    if (companyFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyFormData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }
    
    // 전화번호 형식 검사
    if (companyFormData.phone && !/^\d{2,3}-\d{3,4}-\d{4}$/.test(companyFormData.phone)) {
      newErrors.phone = "올바른 전화번호 형식이 아닙니다 (예: 02-1234-5678)";
    }
    
    setCompanyErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 회사 정보 유효성 검증
    if (!validateCompanyInfo()) {
      return;
    }
    
    // 두 탭의 필수 입력값이 모두 채워졌는지 확인
    const requestData: RootUserRequest = {
      user: userFormData,
      company: companyFormData
    };
    
    try {
      // 스토어의 registerRootUser 메서드 호출
      await registerRootUser(requestData);
    } catch (error: any) {
      console.log('회원가입 에러 처리:', error);
      // 이메일 중복 오류 처리
      if (error?.message === "Email already exists") {
        // 사용자 탭으로 전환하고 이메일 필드에 오류 표시
        setActiveTab('user');
        setUserErrors({
          ...userErrors,
          email: "이미 등록된 이메일입니다. 다른 이메일을 사용해주세요."
        });
      }
    }
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
            <p className="font-medium">
              {registerError === "Email already exists" 
                ? "이미 등록된 이메일입니다. 다른 이메일을 사용해주세요." 
                : registerError}
            </p>
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
                    className={`w-full rounded-lg border ${userErrors.name ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="이름을 입력하세요"
                    disabled={isRegistering}
                  />
                  {userErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{userErrors.name}</p>
                  )}
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
                    className={`w-full rounded-lg border ${userErrors.email ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="이메일 주소를 입력하세요"
                    disabled={isRegistering}
                  />
                  {userErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{userErrors.email}</p>
                  )}
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
                    className={`w-full rounded-lg border ${userErrors.password ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="비밀번호를 입력하세요"
                    disabled={isRegistering}
                  />
                  {userErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{userErrors.password}</p>
                  )}
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
                    maxLength={13}
                    className={`w-full rounded-lg border ${userErrors.phone ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="숫자만 입력하세요 (예: 01012345678)"
                    disabled={isRegistering}
                  />
                  {userErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{userErrors.phone}</p>
                  )}
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
                    className={`w-full rounded-lg border ${userErrors.jobTitle ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="직책을 입력하세요"
                    disabled={isRegistering}
                  />
                  {userErrors.jobTitle && (
                    <p className="mt-1 text-sm text-red-500">{userErrors.jobTitle}</p>
                  )}
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
                    className={`w-full rounded-lg border ${companyErrors.name ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사명을 입력하세요"
                    disabled={isRegistering}
                  />
                  {companyErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{companyErrors.name}</p>
                  )}
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
                    type="email"
                    id="companyEmail"
                    name="email"
                    value={companyFormData.email}
                    onChange={handleCompanyInputChange}
                    className={`w-full rounded-lg border ${companyErrors.email ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="회사 이메일을 입력하세요"
                    disabled={isRegistering}
                  />
                  {companyErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{companyErrors.email}</p>
                  )}
                </div>

                {/* 회사 전화번호 */}
                <div>
                  <label htmlFor="companyPhone" className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    회사 전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="companyPhone"
                    name="phone"
                    value={companyFormData.phone}
                    onChange={handleCompanyInputChange}
                    required
                    maxLength={13}
                    className={`w-full rounded-lg border ${companyErrors.phone ? 'border-red-500' : currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="숫자만 입력하세요 (예: 0212345678)"
                    disabled={isRegistering}
                  />
                  {companyErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{companyErrors.phone}</p>
                  )}
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

                <div className="pt-2 text-sm text-gray-500">
                  <p>* 표시는 필수 입력 항목입니다.</p>
                  <p>전화번호는 자동으로 하이픈(-)이 추가됩니다.</p>
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
                  onClick={handleNextButtonClick}
                  className="py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  다음: 회사 정보
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('user')}
                  className={`py-3 px-6 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  이전: 사용자 정보
                </button>
                <button
                  type="submit"
                  disabled={isRegistering || Object.keys(companyErrors).length > 0}
                  className={`py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isRegistering || Object.keys(companyErrors).length > 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
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