import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginScreen from './screen/LoginScreen/LoginScreen';
import HomeScreen from './screen/HomeScreen/HomeScreen';
import MenuScreen from './screen/MenuScreen/MenuScreen';
import ApiService from './services/apiService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await ApiService.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Clear sessionStorage
      sessionStorage.removeItem('user');
      setUser(null);
      console.log('User logged out and sessionStorage cleared');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <>
            <Route path="/home" element={<HomeScreen onLogout={handleLogout} user={user} />} />
            <Route path="/menu" element={<MenuScreen onLogout={handleLogout} user={user} />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LoginScreen onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signup" element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="signup" />} />
            <Route path="/verify" element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="verify" />} />
            <Route path="/forgot-password" element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="forgot" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
