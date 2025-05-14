
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceData, SessionsReportData, StudentProgressData } from '@/hooks/reports/types';
import { UsersIcon, CalendarIcon, PercentIcon } from 'lucide-react';

interface StatisticsCardsProps {
  attendanceData?: AttendanceData;
  sessionsData?: SessionsReportData;
  studentProgressData?: StudentProgressData;
  isLoading: boolean;
}

const StatisticsCards = ({ 
  attendanceData, 
  sessionsData, 
  studentProgressData,
  isLoading
}: StatisticsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Sessions
          </CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {sessionsData?.totalSessions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Sessions this period
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Attendance Rate
          </CardTitle>
          <PercentIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {attendanceData?.attendanceRate 
                  ? `${(attendanceData.attendanceRate * 100).toFixed(1)}%` 
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {attendanceData?.summary 
                  ? `${attendanceData.summary.present} of ${attendanceData.summary.total} sessions attended`
                  : 'No attendance data'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Students
          </CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {studentProgressData?.activeStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Students with active enrollments
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
