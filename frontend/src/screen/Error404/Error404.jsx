import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Error404.css';

export default function Error404() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  const handleGoHome = () => {
    navigate('/'); // Về trang chủ
  };

  return (
    <div className="error-404-container">
      <div className="error-404-content">
        {/* Cloud decoration */}
        <div className="clouds">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>

        {/* Error text background */}
        <div className="error-bg-text">error</div>

        {/* Balloon and 404 */}
        <div className="error-404-main">
          <div className="balloon"></div>
          <h1 className="error-code">404</h1>
        </div>

        {/* Message */}
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for might have been removed, had its name changed,
          <br />
          or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="error-404-actions">
          <button className="btn-go-back" onClick={handleGoBack}>
            ← GO BACK
          </button>
          <button className="btn-go-home" onClick={handleGoHome}>
            GO HOME
          </button>
        </div>

        {/* Copyright */}
        <p className="error-copyright">
          Copyright © 2025 By Restaurant Management. All rights reserved.
        </p>
      </div>
    </div>
  );
}
