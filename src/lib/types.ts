
export type UserRole = 'admin' | 'teacher' | 'student';

export type AttendanceStatus = 'Present' | 'Absent' | 'Scheduled' | 'Cancelled by Student' | 
                        'Cancelled by Teacher' | 'Cancelled by School' | 'No Show';

export type SubjectType = 'Guitar' | 'Piano' | 'Drums' | 'Ukulele' | 'Vocal';

export type SessionType = 'Solo' | 'Duo' | 'Focus';

export type LocationType = 'Online' | 'Offline';

export type PackSize = 4 | 10 | 20 | 30;

export type WeeklyFrequency = 'once' | 'twice';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: SubjectType[];
  maxWeeklySessions?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  preferredSubjects?: SubjectType[];
  preferredTeachers?: string[];
  notes?: string;
  status?: 'active' | 'inactive'; // Adding status field
}

export interface Session {
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
  studentNames?: string[]; // Adding studentNames field
  createdAt: string | Date;
  updatedAt: string | Date;
  recurrenceRule?: string;
  originalSessionId?: string;
  rescheduledFrom?: string;
}

export interface SessionPack {
  id: string;
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  purchasedDate: string | Date;
  expiryDate?: string | Date;
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: WeeklyFrequency;
  sessions?: Session[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AttendanceEvent {
  id: string;
  sessionId: string;
  status: AttendanceStatus;
  markedByUserId: string;
  markedAt: string | Date;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Complete FilterOptions with all possible filter fields
export interface FilterOptions {
  teacherId?: string;
  studentId?: string;
  subject?: SubjectType;
  sessionType?: SessionType;
  location?: LocationType;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: AttendanceStatus | AttendanceStatus[];
  searchTerm?: string;
  teachers?: string[];
  students?: string[];
  subjects?: SubjectType[];
  sessionTypes?: SessionType[];
  locations?: LocationType[];
  courseIds?: string[];
  planIds?: string[];
  paymentStatus?: string[];
}

// Updated UserWithRole to match what's used in UserManagement.tsx
export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string | Date;
  updatedAt?: string | Date;
  studentData?: {
    preferredSubjects?: SubjectType[];
    notes?: string;
    preferredTeachers?: string[];
  };
  teacherData?: {
    subjects?: SubjectType[];
    maxWeeklySessions?: number;
    availableTimes?: any[];
  };
  adminData?: {
    permissions?: string[];
  };
}

export interface Reminder {
  id: string;
  type: "session" | "payment" | "enrollment" | "other";
  recipient_id: string;
  related_id?: string;
  message: string;
  send_at: string | Date;
  sent_at?: string | Date;
  status: "pending" | "sent" | "failed" | "cancelled";
  channel: "email" | "in_app" | "sms" | "push";
  created_at: string | Date;
}

// Add SessionWithStudents interface
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
  studentNames?: string[]; // Optional student names array
  rescheduleCount: number;
  createdAt: string;
  updatedAt: string;
  recurrenceRule?: string;
  originalSessionId?: string;
  rescheduledFrom?: string;
}

export interface BulkUpload {
  id: string;
  admin_id: string;
  upload_type: 'students' | 'session_packs' | 'sessions';
  file_name: string;
  file_path: string;
  status: 'processing' | 'completed' | 'failed';
  total_rows: number | null;
  successful_rows: number;
  failed_rows: number;
  result_summary: {
    errors?: { row: number; message: string }[];
    warnings?: { row: number; message: string }[];
    success?: { row: number; id: string }[];
  } | null;
  created_at: string | Date;
  updated_at: string | Date;
}
