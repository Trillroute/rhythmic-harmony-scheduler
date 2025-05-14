
import React from 'react';
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { SubjectType, AttendanceStatus } from "@/lib/types";

interface DashboardFiltersProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedSubjects: SubjectType[];
  setSelectedSubjects: (subjects: SubjectType[]) => void;
  selectedStatuses: AttendanceStatus[];
  setSelectedStatuses: (statuses: AttendanceStatus[]) => void;
  selectedChart?: "attendance" | "sessions" | "students";
  setSelectedChart?: (chart: "attendance" | "sessions" | "students") => void;
}

const DashboardFilters = ({
  dateRange,
  setDateRange,
  selectedSubjects,
  setSelectedSubjects,
  selectedStatuses,
  setSelectedStatuses,
  selectedChart,
  setSelectedChart
}: DashboardFiltersProps) => {

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

  const handleChartChange = (value: "attendance" | "sessions" | "students") => {
    if (setSelectedChart) {
      setSelectedChart(value);
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
    <>
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
      
      {selectedChart && setSelectedChart && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Chart Type</p>
          <div className="flex gap-2">
            <Button
              variant={selectedChart === "attendance" ? "default" : "outline"}
              onClick={() => handleChartChange("attendance")}
            >
              Attendance
            </Button>
            <Button
              variant={selectedChart === "sessions" ? "default" : "outline"}
              onClick={() => handleChartChange("sessions")}
            >
              Sessions
            </Button>
            <Button
              variant={selectedChart === "students" ? "default" : "outline"}
              onClick={() => handleChartChange("students")}
            >
              Students
            </Button>
          </div>
        </div>
      )}
      
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
    </>
  );
};

export default DashboardFilters;
