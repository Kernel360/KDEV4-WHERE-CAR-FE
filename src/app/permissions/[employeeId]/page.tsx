"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeftIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Employee, Permission } from '@/components/common/EmployeeList';
import { useParams } from 'next/navigation';

// 샘플 권한 목록
const ALL_PERMISSIONS: Permission[] = [
  // 회사 정보 관련 권한
  { id: 'perm_company_view', name: '회사 정보 조회', description: '회사 정보를 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_company_edit', name: '회사 정보 편집', description: '회사 정보를 수정할 수 있는 권한', isGranted: false },
  
  // 직원 관련 권한
  { id: 'perm_employee_view', name: '직원 정보 조회', description: '모든 직원 정보를 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_employee_add', name: '직원 추가', description: '새로운 직원을 추가할 수 있는 권한', isGranted: false },
  { id: 'perm_employee_edit', name: '직원 정보 편집', description: '직원 정보를 수정할 수 있는 권한', isGranted: false },
  { id: 'perm_employee_delete', name: '직원 삭제', description: '직원 정보를 삭제할 수 있는 권한', isGranted: false },
  
  // 권한 관리 관련 권한
  { id: 'perm_permission_view', name: '권한 조회', description: '권한 설정을 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_permission_edit', name: '권한 편집', description: '권한 설정을 변경할 수 있는 권한', isGranted: false },
  
  // 차량 관련 권한
  { id: 'perm_vehicle_view', name: '차량 정보 조회', description: '차량 정보를 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_vehicle_add', name: '차량 추가', description: '새로운 차량을 추가할 수 있는 권한', isGranted: false },
  { id: 'perm_vehicle_edit', name: '차량 정보 편집', description: '차량 정보를 수정할 수 있는 권한', isGranted: false },
  { id: 'perm_vehicle_delete', name: '차량 삭제', description: '차량 정보를 삭제할 수 있는 권한', isGranted: false },
  
  // 로그 관련 권한
  { id: 'perm_logs_view', name: '로그 조회', description: '시스템 로그를 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_logs_export', name: '로그 내보내기', description: '시스템 로그를 내보낼 수 있는 권한', isGranted: false },
  
  // 대시보드 관련 권한
  { id: 'perm_dashboard_view', name: '대시보드 조회', description: '대시보드를 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_dashboard_edit', name: '대시보드 편집', description: '대시보드 설정을 변경할 수 있는 권한', isGranted: false },
  
  // 보고서 관련 권한
  { id: 'perm_reports_view', name: '보고서 조회', description: '보고서를 조회할 수 있는 권한', isGranted: false },
  { id: 'perm_reports_generate', name: '보고서 생성', description: '새로운 보고서를 생성할 수 있는 권한', isGranted: false },
  { id: 'perm_reports_export', name: '보고서 내보내기', description: '보고서를 내보낼 수 있는 권한', isGranted: false },
  
  // 관리자 권한
  { id: 'perm_admin', name: '관리자', description: '모든 시스템에 대한 관리자 권한', isGranted: false },
];

// 샘플 직원 데이터 (실제로는 API 호출로 대체됨)
const SAMPLE_EMPLOYEES: Record<string, Employee> = {
  "emp1": {
    id: "emp1",
    name: "김차장",
    position: "CEO",
    department: "경영진",
    email: "ceo@whercar.com",
    phone: "010-1111-2222",
    joinDate: "2018-03-15",
    permissions: ALL_PERMISSIONS.map(p => ({...p, isGranted: p.id === 'perm_admin'}))
  },
  "emp2": {
    id: "emp2",
    name: "박기술",
    position: "CTO",
    department: "기술부",
    email: "cto@whercar.com",
    phone: "010-3333-4444",
    joinDate: "2018-03-20",
    permissions: ALL_PERMISSIONS.map(p => ({...p, isGranted: p.id.startsWith('perm_vehicle_') || p.id.startsWith('perm_employee_')}))
  }
};

