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
  note?: string;
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