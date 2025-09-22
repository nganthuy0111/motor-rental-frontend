import React from 'react';

interface DashboardChartProps {
  title: string;
  type: 'bar' | 'line';
  data: number[];
  labels: string[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ title, type, data, labels }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex-1 min-h-[200px]">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <div className="h-48 flex items-center justify-center">
        <div className="w-full h-full">
          {/* Mock chart rendering - replace with Chart.js or similar library */}
          <div className="text-center text-gray-500">
            {type === 'bar' ? 'Biểu đồ cột' : 'Biểu đồ đường'} (Dữ liệu mock)
          </div>
          <pre className="text-xs text-gray-700">
            {labels.join(', ')}<br />
            {data.join(', ')}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;