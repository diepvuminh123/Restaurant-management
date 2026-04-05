import React, { useEffect, useState } from 'react';
import './SettingTabBar.css'
const SettingTabBar = ({ user, handleTabChange, initialTab = 'info' }) => {
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
    <div className="Setting-tab-bar">
      <div className="AccountInfo">
        {/* Giả sử user.avatar là một URL hoặc một ký tự */}
        <span className="userAvatar">{user.avatar || user.username.charAt(0)}</span>
        <span className="userName">{user.username}</span>
        <span className="userEmail">{user.email}</span>
      </div>
      
      <div className="settingList">
        {/* Nút 1: Thông tin cá nhân */}
        <button 
          className={getButtonClass('info')} 
          onClick={() => onTabClick('info')}
        >
          Thông tin cá nhân
        </button>
        
        {/* Nút 2: Đổi mật khẩu */}
        <button 
          className={getButtonClass('password')} 
          onClick={() => onTabClick('password')}
        >
          Đổi mật khẩu
        </button>
        
        {/* Nút 3: Theo dõi đơn mang về */}
        <button 
          className={getButtonClass('delivery')} 
          onClick={() => onTabClick('delivery')}
        >
          Theo dõi đơn mang về
        </button>
        
        {/* Nút 4: Lịch sử đặt */}
        <button 
          className={getButtonClass('history')} 
          onClick={() => onTabClick('history')}
        >
          Lịch sử đặt
        </button>
        
      </div>
    </div>
  );
};

export default SettingTabBar;