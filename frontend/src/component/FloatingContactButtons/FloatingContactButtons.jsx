import React, { useState } from 'react';
import { FaFacebook, FaPhone } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import './FloatingContactButtons.css';

const FloatingContactButtons = () => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  // Contact info - customize these URLs/numbers
  const messengerUrl = 'https://m.me/your-facebook-page-id'; // Replace with your Facebook page ID
  const zaloUrl = 'https://zalo.me/your-phone-number'; // Replace with your Zalo phone number
  const phoneNumber = '0912345678'; // Replace with your actual phone number

  const handleMessenger = () => {
    window.open(messengerUrl, '_blank');
  };

  const handleZalo = () => {
    window.open(zaloUrl, '_blank');
  };

  const handlePhoneClick = () => {
    setShowPhoneModal(true);
  };

  return (
    <>
      <div className="floating-contact-buttons">
        {/* Messenger Button */}
        <button
          className="contact-btn messenger-btn"
          onClick={handleMessenger}
          title="Chat với chúng tôi trên Messenger"
          aria-label="Messenger"
        >
          <FaFacebook size={24} />
        </button>

        {/* Zalo Button */}
        <button
          className="contact-btn zalo-btn"
          onClick={handleZalo}
          title="Liên hệ qua Zalo"
          aria-label="Zalo"
        >
          <SiZalo size={24} />
        </button>

        {/* Phone Button */}
        <button
          className="contact-btn phone-btn"
          onClick={handlePhoneClick}
          title="Gọi điện cho chúng tôi"
          aria-label="Phone"
        >
          <FaPhone size={24} />
        </button>
      </div>

      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="phone-popup-container">
          <div className="phone-popup">
            <button 
              className="phone-popup-close" 
              onClick={() => setShowPhoneModal(false)}
              title="Đóng"
            >
              −
            </button>
            <div className="phone-popup-content">
              <div className="phone-display">
                <span className="phone-number">{phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingContactButtons;
