// SettingScreen.js (Dự kiến)

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const viewLabels = {
    profile: 'Thông tin cá nhân',
    password: 'Đổi mật khẩu',
    delivery: 'Theo dõi đơn mang về',
    history: 'Lịch sử đặt',
  };

  const handleTabChange = (nextTab) => {
    setCurrentView(nextTab);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <UserInfoForm user={user} onProfileUpdated={onProfileUpdated} />;
      case 'password':
        return <ChangePasswordForm user={user} />;
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
      <button
        type="button"
        className="setting-mobile-menu-toggle"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label={isMenuOpen ? 'Close profile navigation' : 'Open profile navigation'}
        aria-expanded={isMenuOpen}
      >
        <span className="setting-mobile-menu-toggle__icon">
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </span>
        <span className="setting-mobile-menu-toggle__label">{viewLabels[currentView]}</span>
      </button>
      <div className="setting-screen-container">
      
      <SettingTabBar
        user={user}
        handleTabChange={handleTabChange}
        initialTab={initialTab}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <div className="setting-content-area">
        {renderContent()}
      </div>
      </div>
    </div>
  );
}

SettingScreen.propTypes = {
  user: PropTypes.object,
  onProfileUpdated: PropTypes.func,
};
