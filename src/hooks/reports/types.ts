
export type ReportPeriod = 'week' | 'month' | 'year' | 'last30days';

export interface AttendanceData {
  categories: string[];
  data: number[];
  // Optional extra properties for internal use
  total?: number;
  present?: number;
  absent?: number;
  cancelled?: number;
  noShow?: number;
  distribution?: Array<{ status: string; count: number }>;
  chartData?: Array<{ date: string; present: number; total: number }>;
}

export type SessionsReportData = {
  months: string[];
  counts: number[];
};

export type SessionTypeData = {
  type: string;
  subject: string;
  count: number;
}[];

export type SubjectDistributionData = {
  name: string;
  value: number;
}[];

export type StudentProgressData = {
  student: string;
  progress: number;
  id?: string; // Optional properties for internal use
  courseName?: string;
  instrument?: string;
  studentName?: string;
  completionPercentage?: number;
}[];
