
export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
}

export interface AttendanceData {
  categories: string[];
  data: number[];
  chartData: { date: string; present: number; total: number }[];
}

export interface SubjectDistributionItem {
  subject: string;
  count: number;
}

export interface SubjectDistributionData extends Array<SubjectDistributionItem> {}

export interface SessionTypeItem {
  type: string;
  subjects: { [key: string]: number };
  count: number;
}

export interface SessionTypeData extends Array<SessionTypeItem> {}

export interface SessionsReportData extends Array<{ date: string; count: number }> {}

export interface StudentProgressItem {
  student: string;
  progress: number;
}

export interface StudentProgressData extends Array<StudentProgressItem> {}
