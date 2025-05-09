"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/lib/authStore";
import PageHeader from "@/components/common/PageHeader";
import { 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon, 
  CheckIcon, 
  XMarkIcon, 
  PhoneIcon, 
  BriefcaseIcon, 
  CalendarIcon,
  ShieldCheckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { fetchApi } from '@/lib/api';
import { UserRequest } from '@/lib/registerStore';
import { Permission, ALL_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions';

// 비밀번호 변경 인터페이스
interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { currentTheme } = useTheme();
  const { token, userProfile, profileLoading, profileError, fetchUserProfile, updateUserProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  
  // 로컬 유저 정보 상태 - 편집 시 사용
  const [userInfo, setUserInfo] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    updatedAt: null as (Date | string | null)
  });
  
  // 비밀번호 변경 상태
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  
  // 변경된 필드 추적
  const [changedFields, setChangedFields] = useState<Record<string, boolean>>({});

  // authStore에서 프로필 정보 가져오기 및 로컬 상태 업데이트
  useEffect(() => {
    if (userProfile) {
      setUserInfo({
        userId: userProfile.userId || '',
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        jobTitle: userProfile.jobTitle || '',
        updatedAt: userProfile.updatedAt
      });
    } else if (token && !profileLoading) {
      // 토큰이 있지만 프로필 정보가 없는 경우 프로필 정보 요청
      fetchUserProfile();
    }
    
    if (profileError) {
      setApiError(profileError);
    }
  }, [userProfile, token, profileLoading, profileError, fetchUserProfile]);

  // 페이지 로딩 상태 설정
  useEffect(() => {
    setIsLoading(profileLoading);
  }, [profileLoading]);
  
  // 사용자 정보 핸들러
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numbers = value.replace(/[^\d]/g, '');
      let formattedPhone = numbers;
      if (numbers.length > 3) {
        formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      }
      if (numbers.length > 7) {
        formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
      }
      setUserInfo(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setUserInfo(prev => ({ ...prev, [name]: value }));
    }
    setChangedFields(prev => ({ ...prev, [name]: true }));
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordChange(prev => ({ ...prev, [name]: value }));
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return "날짜 정보 없음";
    }
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "날짜 형식 오류";
      }
      
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return "날짜 형식 오류";
    }
  };
  
  // 프로필 업데이트 핸들러
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // 백엔드 API 사용 여부 (서버 준비 안된 경우 false로 설정)
      const useBackendApi = true;
      
      if (useBackendApi) {
        // UserRequest 클래스 구조에 맞게 요청 본문 구성
        const userRequest = {
          name: userInfo.name,
          email: userInfo.email,
          password: "", // 프로필 수정 시에는 비밀번호 필드를 빈 문자열로 설정
          phone: userInfo.phone,
          jobTitle: userInfo.jobTitle
        };
        
        // 프로필 업데이트 API 호출 - authStore의 updateUserProfile 함수 사용
        await updateUserProfile(userRequest);
        
        // 편집 모드 종료
        setIsEditing(false);
        setChangedFields({});
      } else {
        // 모의 응답 (백엔드 API가 아직 준비되지 않은 경우)
        setTimeout(() => {
          // 로컬 상태 업데이트만 수행
          setIsEditing(false);
          setChangedFields({});
          setIsLoading(false);
        }, 800);
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('프로필 업데이트 중 오류가 발생했습니다:', error);
      setApiError('프로필 업데이트에 실패했습니다.');
      setIsLoading(false);
    }
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 새 비밀번호와 확인 비밀번호가 일치하는지 확인
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setApiError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      setIsLoading(true);
      setApiError(null);
      
      await fetchApi<{data: any, message: string, statusCode: number}>('/api/users/password', undefined, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword
        })
      });
      
      // 비밀번호 변경 성공 시 입력 필드 초기화
      setPasswordChange({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('비밀번호 변경 중 오류가 발생했습니다:', error);
      setApiError('비밀번호 변경에 실패했습니다.');
      setIsLoading(false);
    }
  };
  
  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    // 프로필 정보를 원래 상태로 복원
    if (userProfile) {
      setUserInfo({
        userId: userProfile.userId || '',
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        jobTitle: userProfile.jobTitle || '',
        updatedAt: userProfile.updatedAt
      });
    }
    
    // 편집 모드 종료
    setIsEditing(false);
    setChangedFields({});
  };
  
  // 사용자 권한 정보 가져오기
  const fetchUserPermissions = async () => {
    if (!token) return;
    
    setLoadingPermissions(true);
    try {
      const apiResponse = await fetchApi<{data: { permissionTypes: string[] }, message: string, statusCode: number}>('/api/users/permissions/my');
      
      // 새로운 API 응답 형식 처리 (data 필드에 실제 데이터가 있음)
      const response = apiResponse.data || apiResponse;
      
      if (response && response.permissionTypes) {
        // 권한 ID 배열을 Permission 객체로 변환
        const permissions = response.permissionTypes.map(id => {
          const existingPermission = ALL_PERMISSIONS.find(p => p.id === id);
          if (existingPermission) {
            return { ...existingPermission, isGranted: true };
          }
          return {
            id,
            name: id.replace('PERM_', '').replace(/_/g, ' '),
            description: '',
            isGranted: true
          };
        });
        setUserPermissions(permissions);
      }
    } catch (error) {
      console.error('권한 정보를 가져오는 중 오류 발생:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 권한 그룹별 개수 계산
  const permissionsByGroup = PERMISSION_GROUPS.map(group => {
    const groupPermissions = userPermissions.filter(p => {
      if (group.id === 'admin') return p.id === 'PERM_ADMIN';
      return p.id.startsWith(`PERM_${group.id.toUpperCase()}_`);
    });
    
    return {
      groupName: group.name,
      total: ALL_PERMISSIONS.filter(p => {
        if (group.id === 'admin') return p.id === 'PERM_ADMIN';
        return p.id.startsWith(`PERM_${group.id.toUpperCase()}_`);
      }).length,
      granted: groupPermissions.length
    };
  }).filter(g => g.granted > 0);

  return (
    <div className="p-6">
      <PageHeader 
        title="마이페이지" 
        description="계정 정보 확인 및 관리" 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* 프로필 정보 카드 */}
        <div className={`${currentTheme.cardBg} rounded-xl shadow-md overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className={`text-xl font-semibold ${currentTheme.text}`}>프로필 정보</h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg ${
                isEditing 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              } text-sm font-medium transition-colors`}
            >
              {isEditing ? '취소' : '수정'}
            </button>
          </div>
          
          <form onSubmit={handleProfileUpdate}>
            <div className="p-6 space-y-6">
              {/* 프로필 아바타 */}
              <div className="flex justify-center">
                <div className={`h-24 w-24 rounded-full bg-gradient-to-r ${currentTheme.profileGradient} flex items-center justify-center text-white text-2xl font-bold`}>
                  {userInfo.name ? userInfo.name.charAt(0) : '관'}
                </div>
              </div>
              
              {/* 사용자 정보 필드 */}
              <div className="space-y-4">
                <div className={`flex flex-col space-y-2 opacity-50`}>
                  <label htmlFor="userId" className={`text-sm font-medium ${currentTheme.subtext}`}>
                    사용자 ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={userInfo.userId}
                    disabled={true}
                    className={`w-full py-2 px-3 rounded-lg bg-transparent ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="name" className={`text-sm font-medium ${currentTheme.subtext}`}>
                    이름
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userInfo.name}
                      onChange={handleUserInfoChange}
                      disabled={!isEditing}
                      className={`w-full py-2 pl-10 pr-3 rounded-lg ${
                        !isEditing ? 'bg-transparent' : currentTheme.inputBg
                      } ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className={`text-sm font-medium ${currentTheme.subtext}`}>
                    이메일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                    </div>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      value={userInfo.email}
                      disabled={true}
                      className={`w-full py-2 pl-10 pr-3 rounded-lg bg-transparent ${currentTheme.text} border ${currentTheme.border} opacity-50`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="phone" className={`text-sm font-medium ${currentTheme.subtext}`}>
                    전화번호
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={userInfo.phone}
                      onChange={handleUserInfoChange}
                      disabled={!isEditing}
                      maxLength={13}
                      className={`w-full py-2 pl-10 pr-3 rounded-lg ${
                        !isEditing ? 'bg-transparent' : currentTheme.inputBg
                      } ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="jobTitle" className={`text-sm font-medium ${currentTheme.subtext}`}>
                    직책
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BriefcaseIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                    </div>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={userInfo.jobTitle}
                      onChange={handleUserInfoChange}
                      disabled={!isEditing}
                      className={`w-full py-2 pl-10 pr-3 rounded-lg ${
                        !isEditing ? 'bg-transparent' : currentTheme.inputBg
                      } ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </div>
                
                <div className={`flex flex-col space-y-2 opacity-50`}>
                  <label htmlFor="createdAt" className={`text-sm font-medium ${currentTheme.subtext}`}>
                    계정 생성일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                    </div>
                    <input
                      type="text"
                      id="createdAt"
                      name="createdAt"
                      value={formatDate(userInfo.updatedAt)}
                      disabled={true}
                      className={`w-full py-2 pl-10 pr-3 rounded-lg bg-transparent ${currentTheme.text} border ${currentTheme.border}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center text-sm font-medium"
                >
                  <XMarkIcon className="h-4 w-4 mr-1.5" />
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || Object.keys(changedFields).length === 0}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium ${
                    Object.keys(changedFields).length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CheckIcon className="h-4 w-4 mr-1.5" />
                  저장
                </button>
              </div>
            )}
          </form>
        </div>
        
        <div className="space-y-8">
          {/* 비밀번호 변경 카드 */}
          <div className={`${currentTheme.cardBg} rounded-xl shadow-md overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>비밀번호 변경</h2>
            </div>
            
            <form onSubmit={handlePasswordUpdate}>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="currentPassword" className={`text-sm font-medium ${currentTheme.subtext}`}>
                      현재 비밀번호
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                      </div>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordChange.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        disabled={isLoading}
                        className={`w-full py-2 pl-10 pr-3 rounded-lg ${currentTheme.inputBg} ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="newPassword" className={`text-sm font-medium ${currentTheme.subtext}`}>
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordChange.newPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={isLoading}
                      className={`w-full py-2 px-3 rounded-lg ${currentTheme.inputBg} ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="confirmPassword" className={`text-sm font-medium ${currentTheme.subtext}`}>
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordChange.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={isLoading}
                      className={`w-full py-2 px-3 rounded-lg ${currentTheme.inputBg} ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {passwordChange.newPassword && 
                     passwordChange.confirmPassword && 
                     passwordChange.newPassword !== passwordChange.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
                  disabled={
                    isLoading ||
                    !passwordChange.currentPassword || 
                    !passwordChange.newPassword || 
                    !passwordChange.confirmPassword ||
                    passwordChange.newPassword !== passwordChange.confirmPassword
                  }
                >
                  비밀번호 변경
                </button>
              </div>
            </form>
          </div>
          
          {/* 권한 정보 카드 */}
          <div className={`${currentTheme.cardBg} rounded-xl shadow-md overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-xl font-semibold ${currentTheme.text} flex items-center`}>
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
                권한 정보
              </h2>
            </div>
            
            <div className="p-6">
              {loadingPermissions ? (
                <div className="flex justify-center items-center py-4">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">권한 정보를 불러오는 중...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPermissions.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        총 {userPermissions.length}개의 권한이 있습니다.
                      </div>
                      {PERMISSION_GROUPS.map(group => {
                        const groupPermissions = userPermissions.filter(p => {
                          if (group.id === 'admin') return p.id === 'PERM_ADMIN';
                          return p.id.startsWith(`PERM_${group.id.toUpperCase()}_`);
                        });

                        if (groupPermissions.length === 0) return null;

                        return (
                          <div key={group.id} className="space-y-2">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                              <h3 className={`text-sm font-medium ${currentTheme.text}`}>{group.name}</h3>
                            </div>
                            <div className="pl-4 space-y-2">
                              {groupPermissions.map(permission => {
                                const fullPermission = ALL_PERMISSIONS.find(p => p.id === permission.id);
                                return (
                                  <div 
                                    key={permission.id} 
                                    className="flex items-start py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                                  >
                                    <CheckIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-sm text-blue-700 dark:text-blue-400 font-medium block">
                                        {fullPermission?.name || permission.name}
                                      </span>
                                      {fullPermission?.description && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                                          {fullPermission.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      권한 정보가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 