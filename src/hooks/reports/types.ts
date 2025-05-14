
// Report period options for filtering
export type ReportPeriod = 
  | 'today' 
  | 'this_week' 
  | 'this_month' 
  | 'last_month' 
  | 'custom';

// Attendance report data structure
export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  categories: string[];
  data: number[];
}

// Subject distribution data structure
export interface SubjectDistributionItem {
  subject: string;
  count: number;
}

export type SubjectDistributionData = SubjectDistributionItem[];

// Session type data structure
export interface SessionTypeSubject {
  subject: string;
  count: number;
}

export interface SessionTypeItem {
  sessionType: string;
  count: number;
  subjects?: SessionTypeSubject[];
}

export type SessionTypeData = SessionTypeItem[];

// Sessions over time data structure
export interface SessionsTimeItem {
  date: string;
  count: number;
}

export type SessionsReportData = SessionsTimeItem[];

// Student progress data structure
export interface StudentProgressItem {
  student: {
    id: string;
    name: string;
  };
  progress: {
    id: string;
    courseName: string;
    instrument: string;
    completionPercentage: number;
  };
}

export type StudentProgressData = StudentProgressItem[];
