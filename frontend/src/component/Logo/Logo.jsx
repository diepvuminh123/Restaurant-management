import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";

const MenuHeaderLogo = () => {
    const navigate = useNavigate();
    const handleGoHome = () => {
        navigate('/home');
    };

    return (
        <div 
            
            className="Logo"
            onClick={handleGoHome}
            aria-label="Trang chủ"
            role="button" 
        >
            
            <LuUtensilsCrossed />
        </div>
    );
};

export default MenuHeaderLogo;