// SettingScreen.js (Dự kiến)

import React, { useState } from 'react';
import SettingTabBar from '../../component/SettingForm/SettingTabBar/SettingTabBar';
import UserInfoForm from '../../component/SettingForm/SettingTabBar/UserInfoForm/UserInfoForm';
import BackButton from '../../component/BackButton/BackButton'

import './SettingScreen.css'


export default function SettingScreen({user}) {
  const [currentView, setCurrentView] = useState('info');

  const renderContent = () => {
    switch (currentView) {
      case 'info':
        return <UserInfoForm user={user} />; 
      case 'password':
        return <div>Form Đổi mật khẩu</div>;
      case 'delivery':
        return <div>Theo dõi đơn mang về</div>;
      case 'history':
        return <div>Lịch sử đặt hàng</div>;
      default:
        return <UserInfoForm user={user} />;
    }
  };

  return (
    <div className="setting-screen">
      <div className="back-btn-container"> 
        <BackButton />
      </div>
      <div className="setting-screen-container">
      
      <SettingTabBar user={user} handleTabChange={setCurrentView} />
      <div className="setting-content-area">
        {renderContent()}
      </div>
      </div>
    </div>
  );
}