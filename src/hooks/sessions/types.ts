
import { SubjectType, SessionType, LocationType, AttendanceStatus } from "@/lib/types";

// Define session-related types
export interface SessionWithStudents {
  id: string;
  teacherId: string;
  packId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: string;
  duration: number;
  notes?: string;
  status: AttendanceStatus;
  rescheduleCount: number;
  createdAt: string;
  updatedAt: string;
  studentIds: string[];
  teacherName?: string;
  recurrenceRule?: string;
  originalSessionId?: string;
  rescheduledFrom?: string;
}

export interface SessionsProps {
  teacherId?: string;
  studentId?: string;
  fromDate?: Date;
  toDate?: Date;
  status?: AttendanceStatus[];
}

export interface SessionUpdateProps {
  id: string;
  status?: AttendanceStatus;
  notes?: string;
  dateTime?: Date;
  teacherId?: string;
  duration?: number;
}

export interface SessionCreateProps {
  packId: string;
  teacherId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: Date;
  duration: number;
  notes?: string;
  studentIds?: string[];
  recurrenceRule?: string;
}

export interface SessionRescheduleProps {
  sessionId: string;
  newDateTime: Date;
  newDuration?: number;
  newTeacherId?: string;
  newNotes?: string;
}
