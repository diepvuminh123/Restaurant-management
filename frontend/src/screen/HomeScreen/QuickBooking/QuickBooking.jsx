import React from 'react';
import { useNavigate } from "react-router-dom";
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import './QuickBooking.css';
<<<<<<< HEAD
import { CiStar,  CiCalendar } from 'react-icons/ci'; 


const QuickBooking = () => {
    const navigate = useNavigate();
=======
import { CiStar, CiPill } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';

const QuickBooking = () => {
    const { t } = useTranslation();
>>>>>>> eed36e216509d468ddd9e31c4f24d957bff753fa
    return (
        <div className="home-quick-booking-section">
            
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>{t('home.rating')}</span>
                    </div>

                    
<<<<<<< HEAD
                    <h1 className="restaurant-title">Nhà Hàng Huân Minh Quanh</h1>
=======
                    <h1 className="restaurant-title">{t('home.restaurantName')}</h1>
>>>>>>> eed36e216509d468ddd9e31c4f24d957bff753fa

                   
                    <p className="restaurant-description">
                        {t('home.description')}
                    </p>

                    
                    <div className="action-buttons">
                        <button className="btn btn-primary">
<<<<<<< HEAD
                            <CiCalendar className="btn-icon" /> Đặt bàn
                        </button>
                        <button className="btn btn-secondary" onClick = {() => navigate('/menu')}>
                             Đặt món 
=======
                            <CiStar className="btn-icon" /> {t('home.bookTable')}
                        </button>
                        <button className="btn btn-secondary">
                            <CiPill className="btn-icon" /> {t('home.takeaway')}
>>>>>>> eed36e216509d468ddd9e31c4f24d957bff753fa
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