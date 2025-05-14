
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
  if (subjects && subjects.length > 0) {
    const mostPopular = subjects.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev
    );
    popularSubject = mostPopular.subject;
    popularSubjectCount = mostPopular.count;
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
        value={attendance ? `${Math.round((attendance.present / (attendance.total || 1)) * 100)}%` : "N/A"}
        description="Average attendance rate"
        icon={<UsersIcon className="h-4 w-4" />}
        trend={attendance && attendance.total > 0 ? "neutral" : "neutral"}
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
        value={sessionTypes && sessionTypes.length > 0 ? sessionTypes[0].sessionType : "N/A"}
        description="Most common session type"
        icon={<ClockIcon className="h-4 w-4" />}
        trend={sessionTypes && sessionTypes.length > 0 ? "neutral" : "neutral"}
        trendValue={sessionTypes && sessionTypes.length > 0 ? `${sessionTypes[0].count} sessions` : "No data"}
      />
    </div>
  );
}
