// SettingScreen.js (Dự kiến)

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SettingTabBar from '../../component/SettingForm/SettingTabBar/SettingTabBar';
import ReservationHistory from '../../component/SettingForm/SettingTabBar/ReservationHistory/ReservationHistory';
import TakeawayOrderTracking from '../../component/SettingForm/SettingTabBar/TakeawayOrderTracking/TakeawayOrderTracking';
import UserInfoForm from '../../component/SettingForm/SettingTabBar/UserInfoForm/UserInfoForm';
import ChangePasswordForm from '../../component/SettingForm/SettingTabBar/ChangePasswordForm/ChangePasswordForm';
import BackButton from '../../component/BackButton/BackButton'

import './SettingScreen.css'


export default function SettingScreen({user, onProfileUpdated}) {
  const [searchParams] = useSearchParams();
  const initialTab = useMemo(() => {
    const fromQuery = searchParams.get('tab');
    const allowedTabs = ['profile', 'password', 'delivery', 'history'];
    return allowedTabs.includes(fromQuery) ? fromQuery : 'profile';
  }, [searchParams]);

  const [currentView, setCurrentView] = useState(initialTab);

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <UserInfoForm user={user} onProfileUpdated={onProfileUpdated} />;
      case 'password':
        return <ChangePasswordForm />;
      case 'delivery':
        return <TakeawayOrderTracking />;
      case 'history':
        return <ReservationHistory />;
      default:
        return <UserInfoForm user={user} onProfileUpdated={onProfileUpdated} />;
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