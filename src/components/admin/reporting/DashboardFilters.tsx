
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ReportPeriod } from "@/hooks/reports/types";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Ensure this matches the React Day Picker DateRange type
interface DateRange {
  from: Date;
  to?: Date;
}

export interface DashboardFiltersProps {
  period: ReportPeriod; 
  onPeriodChange: (newPeriod: ReportPeriod) => void; 
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

export function DashboardFilters({
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
}: DashboardFiltersProps) {
  const handleDateRangeChange = (range: DateRange) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };
  
  // Conditionally render date range picker
  const showDatePicker = period === 'custom';
  
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
      <div className="w-full sm:w-[180px]">
        <Select value={period} onValueChange={(val) => onPeriodChange(val as ReportPeriod)}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {showDatePicker ? (
        <DateRangePicker
          dateRange={dateRange}
          onChange={handleDateRangeChange}
        />
      ) : (
        dateRange && dateRange.from && (
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            <div className="grid gap-1">
              <div className="font-medium">
                {format(dateRange.from, "MMMM d, yyyy")}
                {dateRange.to && " to " + format(dateRange.to, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
