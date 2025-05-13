export type UserRole = 'admin' | 'teacher' | 'student';

export type SubjectType = 'Guitar' | 'Piano' | 'Drums' | 'Ukulele' | 'Vocal';

export type SessionType = 'Solo' | 'Duo' | 'Focus';

export type LocationType = 'Online' | 'Offline';

export type AttendanceStatus = 
  | 'Present' 
  | 'Cancelled by Student' 
  | 'Cancelled by Teacher' 
  | 'Cancelled by School' 
  | 'Scheduled'; // Default status

export type PackSize = 4 | 10 | 20 | 30;

export type WeeklyFrequency = 'once' | 'twice';

// Core interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: SubjectType[];
  availableTimes: TimeSlot[];
  maxWeeklySessions?: number; // Optional maximum sessions per week
}

export interface Student extends User {
  role: 'student';
  preferredSubjects: SubjectType[];
  packs: SessionPack[];
  preferredTeachers?: string[]; // Array of teacher IDs
  notes?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions?: string[]; // Could define specific admin permissions
}

export interface SessionPack {
  id: string;
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  purchasedDate: Date;
  expiryDate?: Date; // Optional expiry date
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: WeeklyFrequency;
  sessions: Session[]; // Reference to all sessions in this pack
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  packId: string;
  teacherId: string;
  studentIds: string[];
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: Date;
  duration: number; // in minutes
  status: AttendanceStatus;
  rescheduleCount: number;
  notes?: string;
  attendanceEvent?: AttendanceEvent; // Reference to attendance record
  rescheduleHistory?: RescheduleHistory[]; // Reference to reschedule history
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceEvent {
  id: string;
  sessionId: string;
  status: AttendanceStatus;
  markedByUserId: string; // Who marked the attendance (usually teacher or admin)
  markedAt: Date;
  notes?: string;
}

export interface RescheduleHistory {
  id: string;
  sessionId: string;
  originalDateTime: Date;
  newDateTime: Date;
  rescheduledByUserId: string; // Who requested the reschedule
  rescheduledAt: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface TimeSlot {
  id: string;
  teacherId: string;
  day: number; // 0-6, Sunday is 0
  startTime: string; // HH:MM format in 24-hour time
  endTime: string; // HH:MM format in 24-hour time
  isRecurring: boolean;
  location: LocationType;
}

export interface FilterOptions {
  teachers?: string[];
  students?: string[];
  subjects?: SubjectType[];
  sessionTypes?: SessionType[];
  locations?: LocationType[];
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus[];
}

// Additional interfaces for scheduling logic
export interface ScheduleRule {
  id: string;
  packId: string;
  dayOfWeek: number[]; // Array of days (0-6) for scheduling
  startTime: string; // HH:MM format
  frequency: WeeklyFrequency;
  isActive: boolean;
}

// Instrument availability at locations
export interface InstrumentAvailability {
  id: string;
  instrumentType: SubjectType;
  location: LocationType;
  quantity: number; // How many of this instrument are available
  isAvailable: boolean;
}

export interface AttendanceTrackerProps {
  teacherId?: string;
}

export interface StudentPacksProps {
  studentId?: string;
}
