import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginScreen from './screen/LoginScreen/LoginScreen';
import HomeScreen from './screen/HomeScreen/HomeScreen';
import MenuScreen from './screen/MenuScreen/MenuScreen';
function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    console.log("Logged in user:", userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return (
      <div className="App">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Chào mừng, {user.username}!</h1>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button 
            onClick={handleLogout}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#c66b33',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="signup" />} />
        <Route path="/verify" element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="verify" />} />
        <Route path="/forgot-password" element={<LoginScreen onLoginSuccess={handleLoginSuccess} initialView="forgot" />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/menu" element={<MenuScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
