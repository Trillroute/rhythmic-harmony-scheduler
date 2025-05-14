
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AttendanceData } from '@/hooks/reports/types';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6B7280'];

interface AttendanceChartProps {
  data: AttendanceData;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Present', value: data.present },
    { name: 'Absent', value: data.absent },
    { name: 'Cancelled', value: data.cancelled },
    { name: 'No Show', value: data.noShow },
  ];

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
