
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionsReportData } from "@/hooks/reports/types";
import { AttendanceData } from "@/hooks/reports/types";
import { StudentProgressData } from "@/hooks/reports/types";

interface StatisticsCardsProps {
  sessionsData?: SessionsReportData;
  attendanceData?: AttendanceData;
  studentProgressData?: StudentProgressData;
  isLoading: boolean;
}

const StatisticsCards = ({ 
  sessionsData, 
  attendanceData, 
  studentProgressData, 
  isLoading 
}: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sessions</CardTitle>
          <CardDescription>Total sessions scheduled</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {isLoading ? "..." : sessionsData?.totalSessions || 0}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attendance Rate</CardTitle>
          <CardDescription>Present vs total sessions</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {isLoading ? "..." : `${attendanceData?.attendanceRate || 0}%`}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active Students</CardTitle>
          <CardDescription>Students with active plans</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {isLoading ? "..." : studentProgressData?.activeStudents || 0}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
