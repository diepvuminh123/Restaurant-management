import React from 'react';
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import './QuickBooking.css';
import { CiStar, CiPill } from 'react-icons/ci'; 

const QuickBooking = () => {
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
                            <CiStar className="btn-icon" /> Đặt bàn
                        </button>
                        <button className="btn btn-secondary">
                            <CiPill className="btn-icon" /> Đặt món mang về
                        </button>
                    </div>
                </div>

                
                <div className="quick-booking-form-wrapper">
                    <ReservationForm /> 
                </div>

            </div>
            
            <div className="restaurant-main-image">

            </div>

        </div>
    );
};

export default QuickBooking;
