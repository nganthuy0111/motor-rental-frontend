import React from 'react';
import DashboardCard from './DashboardCard';
import DashboardChart from './DashboardChart';
// import './Dashboard.css';
const ContentDashboard: React.FC = () => {
  const cards = [
    { title: 'Tổng số xe', value: 24, icon: '🚗', subText: 'Sẵn sàng: 18 xe' },
    { title: 'Đơn hôm nay', value: 12, icon: '📅', subText: '+2 so với hôm qua' },
    { title: 'Doanh thu hôm nay', value: '5.2M VND', icon: '💰', subText: '+12% so với hôm qua' },
    { title: 'Khách hàng', value: 156, icon: '👥', subText: '+8 khách mới trong nay' },
  ];

  const barChartData = {
    title: 'Doanh thu tuần này',
    type: 'bar' as const,
    data: [4, 5, 6, 7, 8, 6, 5],
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  };

  const lineChartData = {
    title: 'Xu hướng 6 tháng',
    type: 'line' as const,
    data: [90, 135, 180, 150, 165, 180],
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
  };

  return (
    <div className="bg-white p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded">Cập nhật 22/9/2025</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            subText={card.subText}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardChart {...barChartData} />
        <DashboardChart {...lineChartData} />
      </div>
    </div>
  );
};

export default ContentDashboard;