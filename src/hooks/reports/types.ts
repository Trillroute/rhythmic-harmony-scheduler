
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
  // Additional properties for backward compatibility
  distribution?: { status: string; count: number }[];
  chartData?: { date: string; present: number; total: number }[];
}

// Subject distribution data structure
export interface SubjectDistributionItem {
  subject: string;
  count: number;
  // Additional properties for backward compatibility
  name?: string;
  value?: number;
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
  // For backward compatibility
  type?: string;
}

export type SessionTypeData = SessionTypeItem[];

// Sessions over time data structure
export interface SessionsReportData {
  // Original properties
  months?: string[];
  counts?: number[];
  // For backward compatibility with items array
  date?: string;
  count?: number;
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
  // For backward compatibility
  id?: string;
  courseName?: string;
  instrument?: string;
  completionPercentage?: number;
  studentName?: string;
}

export type StudentProgressData = StudentProgressItem[];
