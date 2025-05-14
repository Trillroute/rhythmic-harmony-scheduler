
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceData, SessionTypeData, SubjectDistributionData, SessionsReportData } from "@/hooks/reports/types";
import Chart from 'chart.js/auto';

interface ReportChartProps {
  title: string;
  description: string;
  chartType: 'line' | 'pie' | 'bar' | 'doughnut';
  data?: AttendanceData | SubjectDistributionData | SessionTypeData | SessionsReportData;
  isLoading: boolean;
}

export function ReportChart({
  title,
  description,
  chartType,
  data,
  isLoading,
}: ReportChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || isLoading || !data) return;

    // Clear any existing chart to prevent memory leaks
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Determine chart configuration based on data type
    const chartConfig = getChartConfig(chartType, data);
    
    // Create the new chart
    chartInstanceRef.current = new Chart(ctx, {
      type: chartType,
      data: chartConfig.data,
      options: chartConfig.options
    });

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartType, data, isLoading]);

  // Return appropriate chart configuration based on data type
  const getChartConfig = (type: string, chartData: any) => {
    // Handle attendance data (line chart)
    if ('present' in chartData && 'total' in chartData && type === 'line') {
      return {
        data: {
          labels: chartData.chartData.map((item: any) => item.date),
          datasets: [
            {
              label: 'Present',
              data: chartData.chartData.map((item: any) => item.present),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.2
            },
            {
              label: 'Total',
              data: chartData.chartData.map((item: any) => item.total),
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' as const },
            title: { display: false }
          }
        }
      };
    }
    
    // Handle subject distribution (pie/doughnut chart)
    if (Array.isArray(chartData) && 'subject' in (chartData[0] || {}) && (type === 'pie' || type === 'doughnut')) {
      return {
        data: {
          labels: chartData.map((item) => item.subject),
          datasets: [
            {
              data: chartData.map((item) => item.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(199, 199, 199, 0.6)',
              ]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' as const }
          }
        }
      };
    }
    
    // Handle session type data (bar chart)
    if (Array.isArray(chartData) && 'sessionType' in (chartData[0] || {}) && type === 'bar') {
      return {
        data: {
          labels: chartData.map(item => item.sessionType),
          datasets: [
            {
              label: 'Sessions',
              data: chartData.map(item => item.count),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' as const }
          }
        }
      };
    }
    
    // Handle sessions over time (line chart)
    if (Array.isArray(chartData) && 'date' in (chartData[0] || {})) {
      return {
        data: {
          labels: chartData.map(item => item.date),
          datasets: [
            {
              label: 'Sessions',
              data: chartData.map(item => item.count),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' as const }
          }
        }
      };
    }
    
    // Handle sessions over time (months/counts format)
    if (chartData.months && chartData.counts) {
      return {
        data: {
          labels: chartData.months,
          datasets: [
            {
              label: 'Sessions',
              data: chartData.counts,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' as const }
          }
        }
      };
    }
    
    // Fallback for unknown data structure
    return {
      data: { 
        labels: ['No Data'], 
        datasets: [{ label: 'No Data', data: [0], backgroundColor: 'rgba(200,200,200,0.5)' }] 
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' as const } }
      }
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !data ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <canvas ref={chartRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
