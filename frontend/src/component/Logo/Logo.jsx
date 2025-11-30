import React from "react";
import { useNavigate } from "react-router-dom";
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";
import "./Logo.css";

const MenuHeaderLogo = () => {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="header__left-section" onClick={handleGoHome}>
      <div className="header__logo-wrapper">
        <LuUtensilsCrossed className="icon icon-utensils" />
      </div>
      <div className="header__restaurant-info">
        <h1 className="header__restaurant-name">Nhà hàng Huân Minh Quanh</h1>
        <h2 className="header__tagline">Hương vị truyền thống</h2>
      </div>
    </div>
  );
};

export default MenuHeaderLogo;
