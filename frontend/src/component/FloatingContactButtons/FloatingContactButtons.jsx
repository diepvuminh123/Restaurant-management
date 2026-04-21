import React, { useState } from 'react';
import { FaFacebook, FaPhone } from 'react-icons/fa';
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import './FloatingContactButtons.css';

const FloatingContactButtons = () => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const { contactPhone } = useRestaurantInfoContext();
  
  // Contact info - customize these URLs/numbers
  const messengerUrl = 'https://m.me/your-facebook-page-id'; // Replace with your Facebook page ID
  const zaloUrl = 'https://zalo.me/your-phone-number'; // Replace with your Zalo phone number
  const phoneNumber = contactPhone || 'Vui lòng cập nhật số điện thoại';

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
          <span className="contact-btn__ring" aria-hidden="true" />
          <FaFacebook size={24} className="contact-btn__icon" />
        </button>

        {/* Zalo Button */}
        <button
          className="contact-btn zalo-btn"
          onClick={handleZalo}
          title="Liên hệ qua Zalo"
          aria-label="Zalo"
        >
          <span className="contact-btn__ring" aria-hidden="true" />
          <span className="contact-btn__label">Zalo</span>
        </button>

        {/* Phone Button */}
        <button
          className="contact-btn phone-btn"
          onClick={handlePhoneClick}
          title="Gọi điện cho chúng tôi"
          aria-label="Phone"
        >
          <span className="contact-btn__ring" aria-hidden="true" />
          <FaPhone size={24} className="contact-btn__icon contact-btn__icon--phone" />
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
