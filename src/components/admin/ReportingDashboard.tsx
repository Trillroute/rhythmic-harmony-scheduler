
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

const ReportingDashboard: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('month');
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
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart data={reports.attendance.data} />
            </CardContent>
          </Card>
          
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
          
          <Card>
            <CardHeader>
              <CardTitle>Sessions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionsOverTimeChart data={reports.sessions.data} />
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
