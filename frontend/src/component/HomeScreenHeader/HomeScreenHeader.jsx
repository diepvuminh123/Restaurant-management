import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
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
  const userRole = user?.role;
  const profileMenuRef = useRef(null);

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsDropdownOpen((open) => !open);
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

  const handleEmployeePage = () => {
    navigate('/employee');
    setIsDropdownOpen(false);
  }

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (!isDropdownOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);


 

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

        <div className="header__profile" ref={profileMenuRef}>
          <button
            className="header__profile-trigger"
            type="button"
            onClick={handleProfileClick}
            aria-haspopup={user ? 'menu' : undefined}
            aria-expanded={user ? isDropdownOpen : undefined}
            aria-label={user ? t('header.account') : t('header.login')}
          >
            <CiUser className="icon icon-user" />
          {user && (
            <>
              <span className="header__username">
                {user.username}
              </span>
            </>
          )}
          </button>
          {user && (
            <>
              {isDropdownOpen && (
                <div className="profile__dropdown" role="menu">
                  <button
                    className="profile__dropdown-item"
                    onClick={handleLogout}
                    type="button"
                    role="menuitem"
                  >
                    {t('header.logout')}
                  </button>
                  <button
                    className="profile__dropdown-item"
                    onClick={handleProfile}
                    type="button"
                    role="menuitem"
                  >
                   {t('header.profile')}
                  </button>
                  {userRole === 'admin' && (
                    <button
                      className="profile__dropdown-item"
                      onClick={handleAdminPage}
                      type="button"
                      role="menuitem"
                    >
                      Trang admin
                    </button>
                  )}
                  {userRole === 'system_admin' && (
                    <button
                      className="profile__dropdown-item"
                      onClick={handleAdminPage}
                      type="button"
                      role="menuitem"
                    >
                      Trang quản trị hệ thống
                    </button>
                  )}
                  {userRole === 'employee' && (
                     <button 
                      className="profile__dropdown-item"
                      onClick={handleEmployeePage}
                      type="button"
                      role="menuitem"
                     >
                      Trang nhân viên
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

HomeScreenHeader.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    role: PropTypes.string,
  }),
  onLogout: PropTypes.func,
};

export default HomeScreenHeader;
