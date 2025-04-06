"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Employee } from './EmployeeList';
import Link from 'next/link';
import { useUserStore } from '@/lib/userStore';
import { Permission, ALL_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions';

interface EmployeeDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onDelete?: (id: string) => void;
  onUpdate?: (employee: Employee) => void;
}

export default function EmployeeDetailPanel({ 
  isOpen, 
  onClose, 
  employee, 
  onDelete, 
  onUpdate 
}: EmployeeDetailPanelProps) {
  const { currentTheme } = useTheme();
  const { userPermissions, loadingPermissions, permissionsError, fetchUserPermissions, updateUser, deleteUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employee) {
      // 권한 정보 로드
      fetchUserPermissions(employee.id);
    }
  }, [isOpen, employee, fetchUserPermissions]);

  const handleEdit = () => {
    if (employee) {
      setEditedEmployee({ ...employee });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedEmployee(null);
  };

  const handleSaveEdit = async () => {
    if (editedEmployee) {
      setIsSaving(true);
      setSaveError(null);
      
      try {
        // 사용자 정보 업데이트 요청
        const userRequest = {
          name: editedEmployee.name,
          email: employee!.email, // non-null assertion 사용 (함수 시작에서 null 체크 완료)
          phone: editedEmployee.phone || '',
          jobTitle: editedEmployee.position || '',
          password: '' // 빈 문자열로 전송하면 updateUser 함수에서 제거됨
        };
        
        const success = await updateUser(editedEmployee.id, userRequest);
        
        if (success) {
          // 업데이트된 사용자 정보를 직접 가져오기
          const { users } = useUserStore.getState();
          const updatedUserData = users.find(u => u.userId.toString() === editedEmployee.id);
          
          if (updatedUserData) {
            // API에서 받은 최신 데이터로 Employee 객체 업데이트
            const updatedEmployee: Employee = {
              ...employee!, // 원본 employee 객체의 모든 속성 유지
              id: editedEmployee.id,
              name: updatedUserData.name,
              email: updatedUserData.email,
              phone: updatedUserData.phone || '',
              position: updatedUserData.jobTitle || '',
              // 다른 필드는 그대로 유지
            };
            
            if (onUpdate) {
              onUpdate(updatedEmployee);
            }
            
            // 현재 표시된 직원 정보를 업데이트된 정보로 설정
            onClose(); // 패널을 닫았다가
            setTimeout(() => {
              if (onUpdate) onUpdate(updatedEmployee); // 부모 컴포넌트에 변경 알림
            }, 100);
          } else {
            // API 데이터를 못 가져온 경우 편집한 데이터로 업데이트
            if (onUpdate) {
              onUpdate(editedEmployee);
            }
          }
          
          setIsEditing(false);
          setEditedEmployee(null);
        } else {
          setSaveError('사용자 정보를 업데이트하는 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('사용자 업데이트 중 오류 발생:', error);
        setSaveError('사용자 정보를 업데이트하는 중 오류가 발생했습니다.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (employee && onDelete) {
      if (window.confirm('정말로 이 직원을 삭제하시겠습니까?')) {
        try {
          const success = await deleteUser(employee.id);
          
          if (success) {
            onDelete(employee.id);
            onClose();
          } else {
            alert('직원 삭제 중 오류가 발생했습니다.');
          }
        } catch (error) {
          console.error('직원 삭제 중 오류 발생:', error);
          alert('직원 삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const handleInputChange = (field: keyof Employee, value: string) => {
    if (editedEmployee) {
      setEditedEmployee({
        ...editedEmployee,
        [field]: value
      });
    }
  };

  if (!employee) return null;

  const displayEmployee = isEditing && editedEmployee ? editedEmployee : employee;
  
  // 권한 정보 처리
  const mergePermissions = () => {
    // 기본적으로 모든 권한을 isGranted가 false인 상태로 초기화
    const allPermissionsCopy = ALL_PERMISSIONS.map(p => ({...p, isGranted: false}));
    
    // API에서 가져온 권한 정보가 있으면 해당 권한들을 부여된 상태(isGranted: true)로 표시
    if (userPermissions && userPermissions[employee.id]) {
      // 배열인지 확인하여 안전하게 처리
      const permissions = userPermissions[employee.id];
      
      if (Array.isArray(permissions) && permissions.length > 0) {
        const grantedPermissionIds = new Set(permissions.map(p => p.id));
        
        // 부여된 권한은 isGranted를 true로 설정
        allPermissionsCopy.forEach(p => {
          if (grantedPermissionIds.has(p.id)) {
            p.isGranted = true;
          }
        });
      }
      
      return allPermissionsCopy;
    } 
    // API에서 권한 정보를 가져오지 못했고, employee.permissions가 있으면 해당 권한 사용
    else if (employee.permissions && Array.isArray(employee.permissions) && employee.permissions.length > 0) {
      const grantedPermissionIds = new Set(employee.permissions.map(p => p.id));
      
      // 부여된 권한은 isGranted를 true로 설정
      allPermissionsCopy.forEach(p => {
        if (grantedPermissionIds.has(p.id)) {
          p.isGranted = true;
        }
      });
      
      return allPermissionsCopy;
    }
    
    return allPermissionsCopy;
  };

  // 권한 목록
  const permissions = mergePermissions();
  
  // 승인된 권한 수
  const grantedPermissionsCount = permissions.filter(p => p.isGranted).length;
  
  // 전체 권한 수
  const totalPermissionsCount = permissions.length;
  
  // 표시할 권한 목록 (모두 보기 선택 여부에 따라)
  const permissionsToShow = showAllPermissions 
    ? permissions.filter(p => p.isGranted) 
    : permissions.filter(p => p.isGranted).slice(0, 5);

  // 그룹별 권한 개수
  const permissionsByGroup = PERMISSION_GROUPS.map(group => {
    const groupPermissions = permissions.filter(p => {
      if (group.id === 'admin') return p.id === 'PERM_ADMIN';
      return p.id.startsWith(`PERM_${group.id.toUpperCase()}_`);
    });
    
    return {
      groupName: group.name,
      total: groupPermissions.length,
      granted: groupPermissions.filter(p => p.isGranted).length
    };
  }).filter(g => g.granted > 0);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className={`flex h-full flex-col overflow-y-scroll ${currentTheme.cardBg} shadow-xl`}>
                    <div className={`px-6 py-6 ${currentTheme.border} border-b`}>
                      <div className="flex items-center justify-between">
                        <Dialog.Title className={`text-xl font-semibold ${currentTheme.text}`}>
                          직원 상세 정보
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center space-x-2">
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                onClick={handleEdit}
                              >
                                <span className="sr-only">수정</span>
                                <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                                onClick={handleDelete}
                              >
                                <span className="sr-only">삭제</span>
                                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                              >
                                <span className="sr-only">저장</span>
                                {isSaving ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                              </button>
                              <button
                                type="button"
                                className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                onClick={handleCancelEdit}
                              >
                                <span className="sr-only">취소</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className={`rounded-md ${currentTheme.text} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                            onClick={onClose}
                          >
                            <span className="sr-only">닫기</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-6 py-6">
                      <div className="space-y-8">
                        {/* 직원 프로필 헤더 */}
                        <div className="flex flex-col items-center">
                          <div className={`h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold mb-4`}>
                            {displayEmployee.name.charAt(0)}
                          </div>
                          
                          <div className="text-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedEmployee?.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full text-center rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                            ) : (
                              <h3 className={`text-xl font-bold ${currentTheme.text}`}>{displayEmployee.name}</h3>
                            )}
                            
                            <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium border ${currentTheme.border} rounded-full`}>
                              {displayEmployee.position}
                            </span>
                          </div>
                        </div>
                        
                        {/* 직원 상세 정보 */}
                        <div className="space-y-4">
                          {/* 저장 오류 메시지 */}
                          {saveError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                              <p className="text-sm font-medium">{saveError}</p>
                            </div>
                          )}

                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <EnvelopeIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>이메일</p>
                                {isEditing ? (
                                  <div>
                                    <input
                                      type="email"
                                      value={editedEmployee?.email || ''}
                                      disabled={true}
                                      className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none bg-gray-100 dark:bg-gray-700 opacity-70`}
                                    />
                                    <span className="text-xs text-gray-500 italic mt-1 block">
                                      (수정 불가)
                                    </span>
                                  </div>
                                ) : (
                                  <a 
                                    href={`mailto:${displayEmployee.email}`} 
                                    className={`text-base font-semibold ${currentTheme.text} hover:underline`}
                                  >
                                    {displayEmployee.email}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <PhoneIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>전화번호</p>
                                {isEditing ? (
                                  <input
                                    type="tel"
                                    value={editedEmployee?.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayEmployee.phone}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <CalendarIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>가입일</p>
                                <div className="flex items-center">
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>
                                    {displayEmployee.joinDate || '-'}
                                  </p>
                                  {isEditing && (
                                    <span className="ml-2 text-xs text-gray-500 italic">
                                      (수정 불가)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <UserIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>직급</p>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedEmployee?.position || ''}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayEmployee.position}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* 권한 정보 */}
                          <div className="mt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">권한</h3>
                              </div>
                              <Link
                                href={`/permissions/${employee.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                              >
                                권한 관리
                                <ArrowRightIcon className="h-4 w-4 ml-1" />
                              </Link>
                            </div>
                            
                            {loadingPermissions ? (
                              <div className="mt-4 flex justify-center items-center">
                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">권한 정보를 불러오는 중...</span>
                              </div>
                            ) : permissionsError ? (
                              <div className="mt-4">
                                <p className="text-sm text-red-500">권한 정보를 불러오는 중 오류가 발생했습니다.</p>
                              </div>
                            ) : (
                              <>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                  {`${grantedPermissionsCount}개의 권한 승인됨 (전체 ${totalPermissionsCount}개)`}
                                </div>
                                
                                {grantedPermissionsCount > 0 ? (
                                  <div className="mt-3 space-y-3">
                                    {permissionsByGroup.length > 0 ? (
                                      <>
                                        {/* 권한 그룹별 요약 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {permissionsByGroup.map((group, idx) => (
                                            <div key={idx} className="py-1 px-2 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center">
                                              <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                              <div className="text-sm text-blue-700 dark:text-blue-400">
                                                {group.groupName}: <span className="font-medium">{group.granted}</span>/{group.total}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* 승인된 권한 상세 보기 토글 */}
                                        <button
                                          type="button"
                                          className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center justify-center"
                                          onClick={() => setShowAllPermissions(!showAllPermissions)}
                                        >
                                          {showAllPermissions ? (
                                            <>접기 <ChevronUpIcon className="h-4 w-4 ml-1" /></>
                                          ) : (
                                            <>상세 권한 보기 <ChevronDownIcon className="h-4 w-4 ml-1" /></>
                                          )}
                                        </button>
                                        
                                        {/* 승인된 권한 상세 목록 */}
                                        {showAllPermissions && (
                                          <div className="mt-3 space-y-2">
                                            {permissions.filter(p => p.isGranted).map(permission => (
                                              <div 
                                                key={permission.id} 
                                                className="py-1 px-2 rounded-md bg-green-50 dark:bg-green-900/20 flex items-start"
                                              >
                                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                <div>
                                                  <div className="text-sm font-medium text-green-700 dark:text-green-400">
                                                    {permission.name}
                                                  </div>
                                                  <div className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                        권한 정보가 없습니다.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    부여된 권한이 없습니다.
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 