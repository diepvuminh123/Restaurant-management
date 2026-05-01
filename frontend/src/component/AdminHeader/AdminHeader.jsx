import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CiUser } from 'react-icons/ci';
import { IoLogOutOutline } from 'react-icons/io5';
import { FiMenu, FiX } from 'react-icons/fi';
import { ICONS } from '../../constants/asset/icon';
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import './AdminHeader.css';

const AdminHeader = ({ user, onLogout, isSidebarOpen = false, onMenuToggle }) => {
  const navigate = useNavigate();
  const { restaurantName, restaurantSlogan } = useRestaurantInfoContext();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Xác định role display
  const getRoleDisplay = () => {
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'employee') return 'Nhân viên';
    return 'Khách hàng';
  };

  return (
    <header className="admin-header">
      <button
        type="button"
        className="admin-header__menu-toggle"
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      <div className="admin-header__left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className="admin-header__logo">
          <img src={ICONS.LOGO} alt="Logo" className="admin-header__logo-img" />
        </div>
        <div className="admin-header__brand">
          <h1 className="admin-header__brand-name">{restaurantName}</h1>
          <p className="admin-header__brand-subtitle">{restaurantSlogan}</p>
        </div>
      </div>

      <div className="admin-header__right">
        <div className="admin-header__user">
          <CiUser className="admin-header__user-icon" />
          <div className="admin-header__user-info">
            <span className="admin-header__user-role">{getRoleDisplay()}:</span>
            <span className="admin-header__user-name">{user.username}</span>
          </div>
        </div>

        <button className="admin-header__logout" onClick={handleLogout}>
          <IoLogOutOutline className="admin-header__logout-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
