"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ALL_PERMISSIONS, PERMISSION_GROUPS, Permission } from '@/lib/permissions';
import { fetchApi, API_BASE_URL } from '@/lib/api';
import { useEmployeeStore } from '@/lib/employeeStore';

interface UserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  jobTitle: string;
}

interface PermissionRequest {
  permissionTypes: string[];
}

interface SubUserRequest {
  user: UserRequest;
  permission: PermissionRequest;
}

export default function AddEmployeePage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info'); // 'info' 또는 'permissions'
  const [permissions, setPermissions] = useState<Permission[]>(
    ALL_PERMISSIONS.map(p => ({ ...p, isGranted: false }))
  );
  const [formData, setFormData] = useState<UserRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    jobTitle: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const errorRef = useRef<HTMLDivElement>(null);
  
  // 직원 스토어에서 상태와 메서드 가져오기
  const { 
    isRegistering, 
    registerError, 
    registerSuccess, 
    registerEmployee,
    resetRegisterSuccess
  } = useEmployeeStore();

  // 에러가 발생했을 때 스크롤 이동
  useEffect(() => {
    if (registerError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [registerError]);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 필드 유효성 검사 함수
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return '이름은 필수입니다';
        }
        break;
      case 'email':
        if (!value.trim()) {
          return '이메일은 필수입니다';
        }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return '올바른 이메일 형식이 아닙니다';
        }
        break;
      case 'password':
        if (!value.trim()) {
          return '비밀번호는 필수입니다';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          return '전화번호는 필수입니다';
        }
        if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(value)) {
          return '전화번호 형식이 올바르지 않습니다';
        }
        break;
      case 'jobTitle':
        if (!value.trim()) {
          return '직책은 필수입니다';
        }
        break;
    }
    return null;
  };

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    }

    const error = validateField(name, processedValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    router.back();
  };

  // 탭 변경 처리
  const handleTabChange = (tab: string) => {
    if (tab === 'permissions') {
      // 모든 필드 유효성 검사
      const errors: {[key: string]: string} = {};
      let hasErrors = false;

      Object.entries(formData).forEach(([field, value]) => {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setFieldErrors(errors);
        return;
      }
    }
    setActiveTab(tab);
  };

  // 권한 변경 처리
  const handlePermissionChange = (permissionId: string, isGranted: boolean) => {
    setPermissions(prev =>
      prev.map(p => p.id === permissionId ? { ...p, isGranted } : p)
    );
  };

  // 권한 그룹 전체 변경 처리
  const handleGroupPermissionChange = (groupId: string, isGranted: boolean) => {
    const groupPermissionIds = PERMISSION_GROUPS.find(g => g.id === groupId)?.permissions.map(p => p.id) || [];
    
    setPermissions(prev => prev.map(p => 
      groupPermissionIds.includes(p.id) ? { ...p, isGranted } : p
    ));
  };

  // useEffect를 사용하여 등록 성공 시 리다이렉션 처리
  useEffect(() => {
    if (registerSuccess) {
      resetRegisterSuccess(); // 상태 초기화
      router.push('/companies');
    }
  }, [registerSuccess, router, resetRegisterSuccess]);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모든 필드 유효성 검사
    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }
    
    // 권한 ID 목록 생성
    const permissionTypes = permissions
      .filter(p => p.isGranted)
      .map(p => p.id);
    
    // 요청 데이터를 SubUserRequest 형식에 맞게 구성
    const requestData = {
      user: formData,
      permission: {
        permissionTypes
      }
    };
    
    // 스토어의 registerEmployee 메서드 호출
    await registerEmployee(requestData);
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
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>새 직원 추가</h1>
        </div>

        {/* 오류 메시지 */}
        {registerError && (
          <div 
            ref={errorRef}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
          >
            <p className="font-medium">{registerError}</p>
          </div>
        )}

        {/* 탭 메뉴 */}
        <div className="flex border-b mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'info'
                ? `border-b-2 border-blue-500 ${currentTheme.text}`
                : currentTheme.subtext
            }`}
            onClick={() => handleTabChange('info')}
          >
            기본 정보
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'permissions'
                ? `border-b-2 border-blue-500 ${currentTheme.text}`
                : currentTheme.subtext
            }`}
            onClick={() => handleTabChange('permissions')}
          >
            권한 설정
          </button>
        </div>

        {/* 직원 정보 폼 */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'info' ? (
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
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg border ${
                      fieldErrors.name ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="직원의 이름을 입력하세요"
                    disabled={isRegistering}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
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
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg border ${
                      fieldErrors.email ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="직원의 이메일 주소를 입력하세요"
                    disabled={isRegistering}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
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
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg border ${
                      fieldErrors.password ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="임시 비밀번호를 설정하세요"
                    disabled={isRegistering}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={13}
                    required
                    className={`w-full rounded-lg border ${
                      fieldErrors.phone ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="010-1234-5678"
                    disabled={isRegistering}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>
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
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg border ${
                      fieldErrors.jobTitle ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.inputBg} ${currentTheme.text} px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="직원의 직책을 입력하세요"
                    disabled={isRegistering}
                  />
                  {fieldErrors.jobTitle && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.jobTitle}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
              <div className="mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className={`text-lg font-medium ${currentTheme.text}`}>권한 설정</h3>
              </div>
              
              <p className={`mb-6 ${currentTheme.subtext} text-sm`}>
                이 직원에게 부여할 권한을 선택하세요. 권한에 따라 접근 가능한 기능이 결정됩니다.
              </p>
              
              <div className="space-y-6">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.id} className={`p-6 rounded-xl border ${currentTheme.border}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-medium ${currentTheme.text}`}>{group.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${currentTheme.subtext} mr-2`}>전체 권한</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={group.permissions.every(p => 
                              permissions.find(perm => perm.id === p.id)?.isGranted
                            )}
                            onChange={(e) => handleGroupPermissionChange(group.id, e.target.checked)}
                            disabled={isRegistering}
                          />
                          <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                            peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                            peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                            peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                            after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                            after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                            ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {group.permissions.map((permission) => {
                        const perm = permissions.find(p => p.id === permission.id);
                        if (!perm) return null;
                        
                        return (
                          <div 
                            key={permission.id} 
                            className={`p-4 rounded-lg border ${perm.isGranted 
                              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
                              : `${currentTheme.border} bg-gray-50 dark:bg-gray-800`}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-medium ${perm.isGranted 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : currentTheme.text}`}>
                                  {permission.name}
                                </h4>
                                <p className={`text-sm mt-1 ${currentTheme.subtext}`}>{permission.description}</p>
                              </div>
                              <div>
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={perm.isGranted}
                                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                    disabled={isRegistering}
                                  />
                                  <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                                    peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                    peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                                    after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                                    after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                                    ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="mt-8 flex justify-between">
            {activeTab === 'info' ? (
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  onClick={() => handleTabChange('permissions')}
                  className="py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  다음: 권한 설정
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-between">
                <button
                  type="button"
                  onClick={() => handleTabChange('info')}
                  className={`py-3 px-6 rounded-lg border ${currentTheme.border} ${currentTheme.cardBg} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  이전: 기본 정보
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
                  ) : '직원 추가'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 