import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { BsCalendar3 } from 'react-icons/bs';
import { LuUtensilsCrossed } from 'react-icons/lu';
import { IoBagHandleOutline, IoLogOutOutline } from 'react-icons/io5';
import { HiOutlineUsers } from 'react-icons/hi2';
import { MdOutlineRateReview, MdLocalOffer, MdQuestionAnswer } from 'react-icons/md';
import { RiStore2Line } from 'react-icons/ri';
import './AdminSidebar.css';

const AdminSidebar = ({ onLogout, userRole, basePath }) => {
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

  return (
    <aside className="admin-sidebar">
      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar__item ${isActive ? 'admin-sidebar__item--active' : ''}`
            }
          >
            <span className="admin-sidebar__icon">{item.icon}</span>
            <span className="admin-sidebar__label">{item.label}</span>
          </NavLink>
        ))}

        
      </nav>
    </aside>
  );
};

export default AdminSidebar;