// 권한 그룹 정의
const PERMISSION_GROUPS = [
  { id: 'company', name: '회사 정보', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_company_')) },
  { id: 'employee', name: '직원 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_employee_')) },
  { id: 'permission', name: '권한 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_permission_')) },
  { id: 'vehicle', name: '차량 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_vehicle_')) },
  { id: 'logs', name: '로그 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_logs_')) },
  { id: 'dashboard', name: '대시보드', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_dashboard_')) },
  { id: 'reports', name: '보고서', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('perm_reports_')) },
  { id: 'admin', name: '관리자', permissions: ALL_PERMISSIONS.filter(p => p.id === 'perm_admin') },
];

export default function EmployeePermissionsPage() {
  const { currentTheme } = useTheme();
  const params = useParams();
  const employeeId = params.employeeId as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // 실제로는 API 호출을 통해 직원 정보를 가져옴
    // 샘플 데이터 사용
    const emp = SAMPLE_EMPLOYEES[employeeId];
    if (emp) {
      setEmployee(emp);
      setPermissions([...emp.permissions]);
    }
  }, [employeeId]);

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
  const handleSavePermissions = () => {
    setIsSaving(true);
    
    // 실제로는 API 호출을 통해 권한 정보를 저장
    setTimeout(() => {
      // 저장 성공 시
      setIsSaving(false);
      setSaveSuccess(true);
      
      // 3초 후 성공 메시지 숨김
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  // 검색어에 따라 권한 필터링
  const filteredGroups = searchTerm ? 
    PERMISSION_GROUPS.map(group => ({
      ...group,
      permissions: group.permissions.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.permissions.length > 0) : 
    PERMISSION_GROUPS;

  if (!employee) {
    return (
      <div className={`min-h-screen ${currentTheme.background} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
            <p className={`text-center ${currentTheme.text}`}>직원 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()}
              className={`mr-4 p-2 rounded-full ${currentTheme.cardBg} hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <ArrowLeftIcon className={`h-5 w-5 ${currentTheme.text}`} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${currentTheme.text}`}>직원 권한 관리</h1>
              <div className="flex items-center mt-1">
                <div className={`h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium mr-2`}>
                  {employee.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className={`text-lg font-medium ${currentTheme.text}`}>{employee.name}</span>
                  <span className={`text-sm ${currentTheme.subtext}`}>{employee.position} | {employee.department}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              className={`px-4 py-2 rounded-lg mr-3 border ${currentTheme.border} ${currentTheme.cardBg} ${currentTheme.text} hover:bg-gray-50 dark:hover:bg-gray-700`}
              onClick={() => window.history.back()}
            >
              취소
            </button>
            <button
              className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleSavePermissions}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </>
              ) : (
                <>
                  저장
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* 검색창 */}
        <div className={`mb-6 ${currentTheme.cardBg} p-4 rounded-xl border ${currentTheme.border}`}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="권한 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} w-full`}
            />
          </div>
        </div>
        
        {/* 저장 성공 메시지 */}
        {saveSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-xl flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            <span>권한 설정이 성공적으로 저장되었습니다.</span>
          </div>
        )}
        
        {/* 권한 그룹 */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className={`p-6 rounded-xl ${currentTheme.cardBg} shadow border ${currentTheme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <ShieldCheckIcon className={`h-5 w-5 ${currentTheme.activeText} mr-2`} />
                  <h2 className={`text-lg font-semibold ${currentTheme.text}`}>{group.name}</h2>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <span className={`mr-2 text-sm ${currentTheme.subtext}`}>전체 권한</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={group.permissions.every(p => permissions.find(perm => perm.id === p.id)?.isGranted)}
                      onChange={(e) => handleGroupPermissionChange(group.id, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {group.permissions.map((permission) => {
                  const currentPermission = permissions.find(p => p.id === permission.id);
                  const isGranted = currentPermission?.isGranted || false;
                  
                  return (
                    <div key={permission.id} className={`p-3 rounded-lg border ${currentTheme.border} ${isGranted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${currentTheme.text}`}>{permission.name}</h3>
                          <p className={`text-sm ${currentTheme.subtext} mt-1`}>{permission.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isGranted}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 