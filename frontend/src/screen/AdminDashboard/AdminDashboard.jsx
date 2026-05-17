import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '../../component/AdminHeader/AdminHeader';
import AdminSidebar from '../../component/AdminSidebar/AdminSidebar';
import MenuManagement from '../MenuManagement/MenuManagement';
import UserManagement from '../UserManagement/UserManagement';
import ReviewManagement from '../ReviewManagement/ReviewManagement';
import RestaurantInfoManagement from '../RestaurantInfoManagement/RestaurantInfoManagement';
import PromotionManagement from '../PromotionManagement/PromotionManagement';
import FAQManagement from './FAQManagement/FAQManagement';
import Dashboard from '../Dashboard/Dashboard';
import SystemDocs from '../SystemDocs/SystemDocs';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const homeRedirectPath = user.role === 'system_admin' ? '/admin/system-docs' : '/admin/dashboard';

  return (
    <div className="admin-dashboard">
      <AdminHeader
        user={user}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((open) => !open)}
      />
      
      <div className="admin-dashboard__body">
        <AdminSidebar
          onLogout={onLogout}
          userRole={user.role}
          user={user}
          basePath="/admin"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="admin-dashboard__content">
          <Routes>
            <Route path="dashboard" element={
              user.role === 'admin' ? (
                <Dashboard />
              ) : (
                <Navigate to="/admin/system-docs" replace />
              )
            } />
            <Route path="menu" element={
              user.role === 'admin' ? (
                <MenuManagement user={user} />
              ) : (
                <Navigate to="/admin/system-docs" replace />
              )
            } />
            <Route path="reviews" element={
              user.role === 'admin' ? (
                <ReviewManagement />
              ) : (
                <Navigate to={homeRedirectPath} replace />
              )
            } />
            <Route path="users" element={
              (user.role === 'admin' || user.role === 'system_admin') ? (
                <UserManagement currentUser={user} />
              ) : (
                <Navigate to={homeRedirectPath} replace />
              )
            } />
            <Route path="restaurant-info" element={
              user.role === 'admin' ? (
                <RestaurantInfoManagement />
              ) : (
                <Navigate to={homeRedirectPath} replace />
              )
            } />
            <Route path="promotions" element={
              user.role === 'admin' ? (
                <PromotionManagement />
              ) : (
                <Navigate to={homeRedirectPath} replace />
              )
            } />
            <Route path="faqs" element={
              user.role === 'admin' ? (
                <FAQManagement />
              ) : (
                <Navigate to={homeRedirectPath} replace />
              )
            } />
            <Route path="system-docs" element={
              user.role === 'system_admin' ? (
                <SystemDocs />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } />
            <Route path="*" element={<Navigate to={homeRedirectPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
