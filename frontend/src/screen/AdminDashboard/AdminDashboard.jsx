import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '../../component/AdminHeader/AdminHeader';
import AdminSidebar from '../../component/AdminSidebar/AdminSidebar';
import MenuManagement from '../MenuManagement/MenuManagement';
import TakeawayOrdersScreen from '../TakeawayOrdersScreen/TakeawayOrdersScreen';
import BookingsManagement from '../BookingsManagement/BookingsManagement';
import UserManagement from '../UserManagement/UserManagement';
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
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="takeaway" element={
              <TakeawayOrdersScreen />
            } />
            <Route path="menu" element={<MenuManagement user={user} />} />
            <Route path="users" element={
              user.role === 'admin' ? (
                <UserManagement currentUser={user} />
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
