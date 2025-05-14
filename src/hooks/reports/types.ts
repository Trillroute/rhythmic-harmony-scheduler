
export type ReportPeriod = 'week' | 'month' | 'year';

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  distribution: {
    status: string;
    count: number;
  }[];
}

export interface SubjectDistributionData {
  name: string;
  value: number;
}[];

export interface SessionTypeData {
  type: string;
  subject: string;
  count: number;
}[];

export interface SessionsReportData {
  date: string;
  count: number;
}[];

export interface StudentProgressData {
  id: string;
  studentName: string;
  courseName: string;
  instrument: string;
  completionPercentage: number;
}[];
