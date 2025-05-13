
import { AttendanceStatus, SubjectType } from "@/lib/types";

export interface ReportPeriod {
  startDate?: Date;
  endDate?: Date;
  subjects?: SubjectType[];
  status?: AttendanceStatus[];
}

export interface AttendanceData {
  attendanceRate: number;
  chartData: {
    date: string;
    total: number;
    present: number;
    rate: number;
  }[];
}

export interface SubjectDistributionData {
  chartData: {
    subject: string;
    sessions: number;
    solo: number;
    duo: number;
    focus: number;
  }[];
}

export interface SessionTypeData {
  chartData: {
    name: string;
    value: number;
  }[];
}

// Define the structure for session data in reports
export interface SessionsReportData {
  totalSessions: number;
  chartData: {
    subject: string;
    count: number;
  }[];
}

// Define the structure for student progress data in reports
export interface StudentProgressData {
  activeStudents: number;
  chartData: {
    name: string;
    value: number;
  }[];
}
