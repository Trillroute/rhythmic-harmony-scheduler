
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
  chartData: { date: string; present: number; total: number }[];
  categories: string[]; // Added for backward compatibility
  data: number[]; // Added for backward compatibility
}

// Modified to avoid string indexing issues
export interface SubjectDistributionData {
  Guitar: number;
  Piano: number;
  Drums: number;
  Ukulele: number;
  Vocal: number;
  [key: string]: number | { labels: string[]; data: number[] } | undefined; // Allow both number and chartData
  chartData?: {
    labels: string[];
    data: number[];
  };
}

export interface SessionTypeSubjects {
  [subject: string]: number;
}

export interface SessionTypeItem {
  type: string;
  count: number;
  subjects: SessionTypeSubjects | { subject: string; count: number }[];
}

// Modified to avoid string indexing issues
export interface SessionTypeData {
  Solo?: SessionTypeItem;
  Duo?: SessionTypeItem;
  Focus?: SessionTypeItem;
  [key: string]: SessionTypeItem | number | ((callback: any) => any) | ((item: any) => number) | undefined;
  length?: number;
  map?: (callback: any) => any;
  push?: (item: any) => number;
}

export interface SessionsDataItem {
  date: string;
  count: number;
}

export interface SessionsReportData {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  data: SessionsDataItem[];
  months?: string[]; // For backward compatibility
  counts?: number[]; // For backward compatibility
}

export interface StudentProgressItem {
  studentId?: string;
  studentName?: string;
  completionPercentage: number;
  student?: {
    id: string;
    name: string;
  };
  progress?: {
    id: string;
    courseName: string;
    instrument: string;
    completionPercentage: number;
  };
}

export interface StudentProgressData {
  averageCompletion: number;
  students: StudentProgressItem[];
  [index: number]: StudentProgressItem;
  map?: (callback: any) => any;
}
