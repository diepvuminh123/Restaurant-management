import React from "react";
import { useNavigate } from "react-router-dom";
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import "./Logo.css";

const MenuHeaderLogo = () => {
  const navigate = useNavigate();
  const { restaurantName, restaurantSlogan } = useRestaurantInfoContext();

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="header__left-section" onClick={handleGoHome}>
      <div className="header__logo-wrapper">
        <LuUtensilsCrossed className="icon icon-utensils" />
      </div>
      <div className="header__restaurant-info">
        <h1 className="header__restaurant-name">{restaurantName}</h1>
        <h2 className="header__tagline">{restaurantSlogan}</h2>
      </div>
    </div>
  );
};

export default MenuHeaderLogo;
