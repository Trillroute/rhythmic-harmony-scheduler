
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { DateRange } from "react-day-picker";
import { AttendanceData, SessionsReportData, StudentProgressData } from "@/hooks/reports/types";

interface ReportChartProps {
  selectedChart: "attendance" | "sessions" | "students";
  attendanceData?: AttendanceData;
  sessionsData?: SessionsReportData;
  studentProgressData?: StudentProgressData;
  isLoading: boolean;
  dateRange: DateRange;
}

const ReportChart = ({
  selectedChart,
  attendanceData,
  sessionsData,
  studentProgressData,
  isLoading,
  dateRange
}: ReportChartProps) => {
  // Transform the chart data to match Chart.js requirements
  const getChartData = () => {
    if (selectedChart === "attendance" && attendanceData) {
      return {
        labels: attendanceData.categories,
        datasets: [
          {
            label: 'Sessions',
            data: attendanceData.data,
            backgroundColor: [
              'rgba(34, 197, 94, 0.5)',
              'rgba(239, 68, 68, 0.5)',
              'rgba(245, 158, 11, 0.5)',
              'rgba(107, 114, 128, 0.5)',
              'rgba(59, 130, 246, 0.5)',
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(239, 68, 68)',
              'rgb(245, 158, 11)',
              'rgb(107, 114, 128)',
              'rgb(59, 130, 246)',
            ],
            borderWidth: 1
          }
        ]
      };
    }
    else if (selectedChart === "sessions" && sessionsData) {
      return {
        labels: sessionsData.months,
        datasets: [
          {
            label: 'Sessions',
            data: sessionsData.counts,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        ]
      };
    }
    else if (selectedChart === "students" && studentProgressData && studentProgressData.length > 0) {
      return {
        labels: studentProgressData.map(d => d.student),
        datasets: [
          {
            label: 'Completion %',
            data: studentProgressData.map(d => d.progress),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }
        ]
      };
    }
    
    return {
      labels: [],
      datasets: []
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedChart === "attendance" && "Attendance Trends"}
          {selectedChart === "sessions" && "Sessions by Month"}
          {selectedChart === "students" && "Student Progress"}
        </CardTitle>
        <CardDescription>
          {dateRange.from && dateRange.to && `Data from ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`}
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
              selectedChart === "attendance" ? "pie" : 
              selectedChart === "sessions" ? "bar" : "horizontalBar"
            }
            data={getChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                },
              },
              indexAxis: selectedChart === "students" ? 'y' : 'x'
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ReportChart;
