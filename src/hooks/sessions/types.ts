
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

// Add SessionData type which was missing
export interface SessionData {
  id: string;
  teacherId: string;
  teacherName?: string;
  packId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: string | Date;
  duration: number;
  status: AttendanceStatus;
  notes?: string;
  rescheduleCount: number;
  studentIds: string[];
  studentNames?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  recurrenceRule?: string;
  originalSessionId?: string;
  rescheduledFrom?: string;
}
