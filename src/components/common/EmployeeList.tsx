"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import EmployeeDetailPanel from "./EmployeeDetailPanel";
import { useUserStore, UserResponse } from "@/lib/userStore";
import { Permission } from "@/lib/permissions";

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
  const { users, isLoading, error, fetchUsersOfCompany } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // API를 통해 직원 정보 가져오기
  useEffect(() => {
    fetchUsersOfCompany();
  }, [fetchUsersOfCompany]);

  // API 데이터를 Employee 형식으로 변환하는 함수
  const convertUserToEmployee = (user: UserResponse): Employee => {
    return {
      id: user.userId.toString(),
      name: user.name,
      position: user.jobTitle || "직원", // jobTitle이 없는 경우 '직원'으로 표시
      department: "", // API에서 부서 정보가 없음
      email: user.email,
      phone: user.phone,
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : "", // createdAt을 가입일로 표시
      permissions: [] // API에서 권한 정보가 없음
    };
  };

  // API 데이터만 사용
  const employeeData = users.map(convertUserToEmployee);

  const filteredEmployees = employeeData.filter(
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
          <p className={`mt-1 text-sm ${currentTheme.subtext}`}>총 {filteredEmployees.length}명의 직원이 있습니다</p>
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

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <span className={`${currentTheme.text}`}>직원 정보를 불러오는 중...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center p-8">
          <span className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</span>
        </div>
      ) : employeeData.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <span className={`${currentTheme.text}`}>등록된 직원이 없습니다.</span>
        </div>
      ) : (
        <>
          <div className={`overflow-x-auto rounded-xl border ${currentTheme.border}`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`bg-gray-50 dark:bg-gray-800`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>이름</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>직급</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>이메일</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>전화번호</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${currentTheme.subtext} uppercase tracking-wider`}>가입일</th>
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
                      <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text} font-medium`}>
                        {employee.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                        {employee.position}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                        {employee.email}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                        {employee.phone}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                        {employee.joinDate || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={`px-6 py-8 whitespace-nowrap text-center ${currentTheme.text}`}>
                      {searchTerm ? "검색 결과가 없습니다." : "등록된 직원이 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {filteredEmployees.length > itemsPerPage && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : `${currentTheme.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  이전
                </button>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-indigo-600 text-white"
                        : `${currentTheme.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : `${currentTheme.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  다음
                </button>
              </nav>
            </div>
          )}
        </>
      )}

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