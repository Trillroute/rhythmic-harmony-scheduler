
import { ReportPeriod } from "./types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export function getDateRangeFromPeriod(period: ReportPeriod) {
  const now = new Date();
  
  switch (period) {
    case 'week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        endDate: endOfWeek(now, { weekStartsOn: 1 }) // Sunday
      };
    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
    case 'year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now)
      };
    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
  }
}
