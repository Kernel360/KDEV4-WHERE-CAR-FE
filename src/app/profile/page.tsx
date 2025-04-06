"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/lib/authStore";
import PageHeader from "@/components/common/PageHeader";
import { useToast } from "@/contexts/ToastContext";
import { UserIcon, EnvelopeIcon, KeyIcon, CheckIcon, XMarkIcon, PhoneIcon, BriefcaseIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { fetchApi } from "@/lib/api";

// 백엔드 API 응답 인터페이스
interface UserResponse {
  userId: number;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  createdAt: string;
  updatedAt?: string;
}

// 프론트엔드 유저 정보 인터페이스
interface UserInfo {
  userId: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  updatedAt: Date | string | null;
}

// 비밀번호 변경 인터페이스
interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { currentTheme } = useTheme();
  const { user, token } = useAuthStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  
  // 유저 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userId: '',
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    updatedAt: null
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

  // 사용자 정보 로드
  useEffect(() => {
    // 이미 API 오류가 발생한 경우 다시 시도하지 않음
    if (apiError) {
      return;
    }
    
    // 백엔드 API 사용 여부 (서버 준비 안된 경우 false로 설정)
    const useBackendApi = true;

    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        
        if (useBackendApi) {
          // 실제 백엔드 API 호출
          const response = await fetchApi<UserResponse>('/api/users/my');
          
          // API 응답을 UserInfo 형태로 변환 - 각 필드에 대한 유효성 검사 추가
          const userInfo: UserInfo = {
            userId: response.userId ? response.userId.toString() : '',
            name: response.name || '',
            email: response.email || '',
            phone: response.phone || '',
            jobTitle: response.jobTitle || '',
            updatedAt: response.updatedAt ? new Date(response.updatedAt) : null
          };
          
          setUserInfo(userInfo);
        } else {
          // 백엔드 API가 준비되지 않은 경우 기본 데이터 사용
          // 로컬 상태에 있는 기본 데이터 그대로 유지
          // 또는 더 자세한 목업 데이터로 설정
          const mockUserData: UserInfo = {
            userId: '',
            name: user?.name || "사용자",
            email: user?.email || "user@example.com",
            phone: "010-1234-5678",
            jobTitle: "관리자",
            updatedAt: null
          };
          
          // 약간의 지연 시간을 추가하여 로딩 상태 시각화
          setTimeout(() => {
            setUserInfo(mockUserData);
            setIsLoading(false);
          }, 800);
          
          return; // setTimeout으로 비동기 처리되므로 여기서 종료
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
        showToast('서버와 통신 중 오류가 발생했습니다. 기본 정보를 표시합니다.', 'info');
        setApiError(true);
        
        // 오류 발생 시에도 기본 데이터로 UI 표시
        const fallbackUserData: UserInfo = {
          userId: '',
          name: user?.name || "사용자",
          email: user?.email || "user@example.com",
          phone: "010-1234-5678",
          jobTitle: "관리자",
          updatedAt: null
        };
        
        setUserInfo(fallbackUserData);
        setIsLoading(false);
      }
    };

    // 토큰이 있거나 백엔드 API를 사용하지 않을 경우에만 호출
    if ((token || !useBackendApi) && !apiError) {
      fetchUserInfo();
    }
  }, [token, showToast, user, apiError]);
  
  // 사용자 정보 핸들러
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
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
        
        // API 호출
        const response = await fetchApi<UserResponse>('/api/users/my', undefined, {
          method: 'PUT',
          body: JSON.stringify(userRequest)
        });
        
        // API 응답을 UserInfo 형태로 변환 - userId가 없는 경우 기존 값 유지
        const updatedUserInfo: UserInfo = {
          userId: response.userId ? response.userId.toString() : userInfo.userId,
          name: response.name || userInfo.name,
          email: response.email || userInfo.email,
          phone: response.phone || userInfo.phone,
          jobTitle: response.jobTitle || userInfo.jobTitle,
          updatedAt: response.updatedAt ? new Date(response.updatedAt) : new Date()
        };
        
        setUserInfo(updatedUserInfo);
      } else {
        // 백엔드 API가 준비되지 않은 경우 로컬에서 처리
        // 변경된 필드를 현재 상태에 적용
        const updatedInfo = { ...userInfo, updatedAt: new Date() };
        
        // 약간의 지연 시간 추가로 프로세스 시각화
        setTimeout(() => {
          setUserInfo(updatedInfo);
          setIsLoading(false);
          showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
          setIsEditing(false);
          setChangedFields({});
        }, 800);
        
        return; // setTimeout으로 비동기 처리되므로 여기서 종료
      }
      
      showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
      setIsEditing(false);
      setChangedFields({});
      setIsLoading(false);
    } catch (error) {
      console.error('프로필 업데이트 중 오류가 발생했습니다:', error);
      showToast('프로필 업데이트에 실패했습니다. 나중에 다시 시도해 주세요.', 'error');
      setIsLoading(false);
    }
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 확인 검증
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      showToast('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 백엔드 API 사용 여부 (서버 준비 안된 경우 false로 설정)
      const useBackendApi = true;
      
      if (useBackendApi) {
        // API 호출
        await fetchApi('/api/users/my/password', undefined, {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword: passwordChange.currentPassword,
            newPassword: passwordChange.newPassword
          })
        });
      } else {
        // 백엔드 API가 준비되지 않은 경우 성공 시뮬레이션
        // 약간의 지연 시간 추가로 프로세스 시각화
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
      
      // 폼 초기화
      setPasswordChange({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('비밀번호 변경 중 오류가 발생했습니다:', error);
      showToast('비밀번호 변경에 실패했습니다. 나중에 다시 시도해 주세요.', 'error');
      setIsLoading(false);
    }
  };
  
  // 취소 버튼 처리
  const handleCancelEdit = () => {
    setIsEditing(false);
    // API에서 가져온 원래 데이터로 초기화
    setChangedFields({});
    
    // 백엔드 API 사용 여부와 이전 오류 발생 여부 확인
    const useBackendApi = true;
    
    if (useBackendApi && !apiError) {
      // 이전에 API 오류가 없는 경우에만 API 재호출
      const fetchUserInfo = async () => {
        try {
          const response = await fetchApi<UserResponse>('/api/users/my');
          // API 응답을 UserInfo 형태로 변환 - 각 필드에 대한 유효성 검사 추가
          const userInfo: UserInfo = {
            userId: response.userId ? response.userId.toString() : '',
            name: response.name || '',
            email: response.email || '',
            phone: response.phone || '',
            jobTitle: response.jobTitle || '',
            updatedAt: response.updatedAt ? new Date(response.updatedAt) : null
          };
          
          setUserInfo(userInfo);
        } catch (error) {
          console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
          showToast('서버와 통신 중 오류가 발생했습니다. 기본 정보를 표시합니다.', 'info');
          setApiError(true);
          // 이미 기본 데이터가 로드되어 있으므로 추가 조치 필요 없음
        }
      };
      fetchUserInfo();
    } else {
      // 백엔드 API가 준비되지 않은 경우 또는 이전에 오류가 발생한 경우
      // 그냥 원래 상태로 복원 (실제로는 변경되지 않으므로 추가 작업 필요 없음)
    }
  };
  
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
                      onChange={handleUserInfoChange}
                      disabled={!isEditing}
                      className={`w-full py-2 pl-10 pr-3 rounded-lg ${
                        !isEditing ? 'bg-transparent' : currentTheme.inputBg
                      } ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
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
                      className={`w-full py-2 pl-10 pr-3 rounded-lg ${
                        !isEditing ? 'bg-transparent' : currentTheme.inputBg
                      } ${currentTheme.text} border ${currentTheme.border} focus:ring-blue-500 focus:border-blue-500`}
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
                
                {userInfo.updatedAt && (
                  <div className={`flex flex-col space-y-2 opacity-50`}>
                    <label htmlFor="updatedAt" className={`text-sm font-medium ${currentTheme.subtext}`}>
                      최근 수정일
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className={`h-5 w-5 ${currentTheme.iconColor}`} />
                      </div>
                      <input
                        type="text"
                        id="updatedAt"
                        name="updatedAt"
                        value={formatDate(userInfo.updatedAt)}
                        disabled={true}
                        className={`w-full py-2 pl-10 pr-3 rounded-lg bg-transparent ${currentTheme.text} border ${currentTheme.border}`}
                      />
                    </div>
                  </div>
                )}
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
        
        {/* 비밀번호 변경 카드 */}
        <div className={`${currentTheme.cardBg} rounded-xl shadow-md overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${currentTheme.text}`}>비밀번호 변경</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate}>
            <div className="p-6 space-y-6">
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
            
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
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
      </div>
    </div>
  );
} 