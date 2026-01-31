import React from 'react';
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import './QuickBooking.css';
import { CiStar, CiPill } from 'react-icons/ci';
import { useTranslation } from 'react-i18next';

const QuickBooking = () => {
    const { t } = useTranslation();
    return (
        <div className="home-quick-booking-section">
            
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>{t('home.rating')}</span>
                    </div>

                    
                    <h1 className="restaurant-title">{t('home.restaurantName')}</h1>

                   
                    <p className="restaurant-description">
                        {t('home.description')}
                    </p>

                    
                    <div className="action-buttons">
                        <button className="btn btn-primary">
                            <CiStar className="btn-icon" /> {t('home.bookTable')}
                        </button>
                        <button className="btn btn-secondary">
                            <CiPill className="btn-icon" /> {t('home.takeaway')}
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