import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { AttendanceData, SessionsReportData, SubjectDistributionData, StudentProgressData } from "@/hooks/reports/types";

interface StatisticsCardsProps {
  attendanceData?: AttendanceData;
  sessionsData?: SessionsReportData;
  subjectsData?: SubjectDistributionData;
  studentProgressData?: StudentProgressData;
}

const StatisticsCards = ({ 
  attendanceData, 
  sessionsData, 
  subjectsData, 
  studentProgressData 
}: StatisticsCardsProps) => {
  // Calculate total sessions from sessions data
  const totalSessions = sessionsData ? sessionsData.counts.reduce((acc, curr) => acc + curr, 0) : 0;
  
  // Calculate attendance rate
  const attendanceRate = attendanceData && attendanceData.data[0] > 0 
    ? Math.round((attendanceData.data[0] / attendanceData.data.reduce((a, b) => a + b, 0)) * 100)
    : 0;
  
  // Find most popular subject
  const mostPopularSubject = subjectsData && subjectsData.length > 0
    ? subjectsData.reduce((prev, current) => (prev.value > current.value) ? prev : current)
    : { name: 'N/A', value: 0 };
    
  // Calculate average student progress
  const averageProgress = studentProgressData && studentProgressData.length > 0
    ? Math.round(studentProgressData.reduce((acc, curr) => acc + curr.progress, 0) / studentProgressData.length)
    : 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Sessions</CardTitle>
          <CardDescription>Total number of sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={totalSessions.toString()} delta="+12%" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Rate</CardTitle>
          <CardDescription>Percentage of students attending sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={`${attendanceRate}%`} delta="+4%" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Popular Subject</CardTitle>
          <CardDescription>The subject with the most sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={mostPopularSubject.name} delta={mostPopularSubject.value.toString()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg. Student Progress</CardTitle>
          <CardDescription>Average completion rate across all students</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={`${averageProgress}%`} delta="+5%" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
