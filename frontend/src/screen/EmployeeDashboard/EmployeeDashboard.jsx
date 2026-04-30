import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '../../component/AdminHeader/AdminHeader';
import AdminSidebar from '../../component/AdminSidebar/AdminSidebar';
import MenuManagement from '../MenuManagement/MenuManagement';
import TakeawayOrdersScreen from '../TakeawayOrdersScreen/TakeawayOrdersScreen';
import BookingsManagement from '../BookingsManagement/BookingsManagement';
import EmployeeHome from '../EmployeeHome/EmployeeHome';
import '../AdminDashboard/AdminDashboard.css';

const EmployeeDashboard = ({ user, onLogout }) => {
  return (
    <div className="admin-dashboard">
      <AdminHeader user={user} onLogout={onLogout} />

      <div className="admin-dashboard__body">
        <AdminSidebar onLogout={onLogout} userRole={user.role} basePath="/employee" />

        <main className="admin-dashboard__content">
          <Routes>
            <Route path="dashboard" element={<EmployeeHome />} />
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="takeaway" element={<TakeawayOrdersScreen userRole={user.role} />} />
            <Route path="menu" element={<MenuManagement user={user} />} />
            <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;