
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartType,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData<any>;
  options?: ChartOptions<any>;
  height?: number;
  width?: number;
}

export function Chart({ type, data, options, height, width }: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={options} height={height} width={width} />;
      case 'bar':
        return <Bar data={data} options={options} height={height} width={width} />;
      case 'pie':
        return <Pie data={data} options={options} height={height} width={width} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} height={height} width={width} />;
      default:
        return <Line data={data} options={options} height={height} width={width} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderChart()}
    </div>
  );
}
