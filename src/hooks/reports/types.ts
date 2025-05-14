
import { AttendanceStatus, SubjectType, SessionType } from '@/lib/types';

export type ReportPeriod = 'today' | 'week' | 'month' | 'year';

export interface AttendanceDataItem {
  status: string;
  count: number;
}

export interface AttendanceChartDataItem {
  date: string;
  present: number;
  total: number;
}

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  distribution: AttendanceDataItem[];
  chartData: AttendanceChartDataItem[];
  categories: string[];
  data: number[];
}

export interface SubjectDistributionItem {
  subject: string;
  count: number;
  name?: string; // For compatibility with chart library
  value?: number; // For compatibility with chart library
}

export type SubjectDistributionData = SubjectDistributionItem[];

export interface SessionTypeItem {
  type: SessionType;
  subjects: Record<SubjectType, number>;
  count: number;
}

export type SessionTypeData = SessionTypeItem[];

export interface SessionsDataItem {
  date: string;
  count: number;
}

export type SessionsReportData = SessionsDataItem[];

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
  id?: string; // For compatibility
  studentName?: string; // For compatibility
  courseName?: string; // For compatibility
  instrument?: string; // For compatibility
  completionPercentage?: number; // For compatibility
}

export type StudentProgressData = StudentProgressItem[];

export interface ReportingDashboardProps {
  period: ReportPeriod;
  setPeriod: (period: ReportPeriod) => void;
}

