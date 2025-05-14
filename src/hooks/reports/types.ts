
// Report period options for filtering
export type ReportPeriod = 
  | 'today' 
  | 'this_week' 
  | 'this_month' 
  | 'last_month' 
  | 'custom'
  | 'week'
  | 'month'
  | 'year'
  | 'last30days';

// Attendance report data structure
export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  categories: string[];
  data: number[];
  distribution?: any[]; // Added to match usage
  chartData?: any[];    // Added to match usage
}

// Subject distribution data structure
export interface SubjectDistributionItem {
  subject: string;
  count: number;
  name?: string; // Added to match usage in utils.ts
  value?: number; // Added to match usage in utils.ts
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
  type?: string; // Added to match usage in utils.ts and session-type-report.ts
}

export type SessionTypeData = SessionTypeItem[];

// Sessions over time data structure
export interface SessionsTimeItem {
  date: string;
  count: number;
}

export interface SessionsReportData {
  months?: string[]; // Added to match usage
  counts?: number[]; // Added to match usage
  date?: string;     // Added for compatibility
  count?: number;    // Added for compatibility
}

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
  // Added to match usage in utils.ts and student-progress-report.ts
  id?: string;
  courseName?: string;
  instrument?: string;
  completionPercentage?: number;
}

export type StudentProgressData = StudentProgressItem[];
