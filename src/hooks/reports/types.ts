
// Define the report period enum
export type ReportPeriod = 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom';

// Define attendance data structure
export interface AttendanceData {
  // Totals
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  
  // For charts
  distribution: { status: string; count: number }[];
  chartData: { date: string; present: number; total: number }[];
  
  // For backward compatibility
  categories?: string[];
  data?: number[];
}

// Define subject distribution data structure
export type SubjectDistributionData = {
  subject: string;
  count: number;
}[];

// Define session type data structure
export type SessionTypeData = {
  sessionType: string;
  count: number;
  subjects?: { subject: string; count: number }[];
}[];

// Define sessions report data structure
export type SessionsReportData = {
  date: string;
  count: number;
}[];

// Define student progress data structure
export interface StudentProgressItem {
  student: string;
  progress: number;
  id?: string;
  studentName?: string;
  courseName?: string;
  instrument?: string;
  completionPercentage?: number;
}

export type StudentProgressData = StudentProgressItem[];
