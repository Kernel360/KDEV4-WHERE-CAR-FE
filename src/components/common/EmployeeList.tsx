"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import EmployeeDetailPanel from "./EmployeeDetailPanel";

export interface Permission {
  id: string;
  name: string;
  description: string;
  isGranted: boolean;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  permissions: Permission[];
}

interface EmployeeListProps {
  // 사용하지 않는 employees props 제거
}

export default function EmployeeList(props: EmployeeListProps) {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 모의 직원 데이터
  const mockEmployees: Employee[] = [
    {
      id: "emp1",
      name: "김철수",
      position: "CEO",
      department: "경영진",
      email: "ceo@whercar.com",
      phone: "010-1234-5678",
      joinDate: "2020-01-15",
      permissions: [
        { id: 'perm_admin', name: '관리자', description: '모든 시스템에 대한 관리자 권한', isGranted: true },
        { id: 'perm_company_view', name: '회사 정보 조회', description: '회사 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_company_edit', name: '회사 정보 편집', description: '회사 정보를 수정할 수 있는 권한', isGranted: true },
        { id: 'perm_employee_view', name: '직원 정보 조회', description: '모든 직원 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_employee_edit', name: '직원 정보 편집', description: '직원 정보를 수정할 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp2",
      name: "박영희",
      position: "CTO",
      department: "개발팀",
      email: "cto@whercar.com",
      phone: "010-2345-6789",
      joinDate: "2020-02-20",
      permissions: [
        { id: 'perm_vehicle_view', name: '차량 정보 조회', description: '차량 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_vehicle_edit', name: '차량 정보 편집', description: '차량 정보를 수정할 수 있는 권한', isGranted: true },
        { id: 'perm_vehicle_add', name: '차량 추가', description: '새로운 차량을 추가할 수 있는 권한', isGranted: true },
        { id: 'perm_employee_view', name: '직원 정보 조회', description: '모든 직원 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_dashboard_view', name: '대시보드 조회', description: '대시보드를 조회할 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp3",
      name: "이지은",
      position: "팀장",
      department: "마케팅팀",
      email: "marketing@whercar.com",
      phone: "010-3456-7890",
      joinDate: "2020-03-10",
      permissions: [
        { id: 'perm_company_view', name: '회사 정보 조회', description: '회사 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_vehicle_view', name: '차량 정보 조회', description: '차량 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_reports_view', name: '보고서 조회', description: '보고서를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_reports_generate', name: '보고서 생성', description: '새로운 보고서를 생성할 수 있는 권한', isGranted: true },
        { id: 'perm_dashboard_view', name: '대시보드 조회', description: '대시보드를 조회할 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp4",
      name: "최민수",
      position: "팀장",
      department: "영업팀",
      email: "sales@whercar.com",
      phone: "010-4567-8901",
      joinDate: "2020-04-05",
      permissions: [
        { id: 'perm_company_view', name: '회사 정보 조회', description: '회사 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_vehicle_view', name: '차량 정보 조회', description: '차량 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_reports_view', name: '보고서 조회', description: '보고서를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_employee_view', name: '직원 정보 조회', description: '모든 직원 정보를 조회할 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp5",
      name: "정다운",
      position: "대리",
      department: "재무팀",
      email: "finance@whercar.com",
      phone: "010-5678-9012",
      joinDate: "2021-01-10",
      permissions: [
        { id: 'perm_company_view', name: '회사 정보 조회', description: '회사 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_reports_view', name: '보고서 조회', description: '보고서를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_reports_export', name: '보고서 내보내기', description: '보고서를 내보낼 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp6",
      name: "한미영",
      position: "사원",
      department: "인사팀",
      email: "hr@whercar.com",
      phone: "010-6789-0123",
      joinDate: "2021-02-15",
      permissions: [
        { id: 'perm_employee_view', name: '직원 정보 조회', description: '모든 직원 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_employee_add', name: '직원 추가', description: '새로운 직원을 추가할 수 있는 권한', isGranted: true },
        { id: 'perm_employee_edit', name: '직원 정보 편집', description: '직원 정보를 수정할 수 있는 권한', isGranted: true },
        { id: 'perm_logs_view', name: '로그 조회', description: '시스템 로그를 조회할 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp7",
      name: "강동우",
      position: "사원",
      department: "고객지원팀",
      email: "support@whercar.com",
      phone: "010-7890-1234",
      joinDate: "2021-03-20",
      permissions: [
        { id: 'perm_vehicle_view', name: '차량 정보 조회', description: '차량 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_company_view', name: '회사 정보 조회', description: '회사 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_logs_view', name: '로그 조회', description: '시스템 로그를 조회할 수 있는 권한', isGranted: true },
      ]
    },
    {
      id: "emp8",
      name: "송지수",
      position: "인턴",
      department: "개발팀",
      email: "intern@whercar.com",
      phone: "010-8901-2345",
      joinDate: "2022-01-05",
      permissions: [
        { id: 'perm_vehicle_view', name: '차량 정보 조회', description: '차량 정보를 조회할 수 있는 권한', isGranted: true },
        { id: 'perm_dashboard_view', name: '대시보드 조회', description: '대시보드를 조회할 수 있는 권한', isGranted: true },
      ]
    }
  ];

  const filteredEmployees = mockEmployees.filter(
    (employee) => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 이동 함수
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // 직원 선택 처리
  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  // 직원 상세 패널 닫기
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  // 직원 업데이트
  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    // 여기서는 예시로만 로그 출력. 실제로는 상태 업데이트나 API 호출 필요
    console.log("직원 정보 업데이트:", updatedEmployee);
  };

  // 직원 삭제
  const handleDeleteEmployee = (id: string) => {
    // 여기서는 예시로만 로그 출력. 실제로는 상태 업데이트나 API 호출 필요
    console.log("직원 삭제:", id);
  };

  return (
    <div className={`p-6 rounded-2xl ${currentTheme.cardBg} shadow-lg border ${currentTheme.border}`}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${currentTheme.text}`}>직원 목록</h2>
          <p className={`mt-1 text-sm ${currentTheme.subtext}`}>총 {mockEmployees.length}명의 직원이 있습니다</p>
        </div>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 검색어 변경 시 첫 페이지로 이동
              }}
              className={`pl-10 pr-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} ${currentTheme.text} w-full`}
            />
          </div>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-xl border ${currentTheme.border}`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`bg-gray-50 dark:bg-gray-800`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>이름</th>
              <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>직급</th>
              <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>이메일</th>
              <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>전화번호</th>
              <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>입사일</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
            {currentItems.length > 0 ? (
              currentItems.map((employee) => (
                <tr 
                  key={employee.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium`}>
                        {employee.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className={`font-medium ${currentTheme.text}`}>{employee.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme.text}`}>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${currentTheme.border}`}>
                      {employee.position}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme.text}`}>
                    <a 
                      href={`mailto:${employee.email}`} 
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()} // 이메일 링크 클릭 시 행 클릭 이벤트가 발생하지 않도록
                    >
                      {employee.email}
                    </a>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme.text}`}>{employee.phone}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme.text}`}>{employee.joinDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={`px-6 py-8 text-center text-sm ${currentTheme.text}`}>
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>검색 결과가 없습니다.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className={`pt-4 px-6 mt-4 ${currentTheme.subtext}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            {filteredEmployees.length > 0 ? 
              `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredEmployees.length)}명 / 총 ${filteredEmployees.length}명 표시` : 
              "0명 / 총 0명 표시"}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1 
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed" 
                    : `${currentTheme.cardBg} hover:bg-gray-50 dark:hover:bg-gray-700 ${currentTheme.text}`
                } border ${currentTheme.border}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === number
                      ? "bg-blue-600 text-white"
                      : `${currentTheme.cardBg} hover:bg-gray-50 dark:hover:bg-gray-700 ${currentTheme.text}`
                  } border ${currentTheme.border}`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages 
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed" 
                    : `${currentTheme.cardBg} hover:bg-gray-50 dark:hover:bg-gray-700 ${currentTheme.text}`
                } border ${currentTheme.border}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 직원 상세 정보 패널 */}
      <EmployeeDetailPanel
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        employee={selectedEmployee}
        onUpdate={handleUpdateEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
} 