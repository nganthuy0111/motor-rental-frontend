import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  subText?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, subText }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-gray-600">{title}</h3>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-red-600">{value}</p>
      {subText && <p className="text-sm text-gray-500">{subText}</p>}
    </div>
  );
};

export default DashboardCard;