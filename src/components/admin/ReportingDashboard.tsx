
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useReports } from "@/hooks/use-reports";
import { Chart } from "@/components/ui/chart";
import { SubjectType, AttendanceStatus } from "@/lib/types";
import { DateRange } from "react-day-picker";

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
    sessionsData, 
    studentProgressData,
    isLoading 
  } = useReports({
    startDate: dateRange.from,
    endDate: dateRange.to,
    subjects: selectedSubjects,
    status: selectedStatuses
  });

  const handleSubjectChange = (value: string) => {
    // Filter out if already selected
    if (selectedSubjects.includes(value as SubjectType)) {
      setSelectedSubjects(selectedSubjects.filter(subject => subject !== value));
    } else {
      setSelectedSubjects([...selectedSubjects, value as SubjectType]);
    }
  };

  const handleStatusChange = (value: string) => {
    // Filter out if already selected
    if (selectedStatuses.includes(value as AttendanceStatus)) {
      setSelectedStatuses(selectedStatuses.filter(status => status !== value));
    } else {
      setSelectedStatuses([...selectedStatuses, value as AttendanceStatus]);
    }
  };
  
  // Predefined date range options
  const handleRangeSelect = (range: string) => {
    const today = new Date();
    
    switch (range) {
      case "last7days":
        setDateRange({
          from: subDays(today, 7),
          to: today
        });
        break;
      case "last30days":
        setDateRange({
          from: subDays(today, 30),
          to: today
        });
        break;
      case "thisMonth":
        setDateRange({
          from: startOfMonth(today),
          to: today
        });
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Reporting Dashboard</h1>
      
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
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="w-full md:w-auto">
          <p className="text-sm font-medium mb-2">Date Range</p>
          <DatePickerWithRange
            date={dateRange}
            setDate={(newDate) => setDateRange(newDate)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRangeSelect("last7days")}
          >
            Last 7 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRangeSelect("last30days")}
          >
            Last 30 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRangeSelect("thisMonth")}
          >
            This Month
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRangeSelect("lastMonth")}
          >
            Last Month
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <p className="text-sm font-medium mb-2">Filter by Instrument</p>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select instruments" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Instruments</SelectLabel>
                {["Guitar", "Piano", "Drums", "Ukulele", "Vocal"].map((subject) => (
                  <SelectItem 
                    key={subject} 
                    value={subject}
                    onSelect={() => handleSubjectChange(subject)}
                  >
                    {subject} {selectedSubjects.includes(subject as SubjectType) ? "✓" : ""}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/2 lg:w-1/3">
          <p className="text-sm font-medium mb-2">Filter by Status</p>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {["Present", "Cancelled by Student", "Cancelled by Teacher", "Cancelled by School", "Scheduled"].map((status) => (
                  <SelectItem 
                    key={status} 
                    value={status}
                    onSelect={() => handleStatusChange(status)}
                  >
                    {status} {selectedStatuses.includes(status as AttendanceStatus) ? "✓" : ""}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={selectedChart} onValueChange={(v) => setSelectedChart(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
          <TabsTrigger value="sessions">Sessions by Instrument</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedChart === "attendance" && "Attendance Trends"}
              {selectedChart === "sessions" && "Sessions by Instrument"}
              {selectedChart === "students" && "Student Progress"}
            </CardTitle>
            <CardDescription>
              {selectedChart === "attendance" && dateRange.from && dateRange.to && `Data from ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`}
              {selectedChart === "sessions" && `Distribution of sessions across instruments and types`}
              {selectedChart === "students" && `Course completion rates and active students`}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <Chart 
                type={
                  selectedChart === "attendance" ? "line" : 
                  selectedChart === "sessions" ? "bar" : "pie"
                }
                data={
                  selectedChart === "attendance" ? attendanceData?.chartData : 
                  selectedChart === "sessions" ? sessionsData?.chartData :
                  studentProgressData?.chartData
                }
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 
                        selectedChart === "attendance" ? "Attendance Over Time" : 
                        selectedChart === "sessions" ? "Sessions by Instrument Type" :
                        "Student Progress Distribution"
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ReportingDashboard;
