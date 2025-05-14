
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { ReportPeriod, DateRangeSelection } from "./types";

export function getDateRangeFromPeriod(period: ReportPeriod): DateRangeSelection {
  const now = new Date();
  
  switch(period) {
    case 'this_week': {
      return {
        startDate: startOfWeek(now),
        endDate: endOfWeek(now)
      };
    }
    case 'this_month': {
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
    }
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };
    }
    case 'last_30days': {
      return {
        startDate: subDays(now, 30),
        endDate: now
      };
    }
    case 'last_90days': {
      return {
        startDate: subDays(now, 90),
        endDate: now
      };
    }
    case 'year_to_date': {
      return {
        startDate: new Date(now.getFullYear(), 0, 1), // Jan 1st of current year
        endDate: now
      };
    }
    case 'custom': 
    default: {
      // Default to last 7 days if custom is selected without specifying dates
      return {
        startDate: subDays(now, 7),
        endDate: now
      };
    }
  }
}

// Alias function for backward compatibility
export const getPeriodDateRange = getDateRangeFromPeriod;
