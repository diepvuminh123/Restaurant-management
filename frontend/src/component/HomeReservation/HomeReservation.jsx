import React from 'react';
import PropTypes from 'prop-types';
import ReservationForm from '../ReservationForm/ReservationForm'; 
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';

import './HomeReservation.css';
import { CiStar, CiCalendar} from 'react-icons/ci'; 


const HomeReservation = ({ user }) => {
    const { restaurantName, restaurantSlogan } = useRestaurantInfoContext();

    return (
        <div className="home-quick-booking-section">
            
           
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>4.8 • Hơn 500 đánh giá</span>
                    </div>

                    
                    <h1 className="restaurant-title">{restaurantName}</h1>

                  
                    <p className="restaurant-description">
                        {restaurantSlogan}
                    </p>

                    <div className="action-buttons">
                        <button className="btn btn-primary">
                            <CiCalendar className="btn-icon" /> Đặt bàn
                        </button>
                        <button className="btn btn-secondary">
                         Đặt món mang về
                        </button>
                    </div>
                </div>
                <div className="quick-booking-form-wrapper">
                    <ReservationForm user={user} /> 
                </div>

            </div>
            <div className="restaurant-main-image-wrapper"> 
                <div className="restaurant-main-image"></div>
            </div>
        </div>
    );
};

export default HomeReservation;

HomeReservation.propTypes = {
    user: PropTypes.object,
};