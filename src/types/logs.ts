export type DriveType = 'PERSONAL' | 'CORPORATE' | 'UNREGISTERED';

export interface Driver {
  id: string;
  name: string;
}

export interface VehicleLog {
  id: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  startMileage: number;
  endMileage: number;
  totalDistance: number;
  driveType: DriveType;
  driver: Driver | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleLogFilter {
  vehicleNumber?: string;
  startDate?: string;
  endDate?: string;
  driveType?: DriveType;
  driverId?: string;
}

export interface CarLogResponse {
  logId: number;
  mdn: string;
  onTime: string;
  offTime: string;
  onMileage: number;
  offMileage: number;
  totalMileage: number | null;
  driveType: string;
  driver: string;
  description: string | null;
}

export interface CarLogsParams {
  page: number;
  size: number;
} 