import React from "react";
import "./Header.css";
import { LuUtensilsCrossed } from "react-icons/lu";
import { Search } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import Logo from '../../../component/Logo/Logo'

export default function Header({
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  cartCount = 0,
  sections = [], // Nhận sections từ API
  loadingSections = false,
}) {
  return (
    <header className="menu-header">
      <div className="menu-header__left">
        <div className="menu-header__logo">
          <Logo />
        </div>

        <div className="menu-header__brand">
          <div className="brand-title">Nhà Hàng</div>
          <div className="brand-sub">Minh Quoanh Huân</div>
        </div>
      </div>

      <nav className="menu-header__tabs">
        {loadingSections ? (
          <div className="tabs-loading">Đang tải...</div>
        ) : (
          sections.map((section) => (
            <button
              key={section.id}
              className={`tab-btn ${activeTab === section.id ? "active" : ""}`}
              onClick={() => onTabChange(section.id)}
            >
              {section.name}
            </button>
          ))
        )}
      </nav>

      <div className="menu-header__right">
        <div className="search-box">
          <span className="search-icon"><Search /></span>
          <input
            placeholder="Tìm món ăn..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button className="cart-btn">
          <span className="cart-icon"><ShoppingCart /></span>
        </button>
      </div>
    </header>
  );
}
