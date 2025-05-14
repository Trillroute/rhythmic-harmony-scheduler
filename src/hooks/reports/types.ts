
export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
}

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  categories: string[];
  data: number[];
  distribution: { status: string; count: number }[];
  chartData: { date: string; present: number; total: number }[];
}

export interface SubjectDistributionItem {
  subject: string;
  count: number;
  name: string; // For backward compatibility
  value: number; // For backward compatibility
}

export type SubjectDistributionData = SubjectDistributionItem[];

export interface SessionTypeItem {
  sessionType: string;
  type: string; // For backward compatibility
  count: number;
  subjects: { subject: string; count: number }[];
}

export type SessionTypeData = SessionTypeItem[];

export interface SessionsReportData {
  months: string[];
  counts: number[];
}

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
  id: string;
  studentName: string;
  courseName: string;
  instrument: string;
  completionPercentage: number;
}

export type StudentProgressData = StudentProgressItem[];
