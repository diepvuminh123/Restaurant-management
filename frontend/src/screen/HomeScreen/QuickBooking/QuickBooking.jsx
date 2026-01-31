import React from 'react';
import { useNavigate } from "react-router-dom";
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import './QuickBooking.css';
import { CiStar,  CiCalendar } from 'react-icons/ci'; 


const QuickBooking = () => {
    const navigate = useNavigate();
    return (
        <div className="home-quick-booking-section">
            
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>4.8 • Hơn 500 đánh giá</span>
                    </div>

                    
                    <h1 className="restaurant-title">Nhà Hàng Huân Minh Quanh</h1>

                   
                    <p className="restaurant-description">
                        Trải nghiệm ẩm thực Việt Nam đích thực với không gian 
                        sang trọng và dịch vụ tận tâm
                    </p>

                    
                    <div className="action-buttons">
                        <button className="btn btn-primary">
                            <CiCalendar className="btn-icon" /> Đặt bàn
                        </button>
                        <button className="btn btn-secondary" onClick = {() => navigate('/menu')}>
                             Đặt món 
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