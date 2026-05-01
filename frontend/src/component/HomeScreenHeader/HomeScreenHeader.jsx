import React, { useState } from "react";
import "./HomeScreenHeader.css";
import { LuPhone } from "react-icons/lu";
import { CiUser } from "react-icons/ci";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import MenuHeaderLogo from "../Logo/Logo";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
const HomeScreenHeader = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const { contactPhone } = useRestaurantInfoContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  const handleAdminPage = () => {
    navigate('/admin');
    setIsDropdownOpen(false);
  }

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
    setIsDropdownOpen(false);
  };


 

  return (
    <div className={`HeaderComponent ${isMobileNavOpen ? 'HeaderComponent--open' : ''}`}>
      <div className="home-header__brand">
        <MenuHeaderLogo />
      </div>

      <button
        className="header__menu-toggle"
        type="button"
        aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileNavOpen}
        onClick={() => setIsMobileNavOpen((open) => !open)}
      >
        {isMobileNavOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav className="header__nav" aria-label="Main navigation">
        <Link to="/menu" onClick={closeMobileNav}>{t('header.menu')}</Link>
        {!user && <Link to="/order-lookup" onClick={closeMobileNav}>{t('header.orderLookup')}</Link> }
         <Link to="/booking" onClick={closeMobileNav}>{t('header.reservation')}</Link>
        <Link to="/about" onClick={closeMobileNav}>{t('header.aboutUs')}</Link>
        {/* <Link to="/home">{t('header.contact')}</Link> */}
      </nav>

      <div className="header__right-section">
        <div className="header__contact">
          <LuPhone className="icon icon-phone" />
          <span className="header__phone-number">{contactPhone || t('header.phone')}</span>
        </div>

        <LanguageSwitcher />

        <div className="header__profile">
          <CiUser
            className="icon icon-user"
            onClick={handleProfileClick}
          />
          {user && (
            <>
              <span
                className="header__username"
                onClick={handleProfileClick}
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
                  {(user.role === 'admin' || user.role === 'employee') && (
                    <button
                      className="dropdown__logout-btn"
                      onClick={handleAdminPage}
                    >
                      Trang admin
                    </button>
                  )}
                  
                  
                  
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
