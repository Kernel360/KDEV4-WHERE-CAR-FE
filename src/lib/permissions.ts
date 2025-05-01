/**
 * 권한 관련 타입과 상수를 정의하는 파일
 */

// 권한 인터페이스
export interface Permission {
  id: string;
  name: string;
  description: string;
  isGranted: boolean;
}

// 권한 그룹 인터페이스
export interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
}

// 모든 가능한 권한 목록 (기본적으로는 부여되지 않은 상태)
export const ALL_PERMISSIONS: Permission[] = [
  // 회사 정보 관련 권한
  { id: 'PERM_COMPANY_VIEW', name: '회사 정보 조회', description: '회사의 기본 정보를 조회할 수 있습니다.', isGranted: false },
  { id: 'PERM_COMPANY_EDIT', name: '회사 정보 수정', description: '회사의 기본 정보를 수정할 수 있습니다.', isGranted: false },
  
  // 직원 관련 권한
  { id: 'PERM_EMPLOYEE_VIEW', name: '직원 조회', description: '모든 직원 정보를 조회할 수 있습니다.', isGranted: false },
  { id: 'PERM_EMPLOYEE_ADD', name: '직원 추가', description: '새로운 직원을 추가할 수 있습니다.', isGranted: false },
  { id: 'PERM_EMPLOYEE_EDIT', name: '직원 수정', description: '직원 정보를 수정할 수 있습니다.', isGranted: false },
  { id: 'PERM_EMPLOYEE_DELETE', name: '직원 삭제', description: '직원을 삭제할 수 있습니다.', isGranted: false },
  
  // 권한 관리 관련 권한
  { id: 'PERM_PERMISSION_VIEW', name: '권한 조회', description: '권한 목록을 조회할 수 있습니다.', isGranted: false },
  { id: 'PERM_PERMISSION_EDIT', name: '권한 수정', description: '사용자의 권한을 수정할 수 있습니다.', isGranted: false },
  
  // 차량 관련 권한
  { id: 'PERM_VEHICLE_VIEW', name: '차량 조회', description: '모든 차량 정보를 조회할 수 있습니다.', isGranted: false },
  { id: 'PERM_VEHICLE_ADD', name: '차량 추가', description: '새로운 차량을 추가할 수 있습니다.', isGranted: false },
  { id: 'PERM_VEHICLE_EDIT', name: '차량 수정', description: '차량 정보를 수정할 수 있습니다.', isGranted: false },
  { id: 'PERM_VEHICLE_DELETE', name: '차량 삭제', description: '차량을 삭제할 수 있습니다.', isGranted: false },
  
  // 로그 관련 권한
  { id: 'PERM_LOGS_VIEW', name: '로그 조회', description: '시스템 로그를 조회할 수 있습니다.', isGranted: false },
  { id: 'PERM_LOGS_EDIT', name: '로그 수정', description: '시스템 로그를 수정할 수 있습니다.', isGranted: false },
  { id: 'PERM_LOGS_DELETE', name: '로그 삭제', description: '시스템 로그를 삭제할 수 있습니다.', isGranted: false },
  
  // 대시보드 관련 권한
  { id: 'PERM_DASHBOARD_VIEW', name: '대시보드 조회', description: '대시보드를 조회할 수 있습니다.', isGranted: false },
  { id: 'PERM_DASHBOARD_EDIT', name: '대시보드 수정', description: '대시보드를 수정할 수 있습니다.', isGranted: false },
  
  // 통계 관련 권한
  { id: 'PERM_STATS_VIEW', name: '통계 조회', description: '통계 정보를 조회할 수 있습니다.', isGranted: false },
  
  // 관리자 권한
  { id: 'PERM_ADMIN', name: '관리자', description: '시스템의 모든 기능에 접근할 수 있는 관리자 권한입니다.', isGranted: false },
];

// 권한 그룹 정의
export const PERMISSION_GROUPS: PermissionGroup[] = [
  { id: 'company', name: '회사 정보', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_COMPANY_')) },
  { id: 'employee', name: '직원 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_EMPLOYEE_')) },
  { id: 'permission', name: '권한 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_PERMISSION_')) },
  { id: 'vehicle', name: '차량 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_VEHICLE_')) },
  { id: 'logs', name: '로그 관리', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_LOGS_')) },
  { id: 'dashboard', name: '대시보드', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_DASHBOARD_')) },
  { id: 'stats', name: '통계', permissions: ALL_PERMISSIONS.filter(p => p.id.startsWith('PERM_STATS_')) },
  { id: 'admin', name: '관리자', permissions: ALL_PERMISSIONS.filter(p => p.id === 'PERM_ADMIN') },
];

// 권한 ID로부터 Permission 객체 생성
export const createPermissionFromId = (id: string): Permission => {
  // 기존 권한 목록에서 같은 ID의 권한이 있는지 확인
  const existingPermission = ALL_PERMISSIONS.find(p => p.id === id);
  
  if (existingPermission) {
    // 기존 권한 정보를 복사하고 isGranted만 true로 설정
    return {
      ...existingPermission,
      isGranted: true
    };
  }
  
  // 기존 권한이 없는 경우, 권한 ID로부터 이름과 설명 생성
  let name = id.replace('PERM_', '').replace(/_/g, ' ').toLowerCase();
  name = name.charAt(0).toUpperCase() + name.slice(1); // 첫 글자 대문자로
  
  return {
    id,
    name,
    description: `${name} 권한`,
    isGranted: true
  };
}; 