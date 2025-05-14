
import React from "react";
import { Metric } from "@/components/ui/metric";
import { AttendanceData, SessionTypeData, SubjectDistributionData, SessionsReportData } from "@/hooks/reports/types";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, UsersIcon, BookOpenIcon, ClockIcon } from "lucide-react";

interface StatisticsCardsProps {
  attendance?: AttendanceData;
  subjects?: SubjectDistributionData;
  sessionTypes?: SessionTypeData;
  sessionsOverTime?: SessionsReportData;
  isLoading: boolean;
}

export function StatisticsCards({
  attendance,
  subjects,
  sessionTypes,
  sessionsOverTime,
  isLoading,
}: StatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 space-y-2 animate-pulse">
                <div className="w-1/2 h-3 bg-gray-200 rounded-md"></div>
                <div className="w-2/3 h-6 bg-gray-200 rounded-md"></div>
                <div className="w-1/3 h-3 bg-gray-200 rounded-md"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate total sessions
  const totalSessions = sessionsOverTime?.counts?.reduce((sum, count) => sum + count, 0) || 0;

  // Get most popular subject
  let popularSubject = "N/A";
  let popularSubjectCount = 0;
  if (subjects) {
    // Find the subject with the highest count
    const subjectKeys = ['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'];
    let highestSubject = '';
    let highestCount = 0;
    
    subjectKeys.forEach(key => {
      const count = subjects[key] as number || 0;
      if (count > highestCount) {
        highestCount = count;
        highestSubject = key;
      }
    });
    
    popularSubject = highestSubject;
    popularSubjectCount = highestCount;
  }

  // Calculate attendance rate safely
  const attendanceRate = attendance && attendance.total > 0 
    ? Math.round((attendance.present / attendance.total) * 100) 
    : 0;

  // Get most common session type
  let commonSessionType = "N/A";
  let commonSessionTypeCount = 0;
  if (sessionTypes) {
    const sessionTypeKeys = ['Solo', 'Duo', 'Focus'];
    let highestType = '';
    let highestCount = 0;
    
    sessionTypeKeys.forEach(key => {
      const item = sessionTypes[key];
      if (item && item.count > highestCount) {
        highestCount = item.count;
        highestType = key;
      }
    });
    
    commonSessionType = highestType;
    commonSessionTypeCount = highestCount;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Metric
        title="Total Sessions"
        value={totalSessions.toString()}
        description="All scheduled sessions"
        icon={<CalendarIcon className="h-4 w-4" />}
        trend={totalSessions > 0 ? "up" : "neutral"}
        trendValue={totalSessions > 0 ? `${totalSessions} sessions` : "No sessions"}
      />

      <Metric
        title="Attendance Rate"
        value={`${attendanceRate}%`}
        description="Average attendance rate"
        icon={<UsersIcon className="h-4 w-4" />}
        trend={attendanceRate > 75 ? "up" : attendanceRate > 50 ? "neutral" : "down"}
        trendValue={attendance ? `${attendance.present} of ${attendance.total} sessions` : "No data"}
      />

      <Metric
        title="Popular Subject"
        value={popularSubject}
        description="Most requested subject"
        icon={<BookOpenIcon className="h-4 w-4" />}
        trend={popularSubjectCount > 0 ? "up" : "neutral"}
        trendValue={popularSubjectCount > 0 ? `${popularSubjectCount} sessions` : "No data"}
      />

      <Metric
        title="Session Type"
        value={commonSessionType}
        description="Most common session type"
        icon={<ClockIcon className="h-4 w-4" />}
        trend={commonSessionTypeCount > 0 ? "up" : "neutral"}
        trendValue={commonSessionTypeCount > 0 ? `${commonSessionTypeCount} sessions` : "No data"}
      />
    </div>
  );
}
