"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeftIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Employee } from '@/components/common/EmployeeList';
import { useParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/userStore';
import { Permission, ALL_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions';

// 샘플 직원 데이터 - 실제로는 API에서 가져온 데이터로 대체됩니다
const SAMPLE_EMPLOYEES: Record<string, Employee> = {
  "emp1": {
    id: "emp1",
    name: "홍길동",
    position: "CEO",
    department: "경영",
    email: "hong@example.com",
    phone: "010-1234-5678",
    joinDate: "2022-01-01",
    permissions: [
      ALL_PERMISSIONS.find(p => p.id === 'PERM_ADMIN') as Permission,
    ].map(p => ({...p, isGranted: true}))
  },
  "emp2": {
    id: "emp2",
    name: "김영희",
    position: "매니저",
    department: "영업",
    email: "kim@example.com",
    phone: "010-2345-6789",
    joinDate: "2022-02-15",
    permissions: [
      ...ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_VEHICLE_')),
      ...ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_EMPLOYEE_')),
    ].map(p => ({...p, isGranted: true}))
  },
  "emp3": {
    id: "emp3",
    name: "이철수",
    position: "사원",
    department: "개발",
    email: "lee@example.com",
    phone: "010-3456-7890",
    joinDate: "2022-03-10",
    permissions: [
      ALL_PERMISSIONS.find(p => p.id === 'PERM_VEHICLE_VIEW') as Permission,
      ALL_PERMISSIONS.find(p => p.id === 'PERM_EMPLOYEE_VIEW') as Permission,
      ALL_PERMISSIONS.find(p => p.id === 'PERM_COMPANY_VIEW') as Permission,
    ].map(p => ({...p, isGranted: true}))
  },
};

export default function EmployeePermissionsPage() {
  const { currentTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.employeeId as string;
  const { users, userPermissions, loadingPermissions, permissionsError, fetchUserPermissions, 
    updateUserPermissions, savingPermissions, savePermissionsError, savePermissionsSuccess, fetchUser } = useUserStore();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // 권한을 그룹별로 정렬하는 함수
  const getGroupedPermissions = useCallback(() => {
    const groups = PERMISSION_GROUPS.map(group => ({
      ...group,
      permissions: permissions.filter(p => {
        if (group.id === 'admin') return p.id === 'PERM_ADMIN';
        return p.id.startsWith(`PERM_${group.id.toUpperCase()}_`);
      })
    }));
    
    return groups;
  }, [permissions]);

  // 검색어에 따라 권한 필터링
  const filteredGroups = useMemo(() => {
    const groupedPermissions = getGroupedPermissions();
    
    if (!searchTerm) {
      return groupedPermissions;
    }
    
    const filtered = groupedPermissions.map(group => ({
      ...group,
      permissions: group.permissions.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.permissions.length > 0);
    
    return filtered;
  }, [searchTerm, getGroupedPermissions]);

  useEffect(() => {
    if (!params?.employeeId) {
      router.push('/employees');
      return;
    }

    const employeeId = params.employeeId as string;
    const fetchEmployeeData = async () => {
      setLoadingEmployee(true);
      setEmployeeError(null);

      try {
        // 직원 정보가 이미 store에 있는지 확인
        let user = users.find(u => u.userId.toString() === employeeId);
        
        // store에 없으면 API에서 직접 가져오기 시도
        if (!user) {
          console.log(`ID ${employeeId}의 직원 정보를 store에서 찾을 수 없어 API에서 직접 가져옵니다.`);
          user = await fetchUser(employeeId);
        }
        
        if (user) {
          // 기존 Employee 형식으로 변환
          setEmployee({
            id: user.userId.toString(),
            name: user.name,
            position: user.jobTitle || "직원",
            department: "",
            email: user.email,
            phone: user.phone,
            joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : "",
            permissions: []
          });
          console.log(`ID ${employeeId}의 직원 정보를 성공적으로 가져왔습니다:`, user.name);
        } else {
          // API에서도 찾지 못한 경우 샘플 데이터 확인
          const emp = SAMPLE_EMPLOYEES[employeeId];
          if (emp) {
            setEmployee(emp);
            console.log(`ID ${employeeId}의 직원 정보를 샘플 데이터에서 가져왔습니다.`);
          } else {
            // 직원 정보를 찾을 수 없는 경우 기본 직원 정보 생성
            console.log(`ID ${employeeId}의 직원 정보를 찾을 수 없어 기본 정보를 생성합니다.`);
            setEmployee({
              id: employeeId,
              name: "알 수 없는 사용자",
              position: "직원",
              department: "",
              email: "",
              phone: "",
              joinDate: "",
              permissions: []
            });
          }
        }
      } catch (error) {
        console.error("직원 정보 로딩 중 오류 발생:", error);
        setEmployeeError("직원 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoadingEmployee(false);
      }
    };

    fetchEmployeeData();
  }, [params, router, users, fetchUser]);

  // 권한 정보 가져오기
  useEffect(() => {
    if (!params?.employeeId) return;
    const employeeId = params.employeeId as string;
    if (employee) {
      fetchUserPermissions(employeeId);
    }
  }, [params, employee, fetchUserPermissions]);

  useEffect(() => {
    if (!params?.employeeId) return;
    const employeeId = params.employeeId as string;
    // 기본적으로 모든 권한을 isGranted가 false인 상태로 초기화
    const allPermissionsCopy = ALL_PERMISSIONS.map(p => ({...p, isGranted: false}));
    
    // API에서 가져온 권한 정보가 있으면 해당 권한들을 부여된 상태(isGranted: true)로 표시
    if (userPermissions && userPermissions[employeeId]) {
      const permissions = userPermissions[employeeId];
      
      if (Array.isArray(permissions) && permissions.length > 0) {
        const grantedPermissionIds = new Set(permissions.map(p => p.id));
        
        // 부여된 권한은 isGranted를 true로 설정
        allPermissionsCopy.forEach(p => {
          if (grantedPermissionIds.has(p.id)) {
            p.isGranted = true;
          }
        });
      }
    } 
    // API에서 권한 정보를 가져오지 못했고, 샘플 직원 데이터가 있으면 샘플 권한 사용
    else if (employee && employee.permissions && Array.isArray(employee.permissions) && employee.permissions.length > 0) {
      const grantedPermissionIds = new Set(employee.permissions.map(p => p.id));
      
      // 부여된 권한은 isGranted를 true로 설정
      allPermissionsCopy.forEach(p => {
        if (grantedPermissionIds.has(p.id)) {
          p.isGranted = true;
        }
      });
    }
    
    setPermissions(allPermissionsCopy);
  }, [params, userPermissions, employee]);

  // 권한 변경 처리
  const handlePermissionChange = (permissionId: string, isGranted: boolean) => {
    setPermissions(prev => prev.map(p => 
      p.id === permissionId ? { ...p, isGranted } : p
    ));
  };

  // 권한 그룹 전체 변경 처리
  const handleGroupPermissionChange = (groupId: string, isGranted: boolean) => {
    const groupPermissionIds = PERMISSION_GROUPS.find(g => g.id === groupId)?.permissions.map(p => p.id) || [];
    
    setPermissions(prev => prev.map(p => 
      groupPermissionIds.includes(p.id) ? { ...p, isGranted } : p
    ));
  };

  // 권한 저장 처리
  const handleSavePermissions = async () => {
    // API를 통해 권한 정보를 저장
    await updateUserPermissions(employeeId, permissions);
  };

  // 뒤로가기 함수
  const handleGoBack = () => {
    router.back();
  };

  if (loadingEmployee) {
    return (
      <div className={`min-h-screen ${currentTheme.background} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} flex items-center justify-center`}>
            <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={`${currentTheme.text}`}>직원 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (employeeError) {
    return (
      <div className={`min-h-screen ${currentTheme.background} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
            <div className="text-center">
              <p className="text-red-500 mb-4">{employeeError}</p>
              <Link href="/employees">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  직원 목록으로 돌아가기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={`min-h-screen ${currentTheme.background} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border} flex items-center justify-center`}>
            <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={`${currentTheme.text}`}>직원 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className={`min-h-screen ${currentTheme.background} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
            <div className="text-center">
              <p className="text-red-500 mb-4">권한 정보를 불러오는 중 오류가 발생했습니다.</p>
              <button
                onClick={() => fetchUserPermissions(employeeId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={handleGoBack} className={`mr-4 p-2 rounded-full hover:${currentTheme.hoverBg}`}>
              <ArrowLeftIcon className={`h-5 w-5 ${currentTheme.text}`} />
            </button>
            <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
              {employee?.name} 권한 관리
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="권한 이름 또는 설명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`p-2 pr-8 rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text}`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className={`h-4 w-4 ${currentTheme.subtext}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={handleSavePermissions}
              disabled={savingPermissions || loadingPermissions}
              className={`px-4 py-2 rounded-lg ${
                (savingPermissions || loadingPermissions) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white flex items-center`}
            >
              {savingPermissions ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  권한 저장
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* 저장 알림 */}
        {savePermissionsSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
              권한이 성공적으로 저장되었습니다.
            </div>
          </div>
        )}
        
        {/* 저장 오류 */}
        {savePermissionsError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z" clipRule="evenodd" />
              </svg>
              {savePermissionsError}
            </div>
          </div>
        )}
        
        {/* 권한 그룹 */}
        <div className="space-y-6">
          {loadingPermissions ? (
            <div className="mb-4 p-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>권한 정보를 불러오는 중...</span>
              </div>
            </div>
          ) : filteredGroups.length > 0 ? (
            <>
              {filteredGroups.map((group) => (
                <div key={group.id} className={`p-6 rounded-xl ${currentTheme.cardBg} shadow border ${currentTheme.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-medium ${currentTheme.text}`}>{group.name}</h2>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${currentTheme.subtext} mr-2`}>전체 권한</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={group.permissions.every(p => p.isGranted)}
                          onChange={(e) => handleGroupPermissionChange(group.id, e.target.checked)}
                          disabled={loadingPermissions}
                        />
                        <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                          peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                          peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                          after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                          after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                          ${loadingPermissions ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {group.permissions.map((permission) => (
                      <div key={permission.id} className={`p-4 rounded-lg border ${permission.isGranted 
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
                        : `${currentTheme.border} bg-gray-50 dark:bg-gray-800`}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-medium ${permission.isGranted 
                              ? 'text-green-700 dark:text-green-400' 
                              : currentTheme.text}`}>
                              {permission.name}
                            </h3>
                            <p className={`text-sm mt-1 ${currentTheme.subtext}`}>{permission.description}</p>
                          </div>
                          <div>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={permission.isGranted}
                                onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                disabled={loadingPermissions}
                              />
                              <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                                peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                                after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                                after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                                ${loadingPermissions ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className={`p-6 rounded-xl ${currentTheme.cardBg} shadow border ${currentTheme.border} text-center`}>
              <p className={`${currentTheme.text}`}>
                {searchTerm 
                  ? '검색 결과가 없습니다.' 
                  : '표시할 권한 그룹이 없습니다. 권한 조회 후 다시 시도해주세요.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  검색어 지우기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}