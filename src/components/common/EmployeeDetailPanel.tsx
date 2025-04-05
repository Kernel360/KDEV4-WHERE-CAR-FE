"use client";

import { Fragment, useState } from 'react';
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
import { Employee, Permission } from './EmployeeList';
import Link from 'next/link';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);
  const [showAllPermissions, setShowAllPermissions] = useState(false);

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

  const handleSaveEdit = () => {
    if (editedEmployee && onUpdate) {
      onUpdate(editedEmployee);
      setIsEditing(false);
      setEditedEmployee(null);
    }
  };

  const handleDelete = () => {
    if (employee && onDelete) {
      if (window.confirm('정말로 이 직원을 삭제하시겠습니까?')) {
        onDelete(employee.id);
        onClose();
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
  
  // 권한 요약 정보를 계산
  const grantedPermissionsCount = displayEmployee.permissions.filter(p => p.isGranted).length;
  const totalPermissionsCount = displayEmployee.permissions.length;
  const permissionsToShow = showAllPermissions 
    ? displayEmployee.permissions 
    : displayEmployee.permissions.filter(p => p.isGranted).slice(0, 5);

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
                                className={`rounded-md ${currentTheme.text} hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                                onClick={handleSaveEdit}
                              >
                                <span className="sr-only">저장</span>
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
                            
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedEmployee?.position || ''}
                                onChange={(e) => handleInputChange('position', e.target.value)}
                                className={`w-full text-center rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                            ) : (
                              <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium border ${currentTheme.border} rounded-full`}>
                                {displayEmployee.position}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* 직원 상세 정보 */}
                        <div className="space-y-4">
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <EnvelopeIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>이메일</p>
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={editedEmployee?.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
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
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>입사일</p>
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={editedEmployee?.joinDate || ''}
                                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayEmployee.joinDate}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <UserIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>부서</p>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedEmployee?.department || ''}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayEmployee.department}</p>
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
                            
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {`${grantedPermissionsCount}개의 권한 승인됨 (전체 ${totalPermissionsCount}개)`}
                            </div>
                            
                            <div className="mt-3 space-y-2">
                              {permissionsToShow.map(permission => (
                                <div 
                                  key={permission.id} 
                                  className={`py-1 px-2 rounded-md flex items-start ${
                                    permission.isGranted 
                                      ? 'bg-green-50 dark:bg-green-900/20' 
                                      : 'bg-gray-50 dark:bg-gray-800'
                                  }`}
                                >
                                  {permission.isGranted ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircleIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <div className={`text-sm font-medium ${
                                      permission.isGranted ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {permission.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</div>
                                  </div>
                                </div>
                              ))}

                              {displayEmployee.permissions.length > 5 && (
                                <button
                                  type="button"
                                  className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center justify-center"
                                  onClick={() => setShowAllPermissions(!showAllPermissions)}
                                >
                                  {showAllPermissions ? (
                                    <>접기 <ChevronUpIcon className="h-4 w-4 ml-1" /></>
                                  ) : (
                                    <>더 보기 ({totalPermissionsCount - 5}개) <ChevronDownIcon className="h-4 w-4 ml-1" /></>
                                  )}
                                </button>
                              )}
                            </div>
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