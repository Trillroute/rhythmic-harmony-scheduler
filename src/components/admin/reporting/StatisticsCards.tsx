
import React from 'react';
import { AttendanceData, SessionsReportData, StudentProgressData } from '@/hooks/reports/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckCircle2, BarChart } from 'lucide-react';

interface StatisticsCardsProps {
  sessionsData?: SessionsReportData;
  attendanceData?: AttendanceData;
  studentProgressData?: StudentProgressData;
  isLoading: boolean;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  sessionsData,
  attendanceData,
  studentProgressData,
  isLoading
}) => {
  // Calculate total sessions from sessions data
  const calculateTotalSessions = (): number => {
    if (!sessionsData) return 0;
    return sessionsData.reduce((total, item) => total + item.count, 0);
  };

  // Calculate attendance rate from attendance data
  const calculateAttendanceRate = (): number => {
    if (!attendanceData || attendanceData.total === 0) return 0;
    return Math.round((attendanceData.present / attendanceData.total) * 100);
  };

  // Calculate active students from student progress data
  const calculateActiveStudents = (): number => {
    if (!studentProgressData) return 0;
    return studentProgressData.length;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : calculateTotalSessions()}
          </div>
          <p className="text-xs text-muted-foreground">Sessions delivered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : `${calculateAttendanceRate()}%`}
          </div>
          <p className="text-xs text-muted-foreground">Of scheduled sessions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : calculateActiveStudents()}
          </div>
          <p className="text-xs text-muted-foreground">Students with progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : (
              studentProgressData && studentProgressData.length > 0 
                ? `${Math.round(studentProgressData.reduce((sum, item) => sum + item.completionPercentage, 0) / studentProgressData.length)}%`
                : "0%"
            )}
          </div>
          <p className="text-xs text-muted-foreground">Course completion rate</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
