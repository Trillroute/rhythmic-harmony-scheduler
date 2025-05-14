export type ReportPeriod = 'week' | 'month' | 'year';

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  distribution: { status: string; count: number }[];
  chartData: { date: string; present: number; total: number }[];
}

export type SessionsReportData = {
  date: string;
  count: number;
}[];

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
  id: string;
  studentName: string;
  courseName: string;
  instrument: string;
  completionPercentage: number;
}[];
