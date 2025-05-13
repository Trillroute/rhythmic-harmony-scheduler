
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: SubjectType[];
  availableTimes?: TimeSlot[];
}

export interface Student extends User {
  role: 'student';
  preferredSubjects: SubjectType[];
  packs: SessionPack[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface SessionPack {
  id: string;
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  purchasedDate: Date;
  remainingSessions: number;
  isActive: boolean;
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
}

export interface TimeSlot {
  day: number; // 0-6, Sunday is 0
  startTime: string; // HH:MM format in 24-hour time
  endTime: string; // HH:MM format in 24-hour time
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
