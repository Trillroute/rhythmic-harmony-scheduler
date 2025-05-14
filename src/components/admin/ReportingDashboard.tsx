
import React, { useState, useEffect } from 'react';
import AttendanceChart from '@/components/reports/AttendanceChart';
import SessionTypeChart from '@/components/reports/SessionTypeChart';
import SubjectDistributionChart from '@/components/reports/SubjectDistributionChart';
import SessionsOverTimeChart from '@/components/reports/SessionsOverTimeChart';
import StudentProgressTable from '@/components/reports/StudentProgressTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReports } from '@/hooks/reports/use-reports';
import { ReportPeriod } from '@/hooks/reports/types';
import DashboardFilters from '@/components/admin/reporting/DashboardFilters';
import { LoaderIcon } from 'lucide-react';

const ReportingDashboard = () => {
  const [period, setPeriod] = useState<ReportPeriod>('last30days');
  const [loading, setLoading] = useState(true);
  const reportsAPI = useReports();
  
  const [reportData, setReportData] = useState({
    attendance: null,
    subjectDistribution: null,
    sessionType: null,
    sessions: null,
    studentProgress: null
  });
  
  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [attendance, subjectDistribution, sessionType, sessions, studentProgress] = await Promise.all([
          reportsAPI.generateAttendanceReport(period),
          reportsAPI.generateSubjectDistributionReport(period),
          reportsAPI.generateSessionTypeReport(period),
          reportsAPI.generateSessionsReport(period),
          reportsAPI.generateStudentProgressReport(period)
        ]);
        
        setReportData({
          attendance,
          subjectDistribution,
          sessionType,
          sessions,
          studentProgress
        });
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, [period]);

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setPeriod(newPeriod);
  };
  
  const error = reportsAPI.error;
  
  return (
    <div className="space-y-4 p-2 md:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Reporting Dashboard</h1>
        <DashboardFilters period={period} onChange={handlePeriodChange} />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-md bg-destructive/10">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error instanceof Error ? error.message : "An error occurred while loading reports"}</p>
        </div>
      ) : (
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="sessionTypes">Session Types</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="progress">Student Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.attendance && <AttendanceChart data={reportData.attendance} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.subjectDistribution && <SubjectDistributionChart data={reportData.subjectDistribution} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessionTypes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Types by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.sessionType && <SessionTypeChart data={reportData.sessionType} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.sessions && <SessionsOverTimeChart data={reportData.sessions} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.studentProgress && <StudentProgressTable data={reportData.studentProgress} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReportingDashboard;
