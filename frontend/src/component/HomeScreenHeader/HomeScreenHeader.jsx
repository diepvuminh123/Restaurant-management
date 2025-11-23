import React, { useState } from 'react';
import "./HomeScreenHeader.css";
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";
import { AiOutlineGlobal } from "react-icons/ai";
import { CiUser } from "react-icons/ci";
import {Link} from 'react-router-dom';
const HomeScreenHeader = () => {
    
    const [isLogin, setIsLogin] = useState(false); 

    
    const handleLoginClick = () => {
        setIsLogin(!isLogin); 
        alert(isLogin ? "Đã đăng xuất" : "Đã đăng nhập!");
    }

    return(
        <div className="HeaderComponent">
            {/* Nhóm Logo và Tên Nhà hàng - nằm bên trái */}
            <div className="header__left-section">
                <div className="header__logo-wrapper">
                    <LuUtensilsCrossed className="icon icon-utensils" />
                </div>
                <div className="header__restaurant-info">
                    <h1 className="header__restaurant-name">Nhà hàng Huân Minh Quanh</h1>
                    <h2 className="header__tagline">Hương vị truyền thống</h2>
                </div>
            </div>

            {/* Các tab điều hướng - nằm ở giữa */}
            <nav className="header__nav">
                <Link to="/menu">Thực đơn</Link>
                <Link to="/home">Đặt bàn</Link>
                <a href="#">Đánh giá</a>
                <a href="#">Về chúng tôi</a>
                <a href="#">Liên hệ</a>
            </nav>

            {/* Nhóm liên hệ, ngôn ngữ và profile - nằm bên phải */}
            <div className="header__right-section">
                {/* Số liên hệ */}
                <div className="header__contact">
                    <LuPhone className="icon icon-phone" />
                    <span className="header__phone-number">(+84)90 123 4567</span>
                </div>

                {/* Chọn ngôn ngữ */}
                <div className="header__language">
                    <AiOutlineGlobal className="icon icon-global" />
                    <select className="language-select">
                        <option value="vi">EN</option> {/* Figma hiển thị EN */}
                        <option value="en">VI</option>
                    </select>
                </div>

                {/* Hồ sơ người dùng / Đăng nhập */}
                <div className="header__profile">
                    <CiUser className="icon icon-user" />
                    {!isLogin && (
                        <button className="loginButton" onClick={handleLoginClick}>Đăng nhập</button>
                    )}
                    {/* Nếu đã đăng nhập, bạn có thể hiển thị tên người dùng hoặc icon khác */}
                    {isLogin && (
                        <span className="header__username" onClick={handleLoginClick}>Tài khoản</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomeScreenHeader;