import React from 'react';
import SidebarItem from './SidebarItem';
import './Sidebar.css';

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const menuItems = [
  { icon: '📊', text: 'Dashboard' },
  { icon: '🚗', text: 'Quản lý xe' },
  { icon: '👥', text: 'Khách hàng' },
  { icon: '📝', text: 'Đơn thuê' },
  { icon: '📅', text: 'Lịch trình' },
  { icon: '📈', text: 'Báo cáo' },
  { icon: '📊', text: 'Thông kê' },
  { icon: '⏳', text: 'Log hoạt động' },
  { icon: '⚙️', text: 'Cài đặt' },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="w-64 h-screen bg-white shadow-lg p-4">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl text-red-500">🚗</span>
          <h2 className="ml-2 text-xl font-bold text-gray-800">Moto Rental Pro</h2>
        </div>
        <p className="text-xs text-gray-500">Hệ thống quản lý</p>
      </div>
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            text={item.text}
            active={selectedTab === item.text}
            onClick={() => setSelectedTab(item.text)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;