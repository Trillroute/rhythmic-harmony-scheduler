
import { ReportPeriod } from "./types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";

export function getPeriodDateRange(period: ReportPeriod) {
  const now = new Date();
  
  switch (period) {
    case 'this_week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        endDate: endOfWeek(now, { weekStartsOn: 1 }) // Sunday
      };
    case 'this_month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
    case 'last_month': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };
    }
    case 'year_to_date':
      return {
        startDate: startOfYear(now),
        endDate: now
      };
    case 'last_30days':
      return {
        startDate: subDays(now, 30),
        endDate: now
      };
    case 'last_90days':
      return {
        startDate: subDays(now, 90),
        endDate: now
      };
    case 'custom':
      // For custom, we expect the date range to be provided separately
      return {
        startDate: now,
        endDate: now
      };
    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
  }
}

// Alias to maintain backward compatibility
export const getDateRangeFromPeriod = getPeriodDateRange;
