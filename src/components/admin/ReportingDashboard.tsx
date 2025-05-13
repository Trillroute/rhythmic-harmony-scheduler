
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from "date-fns";
import { useReports } from "@/hooks/use-reports";
import { SubjectType, AttendanceStatus } from "@/lib/types";
import { DateRange } from "react-day-picker";

// Import refactored components
import DashboardFilters from "./reporting/DashboardFilters";
import StatisticsCards from "./reporting/StatisticsCards";
import ReportChart from "./reporting/ReportChart";

const ReportingDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [selectedChart, setSelectedChart] = useState<"attendance" | "sessions" | "students">("attendance");
  
  // Make sure these are explicitly typed as the correct enum types
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AttendanceStatus[]>([]);
  
  const { 
    attendanceData, 
    subjectData,
    sessionTypeData,
    sessionsData, 
    studentProgressData,
    isLoading 
  } = useReports('month', {
    startDate: dateRange.from,
    endDate: dateRange.to,
    subjects: selectedSubjects,
    status: selectedStatuses
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Reporting Dashboard</h1>
      
      <StatisticsCards 
        sessionsData={sessionsData} 
        attendanceData={attendanceData} 
        studentProgressData={studentProgressData} 
        isLoading={isLoading} 
      />
      
      <DashboardFilters 
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedSubjects={selectedSubjects}
        setSelectedSubjects={setSelectedSubjects}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
      />
      
      <Tabs value={selectedChart} onValueChange={(v) => setSelectedChart(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
          <TabsTrigger value="sessions">Sessions by Instrument</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
        </TabsList>
        
        <ReportChart
          selectedChart={selectedChart}
          attendanceData={attendanceData}
          sessionsData={sessionsData}
          studentProgressData={studentProgressData}
          isLoading={isLoading}
          dateRange={dateRange}
        />
      </Tabs>
    </div>
  );
};

export default ReportingDashboard;
