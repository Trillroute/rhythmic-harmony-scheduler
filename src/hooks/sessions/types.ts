
import { AttendanceStatus, SubjectType, SessionType, LocationType } from '@/lib/types';

export interface SessionsProps {
  fromDate?: Date;
  toDate?: Date;
  teacherId?: string;
  studentId?: string;
  status?: AttendanceStatus[];
  page?: number;
  pageSize?: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}
