import React from 'react';
import ReservationForm from '../ReservationForm/ReservationForm'; 

import './HomeReservation.css';
import { CiStar, CiPill } from 'react-icons/ci'; 
import { CiCalendar } from "react-icons/ci";

const HomeReservation = () => {
    return (
        <div className="home-quick-booking-section">
            
           
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>4.8 • Hơn 500 đánh giá</span>
                    </div>

                    
                    <h1 className="restaurant-title">Nhà Hàng Huân Minh Quoanh</h1>

                  
                    <p className="restaurant-description">
                        Trải nghiệm ẩm thực Việt Nam đích thực với không gian 
                        sang trọng và dịch vụ tận tâm
                    </p>

                    <div className="action-buttons">
                        <button className="btn btn-primary">
                            Đặt bàn
                        </button>
                        <button className="btn btn-secondary">
                            <CiCalendar className="btn-icon" /> Đặt món mang về
                        </button>
                    </div>
                </div>
                <div className="quick-booking-form-wrapper">
                    <ReservationForm /> 
                </div>

            </div>
            <div className="restaurant-main-image-wrapper"> 
                <div className="restaurant-main-image"></div>
            </div>
        </div>
    );
};

export default HomeReservation;