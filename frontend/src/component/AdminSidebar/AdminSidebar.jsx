import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, NavLink } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { BsCalendar3, BsGrid3X3Gap } from 'react-icons/bs';
import { LuUtensilsCrossed } from 'react-icons/lu';
import { IoBagHandleOutline, IoLogOutOutline } from 'react-icons/io5';
import { CiUser } from 'react-icons/ci';
import { HiOutlineUsers } from 'react-icons/hi2';
import { MdOutlineRateReview, MdLocalOffer, MdQuestionAnswer } from 'react-icons/md';
import { RiStore2Line, RiSettings3Line } from 'react-icons/ri';
import './AdminSidebar.css';

const AdminSidebar = ({ onLogout, userRole, user, basePath, isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const resolvedBasePath = basePath || (userRole === 'employee' ? '/employee' : '/admin');

  const menuItems = userRole === 'system_admin'
    ? [
        {
          path: `${resolvedBasePath}/system-docs`,
          icon: <RiSettings3Line />,
          label: 'Tài liệu hệ thống',
        },
        {
          path: `${resolvedBasePath}/users`,
          icon: <HiOutlineUsers />,
          label: 'Quản lý người dùng',
        },
      ]
    : [
        {
          path: `${resolvedBasePath}/dashboard`,
          icon: <AiOutlineHome />,
          label: 'Trang chủ',
        },
        ...(userRole === 'employee'
          ? [
              {
                path: `${resolvedBasePath}/bookings`,
                icon: <BsCalendar3 />,
                label: 'Đặt bàn (tại nhà hàng)',
              },
              {
                path: `${resolvedBasePath}/takeaway`,
                icon: <IoBagHandleOutline />,
                label: 'Đặt món mang đi',
              },
            ]
          : []),
        {
          path: `${resolvedBasePath}/menu`,
          icon: <LuUtensilsCrossed />,
          label: 'Trạng thái món ăn',
        },
        ...(userRole === 'admin'
          ? [
              {
                path: `${resolvedBasePath}/tables`,
                icon: <BsGrid3X3Gap />,
                label: 'Quản lý bàn',
              },
              {
                path: `${resolvedBasePath}/reviews`,
                icon: <MdOutlineRateReview />,
                label: 'Quản lý đánh giá',
              },
              {
                path: `${resolvedBasePath}/restaurant-info`,
                icon: <RiStore2Line />,
                label: 'Thông tin nhà hàng',
              },
              {
                path: `${resolvedBasePath}/users`,
                icon: <HiOutlineUsers />,
                label: 'Quản lý người dùng',
              },
              {
                path: `${resolvedBasePath}/promotions`,
                icon: <MdLocalOffer />,
                label: 'Quản lý khuyến mãi',
              },
              {
                path: `${resolvedBasePath}/faqs`,
                icon: <MdQuestionAnswer />,
                label: 'Quản lý FAQ',
              },
            ]
          : []),
      ];

  const handleLogout = async () => {
    await onLogout?.();
    onClose?.();
    navigate('/login');
  };

  const roleLabels = {
    admin: 'Admin',
    employee: 'Nhân viên',
    system_admin: 'SysAdmin',
  };
  const roleLabel = roleLabels[userRole] || 'Tài khoản';

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar__backdrop ${isOpen ? 'admin-sidebar__backdrop--open' : ''}`}
        aria-label="Close admin navigation"
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''}`}>
      <div className="admin-sidebar__mobile-account">
        <div className="admin-sidebar__mobile-user">
          <span className="admin-sidebar__mobile-user-icon">
            <CiUser />
          </span>
          <div className="admin-sidebar__mobile-user-copy">
            <span className="admin-sidebar__mobile-user-role">{roleLabel}</span>
            <strong className="admin-sidebar__mobile-user-name">{user?.username}</strong>
          </div>
        </div>

        <button
          type="button"
          className="admin-sidebar__mobile-logout"
          onClick={handleLogout}
        >
          <IoLogOutOutline />
          <span>Đăng xuất</span>
        </button>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar__item ${isActive ? 'admin-sidebar__item--active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar__icon">{item.icon}</span>
            <span className="admin-sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      </aside>
    </>
  );
};

AdminSidebar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
  basePath: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default AdminSidebar;
