
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportPeriod } from '@/hooks/reports/types';

interface DashboardFiltersProps {
  period: ReportPeriod;
  onChange: (value: ReportPeriod) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ period, onChange }) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={period} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DashboardFilters;
