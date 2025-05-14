
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
    if (selectedChart === "attendance" && attendanceData?.chartData) {
      return {
        labels: attendanceData.chartData.map(d => d.date),
        datasets: [
          {
            label: 'Present',
            data: attendanceData.chartData.map(d => d.present),
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          },
          {
            label: 'Total',
            data: attendanceData.chartData.map(d => d.total),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        ]
      };
    }
    else if (selectedChart === "sessions" && sessionsData && sessionsData.length > 0) {
      return {
        labels: sessionsData.map(d => d.date),
        datasets: [
          {
            label: 'Sessions',
            data: sessionsData.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }
        ]
      };
    }
    else if (selectedChart === "students" && studentProgressData && studentProgressData.length > 0) {
      return {
        labels: studentProgressData.map(d => d.studentName),
        datasets: [
          {
            label: 'Completion %',
            data: studentProgressData.map(d => d.completionPercentage),
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
            data={getChartData()}
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
  );
};

export default ReportChart;
