import React from 'react';
import PropTypes from 'prop-types';
import ReservationForm from '../../component/ReservationForm/ReservationForm';
import BookingScreenHeader from './BookingScreenHeader';
import './BookingScreen.css';
const BookingScreen = ({ user }) => {
  return (
    <>
    <BookingScreenHeader />
    <div className="BookingScreen">
      <ReservationForm user={user} />
    </div>
    </>
  );
};

BookingScreen.propTypes = {
  user: PropTypes.object,
};

export default BookingScreen;