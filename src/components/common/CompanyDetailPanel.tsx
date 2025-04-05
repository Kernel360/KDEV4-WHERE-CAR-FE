"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  XMarkIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  InformationCircleIcon,
  CalendarIcon,
  PencilIcon, 
  TrashIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';
import { useCompanyStore, CompanyRequest } from '@/lib/companyStore';

export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  website: string;
}

interface CompanyDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onUpdate?: (company: Company) => void;
}

export default function CompanyDetailPanel({ 
  isOpen, 
  onClose, 
  company, 
  onUpdate 
}: CompanyDetailPanelProps) {
  const { currentTheme } = useTheme();
  const { updateMyCompany, updating, updateError, updateSuccess } = useCompanyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEdit = () => {
    if (company) {
      setEditedCompany({ ...company });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCompany(null);
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (editedCompany) {
      setSaveError(null);
      
      try {
        // API로 회사 정보 업데이트
        const companyRequest: CompanyRequest = {
          name: editedCompany.name,
          address: editedCompany.address,
          phone: editedCompany.phone,
          email: editedCompany.email,
          description: editedCompany.description,
          website: editedCompany.website
        };
        
        const success = await updateMyCompany(companyRequest);
        
        if (success) {
          if (onUpdate) {
            onUpdate(editedCompany);
          }
          
          setIsEditing(false);
          setEditedCompany(null);
          
          // 잠시 후 패널 닫기 (사용자가 성공 메시지를 볼 수 있도록)
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setSaveError('회사 정보를 업데이트하는 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('회사 정보 업데이트 중 오류 발생:', error);
        setSaveError('회사 정보를 업데이트하는 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말로 회사 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 실제 API가 없으므로 알림만 표시
      alert('회사 정보 삭제 기능이 구현되지 않았습니다. 관리자에게 문의하세요.');
    }
  };

  const handleInputChange = (field: keyof Company, value: string | number) => {
    if (editedCompany) {
      setEditedCompany({
        ...editedCompany,
        [field]: value
      });
    }
  };

  if (!company) return null;

  const displayCompany = isEditing && editedCompany ? editedCompany : company;

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
                          회사 상세 정보
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
                                className={`rounded-md ${currentTheme.text} hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleSaveEdit}
                                disabled={updating}
                              >
                                <span className="sr-only">저장</span>
                                {updating ? (
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
                      {/* 정보 업데이트 성공 메시지 */}
                      {updateSuccess && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                          <p className="text-sm font-medium">회사 정보가 성공적으로 업데이트되었습니다.</p>
                        </div>
                      )}
                      
                      {/* 에러 메시지 */}
                      {(saveError || updateError) && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                          <p className="text-sm font-medium">{saveError || updateError}</p>
                        </div>
                      )}
                      
                      <div className="space-y-8">
                        {/* 회사 프로필 헤더 */}
                        <div className="flex flex-col items-center">
                          <div className={`h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold mb-4`}>
                            <BuildingOfficeIcon className="h-12 w-12" />
                          </div>
                          
                          <div className="text-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedCompany?.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full text-center rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                            ) : (
                              <h3 className={`text-xl font-bold ${currentTheme.text}`}>{displayCompany.name}</h3>
                            )}
                          </div>
                        </div>
                        
                        {/* 회사 상세 정보 */}
                        <div className="space-y-4">
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <MapPinIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>주소</p>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editedCompany?.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayCompany.address}</p>
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
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>연락처</p>
                                {isEditing ? (
                                  <input
                                    type="tel"
                                    value={editedCompany?.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayCompany.phone}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
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
                                    value={editedCompany?.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <a 
                                    href={`mailto:${displayCompany.email}`} 
                                    className={`text-base font-semibold ${currentTheme.text} hover:underline`}
                                  >
                                    {displayCompany.email}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <svg className={`h-5 w-5 ${currentTheme.activeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>웹사이트</p>
                                {isEditing ? (
                                  <input
                                    type="url"
                                    value={editedCompany?.website || ''}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <a 
                                    href={displayCompany.website} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-base font-semibold ${currentTheme.text} hover:underline`}
                                  >
                                    {displayCompany.website}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${currentTheme.border} border`}>
                            <div className="flex items-start">
                              <div className={`p-2 rounded-lg ${currentTheme.activeBg} flex-shrink-0`}>
                                <InformationCircleIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>회사 소개</p>
                                {isEditing ? (
                                  <textarea
                                    rows={4}
                                    value={editedCompany?.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base ${currentTheme.text} leading-relaxed`}>{displayCompany.description}</p>
                                )}
                              </div>
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