import React, { useState } from "react";
import "./HomeScreenHeader.css";
import { LuPhone } from "react-icons/lu";
import { AiOutlineGlobal } from "react-icons/ai";
import { CiUser } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import MenuHeaderLogo from "../Logo/Logo";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
const HomeScreenHeader = ({ user, onLogout }) => {
  const { t } = useTranslation();
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
  const handleProfile = () =>  {
    navigate('/profile');
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
        <Link to="/menu">{t('header.menu')}</Link>
        {!user && <Link to="/order-lookup">Theo dõi đơn mang về </Link> }
         <Link to="/home">{t('header.reservation')}</Link>
        {/* <Link to="/home">{t('header.reviews')}</Link> */}
        <Link to="/home">{t('header.aboutUs')}</Link>
        <Link to="/home">{t('header.contact')}</Link>
      </nav>

      {/* Nhóm liên hệ, ngôn ngữ và profile - nằm bên phải */}
      <div className="header__right-section">
        {/* Số liên hệ */}
        <div className="header__contact">
          <LuPhone className="icon icon-phone" />
          <span className="header__phone-number">{t('header.phone')}</span>
        </div>

        {/* Chọn ngôn ngữ */}
        <LanguageSwitcher />

        {/* Hồ sơ người dùng / Đăng nhập */}
        <div className="header__profile">
          <CiUser
            className="icon icon-user"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          />
          {user && (
            <>
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
                    {t('header.logout')}
                  </button>
                  <button
                    className="dropdown__logout-btn"
                    onClick={handleProfile}
                  >
                   {t('header.profile')}
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
