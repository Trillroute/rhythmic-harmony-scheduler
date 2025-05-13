
export type UserRole = 'admin' | 'teacher' | 'student';

export type AttendanceStatus = 'Present' | 'Scheduled' | 'Cancelled by Student' | 
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
}

export interface Session {
  id: string;
  teacherId: string;
  teacherName?: string;
  packId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: Date;
  duration: number;
  status: AttendanceStatus;
  notes?: string;
  rescheduleCount: number;
  studentIds: string[];
  studentNames?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPack {
  id: string;
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  purchasedDate: Date;
  expiryDate?: Date;
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: WeeklyFrequency;
  sessions?: Session[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceEvent {
  id: string;
  sessionId: string;
  status: AttendanceStatus;
  markedByUserId: string;
  markedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  teacherId?: string;
  studentId?: string;
  subject?: SubjectType;
  sessionType?: SessionType;
  location?: LocationType;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  searchTerm?: string;
}

export interface ExtendedFilterOptions {
  teachers?: string[];
  students?: string[];
  subjects?: SubjectType[];
  sessionTypes?: SessionType[];
  locations?: LocationType[];
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus[];
  courseIds?: string[];
  planIds?: string[];
  paymentStatus?: string[];
}

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  type: "session" | "payment" | "enrollment" | "other";
  recipient_id: string;
  related_id?: string;
  message: string;
  send_at: string;
  sent_at?: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  channel: "email" | "in_app" | "sms" | "push";
  created_at: string;
}
