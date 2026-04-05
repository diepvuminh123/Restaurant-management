// SettingScreen.js (Dự kiến)

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SettingTabBar from '../../component/SettingForm/SettingTabBar/SettingTabBar';
import UserInfoForm from '../../component/SettingForm/SettingTabBar/UserInfoForm/UserInfoForm';
import ReservationHistory from '../../component/SettingForm/SettingTabBar/ReservationHistory/ReservationHistory';
import TakeawayOrderTracking from '../../component/SettingForm/SettingTabBar/TakeawayOrderTracking/TakeawayOrderTracking';
import BackButton from '../../component/BackButton/BackButton'

import './SettingScreen.css'


export default function SettingScreen({user}) {
  const [searchParams] = useSearchParams();
  const initialTab = useMemo(() => {
    const fromQuery = searchParams.get('tab');
    const allowedTabs = ['info', 'password', 'delivery', 'history'];
    return allowedTabs.includes(fromQuery) ? fromQuery : 'info';
  }, [searchParams]);

  const [currentView, setCurrentView] = useState(initialTab);

  const renderContent = () => {
    switch (currentView) {
      case 'info':
        return <UserInfoForm user={user} />; 
      case 'password':
        return <div>Form Đổi mật khẩu</div>;
      case 'delivery':
        return <TakeawayOrderTracking />;
      case 'history':
        return <ReservationHistory />;
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
      
      <SettingTabBar user={user} handleTabChange={setCurrentView} initialTab={initialTab} />
      <div className="setting-content-area">
        {renderContent()}
      </div>
      </div>
    </div>
  );
}