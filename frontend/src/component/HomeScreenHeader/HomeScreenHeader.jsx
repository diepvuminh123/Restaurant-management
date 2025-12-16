import React, { useState } from "react";
import "./HomeScreenHeader.css";
import { LuPhone } from "react-icons/lu";
import { AiOutlineGlobal } from "react-icons/ai";
import { CiUser } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import MenuHeaderLogo from "../Logo/Logo";
import SettingTabBar from "../SettingForm/SettingTabBar/SettingTabBar"
const HomeScreenHeader = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    !user && navigate("/login");
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await onLogout();
    navigate("/");
    setIsDropdownOpen(false);
  };
  const handleSetting = () =>  {
    navigate("/setting")
    setIsDropdownOpen(false);
  }
 

  return (
    <div className="HeaderComponent">
      {/* Nhóm Logo và Tên Nhà hàng - nằm bên trái */}
      <div className="header__left-section">
        <MenuHeaderLogo />
      </div>

      {/* Các tab điều hướng - nằm ở giữa */}
      <nav className="header__nav">
        <Link to="/menu">Thực đơn</Link>
        <Link to="/home">Đặt bàn</Link>
        <Link to="/home">Đánh giá</Link>
        <Link to="/home">Về chúng tôi</Link>
        <Link to="/home">Liên hệ</Link>
      </nav>

      {/* Nhóm liên hệ, ngôn ngữ và profile - nằm bên phải */}
      <div className="header__right-section">
        {/* Số liên hệ */}
        <div className="header__contact">
          <LuPhone className="icon icon-phone" />
          <span className="header__phone-number">(+84)90 123 4567</span>
        </div>

        {/* Chọn ngôn ngữ */}
        <div className="header__language">
          <AiOutlineGlobal className="icon icon-global" />
          <select className="language-select">
            <option value="vi">EN</option> {/* Figma hiển thị EN */}
            <option value="en">VI</option>
          </select>
        </div>

        {/* Hồ sơ người dùng / Đăng nhập */}
        <div className="header__profile">
          <CiUser
            className="icon icon-user"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          />
          {user && (
            <>
            {console.log('User Info:', user)}
              <span
                className="header__username"
                onClick={handleProfileClick}
                style={{ cursor: "pointer" }}
              >
                {user.username}
              </span>
              {isDropdownOpen && (
                <div className="profile__dropdown">
                  <button
                    className="dropdown__logout-btn"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                  <button
                    className="dropdown__logout-btn"
                    onClick={handleSetting}
                  >
                   Thông tin cá nhân
                  </button>
                  
                  
                </div>
              )}
            </>
          )}
         
        </div>
      </div>
    </div>
  );
};

export default HomeScreenHeader;
