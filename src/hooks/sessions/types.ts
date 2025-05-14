
import { AttendanceStatus, SubjectType, SessionType, LocationType } from '@/lib/types';

/**
 * Props for session-related hooks
 */
export interface SessionsProps {
  teacherId?: string;
  studentId?: string;
  fromDate?: Date;
  toDate?: Date;
  status?: Array<string>;
}

/**
 * Session data for creating sessions
 */
export interface SessionData {
  teacherId: string;
  packId: string;
  subject: SubjectType; 
  sessionType: SessionType;
  location: LocationType;
  dateTime: Date | string;
  duration?: number;
  notes?: string;
  studentIds?: string[];
  recurrenceRule?: string;
}

/**
 * Session update data
 */
export interface SessionUpdateData {
  id: string;
  status?: AttendanceStatus;
  notes?: string;
  dateTime?: Date;
  teacherId?: string;
  studentIds?: string[];
}
