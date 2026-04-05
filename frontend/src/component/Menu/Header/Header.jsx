import React from "react";
import "./Header.css";
import { LuUtensilsCrossed } from "react-icons/lu";
import { Search } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import MenuHeaderLogo from '../../../component/Logo/Logo';
import Loading from '../../Loading/Loading'

export default function Header({
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  cartCount = 0,
  sections = [], // Nhận sections từ API
  loadingSections = false,
  onOpenCart, //Khi nhấn vô thì sẽ hiển thị giỏ hàng của khách hàng
}) {
  return (
    <header className="menu-header">
      <div className="menu-header__left">

          <MenuHeaderLogo />

       
      </div>

      <nav className="menu-header__tabs">
        {loadingSections ? (
          <Loading />
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
        <Link className="tracking-link" to="/order-lookup">
          Theo doi don mang ve
        </Link>

        <div className="search-box">
          <span className="search-icon"><Search /></span>
          <input
            placeholder="Tìm món ăn..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button className="cart-btn" onClick={onOpenCart}>
          <span className="cart-icon"><ShoppingCart /></span>
         {cartCount > 0 && (
          <span className="cart-items-quantity">{cartCount}</span>
         )}
        </button>
      </div>
    </header>
  );
}
