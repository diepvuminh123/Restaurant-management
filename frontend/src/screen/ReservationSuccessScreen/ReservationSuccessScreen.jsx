import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import './ReservationSuccessScreen.css';

const ReservationSuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

        <h2 className="success-title">Cảm ơn bạn!</h2>

        <div className="success-message">
          <p>
            Cảm ơn bạn đã hoàn tất đặt bàn. Thông tin về đặt bàn {selectedTable?.id} vào lúc{' '}
            <strong>{timeReservation}</strong> ngày <strong>{dayReservation}</strong> cho{' '}
            <strong>{guestCount} người</strong> đã được gửi qua mail cá nhân hoặc bạn có thể theo dõi
            đơn mang về ở trang cá nhân.
          </p>
        </div>

        <button className="back-home-btn" onClick={handleBackHome}>
          Quay lại Trang chủ
        </button>
      </div>

      <p className="footer-message">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>
    </div>
  );
};

export default ReservationSuccessScreen;
