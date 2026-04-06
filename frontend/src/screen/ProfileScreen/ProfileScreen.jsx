import React from 'react';
import BackButton from '../../component/BackButton/BackButton';
import UserInfoForm from '../../component/SettingForm/SettingTabBar/UserInfoForm/UserInfoForm';
import './ProfileScreen.css';

export default function ProfileScreen({ user, onProfileUpdated }) {
  return (
    <div className="profile-screen">
      <div className="back-btn-container">
        <BackButton />
      </div>

      <div className="profile-screen-container">
        <div className="setting-content-area">
          <UserInfoForm user={user} onProfileUpdated={onProfileUpdated} />
        </div>
      </div>
    </div>
  );
}
