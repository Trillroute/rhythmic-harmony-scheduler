
// This file is now just a re-export for backwards compatibility
import { useReports } from "./reports/use-reports";
export { useReports };
export type { 
  ReportPeriod, 
  AttendanceData, 
  AttendanceChartPoint,
  SubjectDistributionData, 
  SubjectDistributionPoint,
  SessionTypeData, 
  SessionTypePoint,
  SessionsReportData, 
  SessionsReportPoint,
  StudentProgressData, 
  StudentProgressPoint 
} from "./reports/types";
