
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReports, ReportPeriod } from '@/hooks/use-reports';
import AttendanceChart from '@/components/reports/AttendanceChart';
import SubjectDistributionChart from '@/components/reports/SubjectDistributionChart';
import SessionTypeChart from '@/components/reports/SessionTypeChart';
import SessionsOverTimeChart from '@/components/reports/SessionsOverTimeChart';
import StudentProgressTable from '@/components/reports/StudentProgressTable';
import StatisticsCards from '@/components/admin/reporting/StatisticsCards';
import ReportChart from '@/components/admin/reporting/ReportChart';
import { DateRange } from 'react-day-picker';
import { sub } from 'date-fns';
import DashboardFilters from './reporting/DashboardFilters';

const ReportingDashboard: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: sub(new Date(), { months: 1 }),
    to: new Date()
  });
  const [selectedChart, setSelectedChart] = useState<"attendance" | "sessions" | "students">("attendance");
  
  const reports = useReports();
  
  useEffect(() => {
    reports.fetchReports(period);
  }, [period]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reporting Dashboard</h1>
        <Select value={period} onValueChange={(value: ReportPeriod) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DashboardFilters 
        dateRange={dateRange} 
        onDateRangeChange={setDateRange} 
        selectedChart={selectedChart}
        onChartChange={setSelectedChart}
      />
      
      <StatisticsCards 
        attendanceData={reports.attendance.data} 
        sessionsData={reports.sessions.data}
        studentProgressData={reports.studentProgress.data}
        isLoading={reports.isLoading}
      />
      
      <ReportChart
        selectedChart={selectedChart}
        attendanceData={reports.attendance.data}
        sessionsData={reports.sessions.data}
        subjectDistributionData={reports.subjectDistribution.data}
        sessionTypeData={reports.sessionType.data}
        studentProgressData={reports.studentProgress.data}
        isLoading={reports.isLoading}
        dateRange={dateRange}
      />
      
      {reports.isLoading ? (
        <div className="text-center py-10">Loading reports...</div>
      ) : reports.error ? (
        <div className="text-center text-destructive py-10">
          Error loading reports: {typeof reports.error === 'string' ? reports.error : 'Unknown error'} 
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectDistributionChart data={reports.subjectDistribution.data} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionTypeChart data={reports.sessionType.data} />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Student Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentProgressTable data={reports.studentProgress.data} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportingDashboard;
