
export type ReportPeriod = 'week' | 'month' | 'year' | 'last30days';

export interface AttendanceData {
  categories: string[];
  data: number[];
}

export type SessionsReportData = {
  counts: number[];
  months: string[];
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
}[];
