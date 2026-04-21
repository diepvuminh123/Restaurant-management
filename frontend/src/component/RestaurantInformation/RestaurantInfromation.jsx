import React from 'react';
import { Clock, Phone, MapPin, Map } from 'lucide-react';
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import './RestaurantInformation.css'; // Import file CSS

const RestaurantInformation = () => {
    const {
        isOpenNow,
        openingTime,
        closingTime,
        contactPhone,
        addressLine,
    } = useRestaurantInfoContext();
    const currentDay = new Date().toLocaleDateString('vi-VN', { weekday: 'long' });
    const normalizedPhone = contactPhone ? contactPhone.replace(/\s+/g, '') : '';
    const mapUrl = addressLine
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`
        : 'https://maps.google.com';

    // Sử dụng class CSS thuần túy đã định nghĩa trong HomeContactBar.css
    const openStatusClass = isOpenNow ? 'contact-bar__status--open' : 'contact-bar__status--closed';

    return (
        // section: Thanh thông tin chính
        <section className="contact-bar__section">
            {/* container: Giới hạn chiều rộng và căn giữa */}
            <div className="contact-bar__container">
                {/* content: Bố cục responsive */}
                <div className="contact-bar__content">
                    
                    {/* KHỐI TRÁI: Giờ mở cửa & Trạng thái */}
                    <div className="contact-bar__schedule">
                        
                        {/* 1. Trạng thái mở/đóng */}
                        <div className={`contact-bar__status ${openStatusClass}`}>
                            <span className="contact-bar__statusDot" aria-hidden="true" />
                            {isOpenNow ? 'Đang mở cửa' : 'Đóng cửa'}
                        </div>
                        
                        {/* 2. Chi tiết giờ */}
                        <div className="contact-bar__time">
                            <Clock className="w-4 h-4 contact-bar__icon-color mr-1" />
                            <span className="contact-bar__time-text">{currentDay}: {openingTime} - {closingTime}</span>
                        </div>
                    </div>
                    
                    {/* KHỐI PHẢI: Liên hệ & Địa chỉ */}
                    <div className="contact-bar__info">
                        
                        {/* 1. Điện thoại */}
                        <a href={normalizedPhone ? `tel:${normalizedPhone}` : '#'} className="contact-bar__link">
                            <Phone className="w-4 h-4 mr-1" />
                            {contactPhone || 'Vui lòng cập nhật số điện thoại'}
                        </a>
                        
                        {/* 2. Địa chỉ */}
                        <div className="contact-bar__address">
                            <MapPin className="w-4 h-4 mr-1" />
                            {addressLine || 'Vui lòng cập nhật địa chỉ nhà hàng'}
                        </div>
                        
                        {/* 3. Nút Chỉ đường */}
                        <a 
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-bar__button"
                        >
                            <Map className="w-4 h-4 mr-2" />
                            Chỉ đường
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RestaurantInformation;