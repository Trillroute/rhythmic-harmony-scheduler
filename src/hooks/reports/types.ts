
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
  categories: string[]; // Added for backward compatibility
  data: number[]; // Added for backward compatibility
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
  length?: number; // Added for backward compatibility
  reduce?: (callback: any, initialValue: any) => any; // Added for backward compatibility
  map?: (callback: any) => any; // Added for backward compatibility
  [index: number]: any; // Added for backward compatibility
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
  [index: number]: any; // Added for backward compatibility
  length?: number; // Added for backward compatibility
  map?: (callback: any) => any; // Added for backward compatibility
  push?: (item: any) => number; // Added for backward compatibility
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
  months?: string[]; // Added for backward compatibility
  counts?: number[]; // Added for backward compatibility
}

export interface StudentProgressItem {
  studentId: string;
  studentName: string;
  completionPercentage: number;
}

export interface StudentProgressData {
  averageCompletion: number;
  students: StudentProgressItem[];
  map?: (callback: any) => any; // Added for backward compatibility
  [index: number]: any; // Added for backward compatibility
}
