import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '../../component/AdminHeader/AdminHeader';
import AdminSidebar from '../../component/AdminSidebar/AdminSidebar';
import MenuManagement from '../MenuManagement/MenuManagement';
import TakeawayOrdersScreen from '../TakeawayOrdersScreen/TakeawayOrdersScreen';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <div className="admin-dashboard">
      <AdminHeader user={user} onLogout={onLogout} />
      
      <div className="admin-dashboard__body">
        <AdminSidebar onLogout={onLogout} userRole={user.role} />
        
        <main className="admin-dashboard__content">
          <Routes>
            <Route path="dashboard" element={
              <div>
                <h1>Dashboard Content</h1>
                <p>Nội dung trang quản trị sẽ được thêm vào đây...</p>
              </div>
            } />
            <Route path="bookings" element={
              <div>
                <h1>Đặt bàn</h1>
                <p>Quản lý đặt bàn tại nhà hàng...</p>
              </div>
            } />
            <Route path="takeaway" element={
              <TakeawayOrdersScreen />
            } />
            <Route path="menu" element={<MenuManagement user={user} />} />
            <Route path="users" element={
              user.role === 'admin' ? (
                <div>
                  <h1>Quản lý người dùng</h1>
                  <p>Chỉ admin mới thấy trang này...</p>
                </div>
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
