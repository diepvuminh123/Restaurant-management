import React, { useState } from 'react';
import "./Header.css";
// Giữ nguyên import icons
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";
import { AiOutlineGlobal } from "react-icons/ai";
import { CiUser } from "react-icons/ci";
import LoginScreen from '../../screen/LoginScreen/LoginScreen';
const Header = () => {
    
    const [isLogin, setIsLogin] = useState(false); 

   
    const handleLoginClick = () => {
        <LoginScreen />
        
    }

    return(
        <div className="HeaderComponent">
            
            <div className="header__left-section">
                <Logo />
            </div>

            
            <nav className="header__nav">
                <a href="#">Thực đơn</a>
                <a href="#">Đặt bàn</a>
                <a href="#">Đánh giá</a>
                <a href="#">Về chúng tôi</a>
                <a href="#">Liên hệ</a>
            </nav>

            
            <div className="header__right-section">
                
                <div className="header__contact">
                    <LuPhone className="icon icon-phone" />
                    <span className="header__phone-number">(+84)90 123 4567</span>
                </div>

                
                <div className="header__language">
                    <AiOutlineGlobal className="icon icon-global" />
                    <select className="language-select">
                        <option value="vi">EN</option> 
                        <option value="en">VI</option>
                    </select>
                </div>

                
                <div className="header__profile">
                    <CiUser className="icon icon-user" />
                    {!isLogin && (
                        <button className="loginButton" onClick={handleLoginClick}>Đăng nhập</button>
                    )}
                    
                    {isLogin && (
                        <span className="header__username" onClick={handleLoginClick}>Tài khoản</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;