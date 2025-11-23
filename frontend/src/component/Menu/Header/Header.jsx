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
}) {
  const TABS = [
    { key: "main", label: "Món Chính" },
    { key: "drink", label: "Đồ Uống" },
    { key: "dessert", label: "Món Tráng Miệng" },
    { key: "combo", label: "Combo" },
    { key: "veggie", label: "Món Chay" },
  ];

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
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => onTabChange(t.key)}
          >
            {t.label}
          </button>
        ))}
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
