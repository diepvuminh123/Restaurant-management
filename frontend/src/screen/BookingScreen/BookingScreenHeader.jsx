import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuHeaderLogo from '../../component/Logo/Logo';
import './BookingScreenHeader.css';

const BookingScreenHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="booking-screen-header">
      <div className="booking-screen-header__brand">
        <MenuHeaderLogo />
      </div>

      <div className="booking-screen-header__title">
        <h2>{t('header.reservation')}</h2>
        
      </div>

      <div className="booking-screen-header__spacer" aria-hidden="true" />
    </header>
  );
};

export default BookingScreenHeader;
