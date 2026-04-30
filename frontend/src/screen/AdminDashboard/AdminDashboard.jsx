import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '../../component/AdminHeader/AdminHeader';
import AdminSidebar from '../../component/AdminSidebar/AdminSidebar';
import MenuManagement from '../MenuManagement/MenuManagement';
import UserManagement from '../UserManagement/UserManagement';
import ReviewManagement from '../ReviewManagement/ReviewManagement';
import RestaurantInfoManagement from '../RestaurantInfoManagement/RestaurantInfoManagement';
import PromotionManagement from '../PromotionManagement/PromotionManagement';
import Dashboard from '../Dashboard/Dashboard';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <div className="admin-dashboard">
      <AdminHeader user={user} onLogout={onLogout} />
      
      <div className="admin-dashboard__body">
        <AdminSidebar onLogout={onLogout} userRole={user.role} basePath="/admin" />
        
        <main className="admin-dashboard__content">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="menu" element={<MenuManagement user={user} />} />
            <Route path="reviews" element={
              user.role === 'admin' ? (
                <ReviewManagement />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } />
            <Route path="users" element={
              (user.role === 'admin' || user.role === 'system_admin') ? (
                <UserManagement currentUser={user} />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } />
            <Route path="restaurant-info" element={
              user.role === 'admin' ? (
                <RestaurantInfoManagement />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } />
            <Route path="promotions" element={
              user.role === 'admin' ? (
                <PromotionManagement />
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
