import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { BsCalendar3 } from 'react-icons/bs';
import { LuUtensilsCrossed } from 'react-icons/lu';
import { IoBagHandleOutline, IoLogOutOutline } from 'react-icons/io5';
import { CiUser } from 'react-icons/ci';
import { HiOutlineUsers } from 'react-icons/hi2';
import { MdOutlineRateReview, MdLocalOffer, MdQuestionAnswer } from 'react-icons/md';
import { RiStore2Line } from 'react-icons/ri';
import './AdminSidebar.css';

const AdminSidebar = ({ onLogout, userRole, user, basePath, isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const resolvedBasePath = basePath || (userRole === 'employee' ? '/employee' : '/admin');
  const menuItems = [
    {
      path: `${resolvedBasePath}/dashboard`,
      icon: <AiOutlineHome />,
      label: 'Trang chủ',
    },
  ];

  if (userRole === 'employee') {
    menuItems.push({
      path: `${resolvedBasePath}/bookings`,
      icon: <BsCalendar3 />,
      label: 'Đặt bàn (tại nhà hàng)',
    });

    menuItems.push({
      path: `${resolvedBasePath}/takeaway`,
      icon: <IoBagHandleOutline />,
      label: 'Đặt món mang đi',
    });
  }

  menuItems.push({
    path: `${resolvedBasePath}/menu`,
    icon: <LuUtensilsCrossed />,
    label: 'Trạng thái món ăn',
  });

  // Chỉ admin mới thấy menu Quản lý người dùng
  if (userRole === 'admin') {
    menuItems.push({
      path: `${resolvedBasePath}/reviews`,
      icon: <MdOutlineRateReview />,
      label: 'Quản lý đánh giá',
    });

    menuItems.push({
      path: `${resolvedBasePath}/restaurant-info`,
      icon: <RiStore2Line />,
      label: 'Thông tin nhà hàng',
    });

    menuItems.push({
      path: `${resolvedBasePath}/users`,
      icon: <HiOutlineUsers />,
      label: 'Quản lý người dùng',
    });

    menuItems.push({
      path: `${resolvedBasePath}/promotions`,
      icon: <MdLocalOffer />,
      label: 'Quản lý khuyến mãi',
    });

    menuItems.push({
      path: `${resolvedBasePath}/faqs`,
      icon: <MdQuestionAnswer />,
      label: 'Quản lý FAQ',
    });
  }

  const handleLogout = async () => {
    await onLogout?.();
    onClose?.();
    navigate('/login');
  };

  const roleLabel = userRole === 'admin' ? 'Admin' : userRole === 'employee' ? 'Nhân viên' : 'Tài khoản';

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

export default AdminSidebar;
