
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AttendanceData } from '@/hooks/reports/types';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6B7280'];

interface AttendanceChartProps {
  data: AttendanceData;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  // Map the data into the format expected by recharts
  const chartData = data.categories.map((category, index) => ({
    name: category,
    value: data.data[index] || 0
  })).filter(item => item.value > 0);

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
