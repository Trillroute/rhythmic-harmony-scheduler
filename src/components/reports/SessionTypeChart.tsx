
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SessionTypeChartProps {
  data: { type: string; subject: string; count: number }[];
}

const SessionTypeChart: React.FC<SessionTypeChartProps> = ({ data }) => {
  // Transform data for chart display
  const chartData = data.reduce((acc, curr) => {
    const existingItem = acc.find(item => item.type === curr.type);
    if (existingItem) {
      existingItem[curr.subject] = curr.count;
    } else {
      const newItem: any = { type: curr.type };
      newItem[curr.subject] = curr.count;
      acc.push(newItem);
    }
    return acc;
  }, [] as any[]);

  // Get unique subjects for bars
  const subjects = Array.from(new Set(data.map(item => item.subject)));
  
  // Generate colors for each subject
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          {subjects.map((subject, index) => (
            <Bar key={subject} dataKey={subject} name={subject} fill={colors[index % colors.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SessionTypeChart;
