import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import './BackButton.css';

const BackButton = ({ text = "Quay lại Trang chủ", onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/home'); // Quay lại trang chủ
    }
  };

  return (
    <button className="back-button" onClick={handleClick}>
      <IoArrowBack className="back-button__icon" />
      <span className="back-button__text">{text}</span>
    </button>
  );
};

export default BackButton;
