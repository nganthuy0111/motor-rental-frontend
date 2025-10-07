import React, { useState } from 'react';
import HeaderDashboard from '../components/dashboard/header-dashboard/HeaderDashboard';
import Sidebar from '../components/dashboard/sidebar-dashboard/Sidebar';
import ContentDashboard from '../components/dashboard/content-dashboard/ContentDashboard';
import VehicleManagement from '../components/vehicle/VehicleManagement';
import CustomerManagement from '../components/customers/CustomerManagement';
import BookingManagement from '../components/booking/BookingManagement';
import Schedule from '../components/schedule/Schedule';
import ActivityLog from '../components/activity/ActivityLog';

const Dashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('Dashboard');

  let content = null;
  switch (selectedTab) {
    case 'Dashboard':
      content = <ContentDashboard />;
      break;
    case 'Quản lý xe':
      content = <VehicleManagement/>
      break;
    case 'Khách hàng':
      content = <CustomerManagement/>;
      break;
    case 'Đơn thuê':
      content = <BookingManagement/>;
      break;
    case 'Lịch trình':
      content = <Schedule/>;
      break;
    case 'Báo cáo':
      content = <div>Báo cáo (đang phát triển)</div>;
      break;
    case 'Thông kê':
      content = <div>Thông kê (đang phát triển)</div>;
      break;
    case 'Log hoạt động':
      content = <ActivityLog/>;
      break;
    case 'Cài đặt':
      content = <div>Cài đặt (đang phát triển)</div>;
      break;
    default:
      content = <div>Chọn tab để xem nội dung</div>;
  }

  return (
    <div>
      <HeaderDashboard />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <div className="flex-1 p-6 overflow-auto">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
