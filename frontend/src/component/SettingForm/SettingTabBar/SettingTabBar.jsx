import React, { useEffect, useState } from 'react';
import './SettingTabBar.css'
const SettingTabBar = ({ user, handleTabChange, initialTab = 'password', isOpen = false, onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Hàm xử lý khi nhấn vào tab
  const onTabClick = (tabKey) => {
    setActiveTab(tabKey);
    handleTabChange(tabKey);
  };
  const getButtonClass = (tabKey) => {
    return `setting-btn ${activeTab === tabKey ? 'active' : ''}`;
  };

  return (
    <>
      <button
        type="button"
        className={`setting-tab-bar__backdrop ${isOpen ? 'setting-tab-bar__backdrop--open' : ''}`}
        aria-label="Close profile navigation"
        onClick={onClose}
      />

    <div className={`Setting-tab-bar ${isOpen ? 'Setting-tab-bar--open' : ''}`}>
      <div className="AccountInfo">
        {/* Giả sử user.avatar là một URL hoặc một ký tự */}
        <span className="userAvatar">{user?.avatar || user?.username?.charAt(0) || 'U'}</span>
        <span className="userName">{user?.fullName || user?.username || 'User'}</span>
        <span className="userEmail">{user?.email || ''}</span>
      </div>
      
      <div className="settingList">
        <button 
          className={getButtonClass('profile')} 
          onClick={() => onTabClick('profile')}
        >
          Thông tin cá nhân
        </button>

        {/* Nút 1: Đổi mật khẩu */}
        <button 
          className={getButtonClass('password')} 
          onClick={() => onTabClick('password')}
        >
          Đổi mật khẩu
        </button>
        
        {/* Nút 2: Theo dõi đơn mang về */}
        <button 
          className={getButtonClass('delivery')} 
          onClick={() => onTabClick('delivery')}
        >
          Theo dõi đơn mang về
        </button>
        
        {/* Nút 3: Lịch sử đặt */}
        <button 
          className={getButtonClass('history')} 
          onClick={() => onTabClick('history')}
        >
          Lịch sử đặt
        </button>
        
      </div>
    </div>
    </>
  );
};

export default SettingTabBar;
