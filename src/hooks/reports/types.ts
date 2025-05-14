
// Report period type
export type ReportPeriod = 'week' | 'month' | 'year';

// Attendance data types
export interface AttendanceChartPoint {
  date: string;
  present: number;
  total: number;
}

export interface AttendanceData {
  attendanceRate: number;
  chartData: AttendanceChartPoint[];
  summary: {
    present: number;
    absent: number;
    total: number;
    cancelled?: number;
    noShow?: number;
  };
}

// Subject distribution data types
export interface SubjectDistributionPoint {
  name: string;  // Changed from subject to name
  value: number; // Changed from count to value
}

export type SubjectDistributionData = SubjectDistributionPoint[];

// Session type data types
export interface SessionTypePoint {
  type: string;
  subject: string;
  count: number;
}

export type SessionTypeData = SessionTypePoint[];

// Sessions report data types
export interface SessionsReportPoint {
  date: string;
  count: number;
}

export interface SessionsReportData {
  totalSessions: number;
  chartData: SessionsReportPoint[];
}

// Student progress data types
export interface StudentProgressPoint {
  id: string;
  studentName: string;
  courseName: string;
  instrument: string;
  completionPercentage: number;
}

export type StudentProgressData = StudentProgressPoint[];
