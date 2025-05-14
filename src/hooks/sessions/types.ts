
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

// Updated SessionData type to match what's needed for creation
export interface SessionData {
  id?: string;
  teacherId: string;
  teacherName?: string;
  packId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: string | Date;
  duration: number;
  status?: AttendanceStatus;
  notes?: string;
  rescheduleCount?: number;
  studentIds: string[];
  studentNames?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  recurrenceRule?: string;
  originalSessionId?: string;
  rescheduledFrom?: string;
}

// Add missing SessionWithStudents and SessionResult interfaces
export interface SessionWithStudents {
  id: string;
  teacherId: string;
  teacherName: string;
  packId: string;
  subject: string;
  sessionType: string;
  location: string;
  dateTime: string;
  duration: number;
  status: AttendanceStatus;
  notes: string;
  studentIds: string[];
  studentNames?: string[]; 
  rescheduleCount: number;
  createdAt: string;
  updatedAt: string;
  recurrenceRule?: string;
  originalSessionId?: string;
  rescheduledFrom?: string;
  students?: any[];
}

export interface SessionResult {
  id: string;
  teacher_id: string;
  pack_id: string;
  subject: string;
  session_type: string;
  location: string;
  date_time: string;
  duration: number;
  status: AttendanceStatus;
  notes: string;
  reschedule_count: number;
  created_at: string;
  updated_at: string;
  recurrence_rule?: string;
  original_session_id?: string;
  rescheduled_from?: string;
  teacher?: { id: string; name: string; email: string };
  students?: { student: { id: string; name: string; email: string } }[];
}
