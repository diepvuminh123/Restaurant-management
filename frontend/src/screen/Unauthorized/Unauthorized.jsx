import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLockClosedOutline, IoShieldCheckmarkOutline, IoHomeOutline, IoArrowBackOutline } from 'react-icons/io5';
import './Unauthorized.css';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  const handleGoHome = () => {
    navigate('/'); // Về trang chủ
  };

  return (
    <div className="unauthorized-container">
      {/* Animated background particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="unauthorized-content">
        {/* Lock icon with animation */}
        <div className="lock-container">
          <div className="lock-glow"></div>
          <IoLockClosedOutline className="lock-icon" />
          <div className="shield-icon-wrapper">
            <IoShieldCheckmarkOutline className="shield-icon" />
          </div>
        </div>

        {/* Error code */}
        <div className="error-code-section">
          <h1 className="error-403">403</h1>
          <div className="error-line"></div>
        </div>

        {/* Message */}
        <h2 className="unauthorized-title">Truy Cập Bị Từ Chối</h2>
        <p className="unauthorized-message">
          Bạn không có thẩm quyền để truy cập trang này.
          <br />
          Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>

        {/* Info box */}
        <div className="info-box">
          <div className="info-item">
            <div className="info-icon">🔐</div>
            <div className="info-text">
              <strong>Yêu cầu đăng nhập</strong>
              <p>Vui lòng đăng nhập với tài khoản có quyền phù hợp</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="unauthorized-actions">
          <button className="btn-back" onClick={handleGoBack}>
            <IoArrowBackOutline />
            Quay lại
          </button>
          <button className="btn-home" onClick={handleGoHome}>
            <IoHomeOutline />
            Trang chủ
          </button>
        </div>

        {/* Additional help */}
        <div className="help-section">
          <p className="help-text">
            Cần trợ giúp? Liên hệ: <a href="mailto:admin@restaurant.com">admin@restaurant.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
