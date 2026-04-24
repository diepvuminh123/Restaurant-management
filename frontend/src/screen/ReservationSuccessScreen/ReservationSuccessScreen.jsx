import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import './ReservationSuccessScreen.css';

const ReservationSuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { selectedTable, dayReservation, timeReservation, guestCount } = location.state || {};

  useEffect(() => {
    // Nếu không có state, redirect về home (trường hợp user vào trực tiếp URL)
    if (!selectedTable) {
      navigate('/home', { replace: true });
    }
  }, [selectedTable, navigate]);

  const handleBackHome = () => {
    navigate('/home', { replace: true });
  };

  return (
    <div className="reservation-success-container">
      <div className="success-card">
        <div className="success-icon">
          <MdCheckCircle />
        </div>

        <h2 className="success-title">{t('reservationSuccess.title')}</h2>

        <div className="success-message">
          <p>
            {t('reservationSuccess.message', {
              tableId: selectedTable?.id,
              timeReservation,
              dayReservation,
              guestCount,
            })}
          </p>
        </div>

        <button className="back-home-btn" onClick={handleBackHome}>
          {t('reservationSuccess.backHome')}
        </button>
      </div>

      <p className="footer-message">{t('reservationSuccess.footer')}</p>
    </div>
  );
};

export default ReservationSuccessScreen;
