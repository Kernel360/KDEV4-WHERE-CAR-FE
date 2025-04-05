"use client";

import { Fragment, useState } from 'react';
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

export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  foundedYear: number;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);

  const handleEdit = () => {
    if (company) {
      setEditedCompany({ ...company });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCompany(null);
  };

  const handleSaveEdit = () => {
    if (editedCompany && onUpdate) {
      onUpdate(editedCompany);
      setIsEditing(false);
      setEditedCompany(null);
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
                                <CalendarIcon className={`h-5 w-5 ${currentTheme.activeText}`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${currentTheme.subtext}`}>설립연도</p>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editedCompany?.foundedYear || ''}
                                    onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                                    className={`w-full rounded-md border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                ) : (
                                  <p className={`text-base font-semibold ${currentTheme.text}`}>{displayCompany.foundedYear}년</p>
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