import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import LoginScreen from './screen/LoginScreen/LoginScreen';
import HomeScreen from './screen/HomeScreen/HomeScreen';
import MenuScreen from './screen/MenuScreen/MenuScreen';
import AdminDashboard from './screen/AdminDashboard/AdminDashboard';
import ApiService from './services/apiService';
import Loading from './component/Loading/Loading';
import SettingScreen from './screen/SettingScreen/SettingScreen';
import Error404 from './screen/Error404/Error404';
import Unauthorized from './screen/Unauthorized/Unauthorized';
import { ToastProvider, useToastContext } from './context/ToastContext';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  // Restore user from sessionStorage on page load
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from sessionStorage:', err);
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    // Save to sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log("Logged in user:", userData);
    toast.success("Đăng nhập thành công!");
  };

  // Helper function để xác định default route dựa trên role
  const getDefaultRoute = (userRole) => {
    if (userRole === 'admin' || userRole === 'employee') {
      return '/admin/dashboard';
    }
    return '/home';
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await ApiService.logout();
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error('Logout API error:', err);
      toast.error("Đăng xuất thất bại!");
    } finally {
      // Clear sessionStorage
      sessionStorage.removeItem('user');
      setUser(null);
      console.log('User logged out and sessionStorage cleared');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
      {/* Public routes - Không cần đăng nhập */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to={getDefaultRoute(user.role)} replace /> : 
          <LoginScreen onLoginSuccess={handleLoginSuccess} initialView="login" />
        } 
      />
        <Route 
          path="/signup" 
          element={
            user ? <Navigate to={getDefaultRoute(user.role)} replace /> : 
            <LoginScreen onLoginSuccess={handleLoginSuccess} initialView="signup" />
          } 
        />
        <Route 
          path="/verify" 
          element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="verify" />} 
        />
        <Route 
          path="/forgot-password" 
          element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="forgot" />} 
        />
        

        {/* Public pages - Không cần đăng nhập */}
        <Route 
          path="/home" 
          element={<HomeScreen onLogout={handleLogout} user={user} />} 
        />
        <Route 
          path="/menu" 
          element={<MenuScreen onLogout={handleLogout} user={user} />} 
        />

        {/* Admin/Employee routes */}
        <Route 
          path="/admin/*" 
          element={
            user && (user.role === 'admin' || user.role === 'employee') ? 
            <AdminDashboard user={user} onLogout={handleLogout} /> : 
            user ? <Unauthorized /> :
            <Navigate to="/login" replace />
          } 
        />

        {/* Setting route */}
        <Route
          path="/setting"
          element={
            user ? (
              <SettingScreen user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Error pages */}
        <Route path="/403" element={<Unauthorized />} />
        <Route path="/404" element={<Error404 />} />

        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to="/home" replace />} 
        />
        
        {/* 404 - Catch all undefined routes */}
        <Route 
          path="*" 
          element={<Error404 />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
