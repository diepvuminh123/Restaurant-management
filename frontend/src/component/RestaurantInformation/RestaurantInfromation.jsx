import React from 'react';
import { Clock, Phone, MapPin, Map } from 'lucide-react';
import './RestaurantInformation.css'; // Import file CSS

const RestaurantInformation = () => {
    // Dữ liệu mock
    const isOpen = true; 
    const currentDay = "Thứ Bảy"; 

    // Sử dụng class CSS thuần túy đã định nghĩa trong HomeContactBar.css
    const openStatusClass = isOpen ? 'contact-bar__status--open' : 'contact-bar__status--closed';

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
                            {isOpen ? 'Đang mở cửa' : 'Đóng cửa'}
                        </div>
                        
                        {/* 2. Chi tiết giờ */}
                        <div className="contact-bar__time">
                            <Clock className="w-4 h-4 contact-bar__icon-color mr-1" />
                            <span className="contact-bar__time-text">{currentDay}: 09:00 - 22:00</span>
                        </div>
                    </div>
                    
                    {/* KHỐI PHẢI: Liên hệ & Địa chỉ */}
                    <div className="contact-bar__info">
                        
                        {/* 1. Điện thoại */}
                        <a href="tel:+84901234567" className="contact-bar__link">
                            <Phone className="w-4 h-4 mr-1" />
                            (+84) 90 123 4567
                        </a>
                        
                        {/* 2. Địa chỉ */}
                        <div className="contact-bar__address">
                            <MapPin className="w-4 h-4 mr-1" />
                            123 Nguyễn Huệ, Q.1, TPHCM
                        </div>
                        
                        {/* 3. Nút Chỉ đường */}
                        <a 
                            href="https://maps.app.goo.gl/example" 
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