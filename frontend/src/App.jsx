import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginScreen from './screen/LoginScreen/LoginScreen';
import HomeScreen from './screen/HomeScreen/HomeScreen';
import AboutScreen from './screen/AboutScreen/AboutScreen';
import MenuScreen from './screen/MenuScreen/MenuScreen';
import AdminDashboard from './screen/AdminDashboard/AdminDashboard';
import EmployeeDashboard from './screen/EmployeeDashboard/EmployeeDashboard';
import CheckoutScreen from './screen/CheckoutScreen/CheckoutScreen';
import GuestOrderLookupScreen from './screen/GuestOrderLookupScreen/GuestOrderLookupScreen';
import TableMapScreen from './screen/TableMapScreen/TableMapScreen';
import ReservationSuccessScreen from './screen/ReservationSuccessScreen/ReservationSuccessScreen';
import BookingScreen from './screen/BookingScreen/BookingScreen';
import ApiService from './services/apiService';
import Loading from './component/Loading/Loading';
import SettingScreen from './screen/SettingScreen/SettingScreen';
import Error404 from './screen/Error404/Error404';
import Unauthorized from './screen/Unauthorized/Unauthorized';
import { ToastProvider, useToastContext } from './context/ToastContext';
import { RestaurantInfoProvider } from './context/RestaurantInfoContext';
import { STORAGE_KEYS } from './constants/storageKeys';

function AuthEntry({ user, initialView, onLoginSuccess, getDefaultRoute }) {
  const location = useLocation();

  if (user) {
    const redirectTo = location.state?.redirectTo;
    const redirectState = location.state?.redirectState;

    if (redirectTo) {
      return <Navigate to={redirectTo} state={redirectState} replace />;
    }

    // Check if user was booking a table - redirect to table-map instead of home
    const reservationInfo = sessionStorage.getItem(STORAGE_KEYS.RESERVATION_INFO);
    if (reservationInfo) {
      try {
        const parsedInfo = JSON.parse(reservationInfo);
        sessionStorage.removeItem(STORAGE_KEYS.RESERVATION_INFO);
        return <Navigate to="/table-map" state={parsedInfo} replace />;
      } catch (err) {
        console.error('Failed to parse reservation info:', err);
      }
    }

    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <LoginScreen onLoginSuccess={onLoginSuccess} initialView={initialView} />;
}

AuthEntry.propTypes = {
  user: PropTypes.object,
  initialView: PropTypes.string.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  getDefaultRoute: PropTypes.func.isRequired,
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  // Restore user from sessionStorage on page load
  useEffect(() => {
    const storedUser = sessionStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from sessionStorage:', err);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    // Cart được quản lý bởi server qua API, không cần xử lý cart ownership ở client
    // Backend tự động migrate guest cart sang user cart khi đăng nhập
    
    // Save to sessionStorage
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
    console.log("Logged in user:", userData);
    toast.success("Đăng nhập thành công!");
  };

  // Helper function để xác định default route dựa trên role
  const getDefaultRoute = (userRole) => {
    if (userRole === 'admin') {
      return '/admin/dashboard';
    }
    if (userRole === 'employee') {
      return '/employee/dashboard';
    }
    return '/home';
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API (sẽ clear session và cart ở server)
      await ApiService.logout();
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error('Logout API error:', err);
      toast.error("Đăng xuất thất bại!");
    } finally {
      // Clear user sessionStorage (cart được quản lý bởi server)
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      console.log('User logged out');
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setUser((prevUser) => {
      const nextUser = {
        ...prevUser,
        ...updatedUser,
      };
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
      <Routes>
      {/* Public routes - Không cần đăng nhập */}
      <Route 
        path="/login" 
        element={
          <AuthEntry user={user} initialView="login" onLoginSuccess={handleLoginSuccess} getDefaultRoute={getDefaultRoute} />
        } 
      />
        <Route 
          path="/signup" 
          element={
            <AuthEntry user={user} initialView="signup" onLoginSuccess={handleLoginSuccess} getDefaultRoute={getDefaultRoute} />
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
          path="/about" 
          element={<AboutScreen onLogout={handleLogout} user={user} />} 
        />
        <Route 
          path="/menu" 
          element={<MenuScreen onLogout={handleLogout} user={user} />} 
        />

        <Route
          path="/booking"
          element={<BookingScreen user={user} />}
        />

        {/* Backward-compatible redirect (header used to point here) */}
        <Route path="/reservation" element={<Navigate to="/booking" replace />} />
        <Route 
          path="/checkout" 
          element={<CheckoutScreen />} 
        />

        <Route 
          path="/order-lookup" 
          element={<GuestOrderLookupScreen />} 
        />

        <Route
          path="/table-map"
          element={<TableMapScreen />}
        />

        <Route
          path="/reservation-success"
          element={<ReservationSuccessScreen />}
        />

        {/* Admin routes */}
        <Route 
          path="/admin/*" 
          element={
            user && user.role === 'admin' ? 
            <AdminDashboard user={user} onLogout={handleLogout} /> : 
            user && user.role === 'employee' ? <Navigate to="/employee/dashboard" replace /> :
            user ? <Unauthorized /> :
            <Navigate to="/login" replace />
          } 
        />

        {/* Employee routes */}
        <Route 
          path="/employee/*" 
          element={
            user && user.role === 'employee' ? 
            <EmployeeDashboard user={user} onLogout={handleLogout} /> : 
            user && user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
            user ? <Unauthorized /> :
            <Navigate to="/login" replace />
          } 
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            user ? (
              <SettingScreen user={user} onProfileUpdated={handleUserUpdated} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Backward-compatible redirect */}
        <Route path="/setting" element={<Navigate to="/profile" replace />} />

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
  );
}

function App() {
  return (
    <ToastProvider>
      <RestaurantInfoProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </RestaurantInfoProvider>
    </ToastProvider>
  );
}

export default App;
