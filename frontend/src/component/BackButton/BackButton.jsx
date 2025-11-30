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
      navigate(-1); // Quay lại trang trước
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
