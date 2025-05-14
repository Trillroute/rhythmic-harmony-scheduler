
export type ReportPeriod = 'this_week' | 'this_month' | 'last_month' | 'last_30days' | 'last_90days' | 'year_to_date' | 'custom';

export interface DateRangeSelection {
  startDate: Date;
  endDate: Date;
}

export interface AttendanceDistribution {
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
}

export interface AttendanceChartData {
  categories: string[];
  data: number[];
}

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  noShow: number;
  distribution: AttendanceDistribution;
  chartData: AttendanceChartData;
}

export interface SubjectDistributionData {
  Guitar: number;
  Piano: number;
  Drums: number;
  Ukulele: number;
  Vocal: number;
  chartData: {
    labels: string[];
    data: number[];
  };
}

export interface SessionTypeSubjects {
  Guitar: number;
  Piano: number;
  Drums: number;
  Ukulele: number;
  Vocal: number;
}

export interface SessionTypeItem {
  type: string;
  count: number;
  subjects: SessionTypeSubjects;
}

export interface SessionTypeData {
  Solo: SessionTypeItem;
  Duo: SessionTypeItem;
  Focus: SessionTypeItem;
}

export interface SessionsDataItem {
  date: string;
  label: string;
  count: number;
}

export interface SessionsReportData {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  data: SessionsDataItem[];
}

export interface StudentProgressItem {
  studentId: string;
  studentName: string;
  completionPercentage: number;
}

export interface StudentProgressData {
  averageCompletion: number;
  students: StudentProgressItem[];
}
