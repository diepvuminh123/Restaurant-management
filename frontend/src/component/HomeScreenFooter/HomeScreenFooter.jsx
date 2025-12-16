import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Globe } from 'lucide-react';
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";
import './HomeScreenFooter.css'; 

const FooterColumn = ({ title, links }) => (
    <div className="footer-col">
        <h3 className="col-title">{title}</h3>
        <ul className="col-links">
            {links.map((link, index) => (
                <li key={index} className="link-item">
                    {/* Sử dụng thẻ <a> với href="#" để mô phỏng link */}
                    <a href="#" className="link-text">{link}</a>
                </li>
            ))}
        </ul>
    </div>
);

const HomeScreenFooter = () => {
    // Dữ liệu cho các cột Footer
    const services = [
        "Đặt bàn", 
        "Thực đơn", 
        "Đặt món mang về", 
        "Sự kiện & Tiệc"
    ];

    const info = [
        "Về chúng tôi", 
        "Đánh giá", 
        "Tin tức", 
        "Tuyển dụng"
    ];

    const support = [
        "Chính sách bảo mật", 
        "Điều khoản sử dụng", 
        "Chính sách hoàn tiền", 
        "Liên hệ"
    ];

    return (
        <footer className="footer-container">
            <div className="footer-content-wrapper">
                
                {/* Cột 1: Logo và Mô tả */}
                <div className="footer-col brand-col">
                    <div className="footer-brand">
                        {/* Biểu tượng (Sử dụng biểu tượng ngẫu nhiên từ Lucide để mô phỏng) */}
                        <div className="brand-logo">
                            <LuUtensilsCrossed size={32} className="logo-icon" />
                        </div>
                        <div>
                            <h2 className="restaurant-name">Nhà Hàng Huân Minh Quoanh</h2>
                            <p className="slogan">Hương vị truyền thống</p>
                        </div>
                    </div>
                    
                    <p className="brand-description">
                        Trải nghiệm ẩm thực Việt Nam đích thực với không gian sang trọng và dịch vụ tận tâm. 
                        Chúng tôi cam kết mang đến những món ăn chất lượng cao nhất.
                    </p>

                    {/* Các biểu tượng mạng xã hội */}
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><Facebook size={20} className="social-icon" /></a>
                        <a href="#" aria-label="Instagram"><Instagram size={20} className="social-icon" /></a>
                        <a href="#" aria-label="Youtube"><Youtube size={20} className="social-icon" /></a>
                        <a href="#" aria-label="Email"><Mail size={20} className="social-icon" /></a>
                    </div>
                </div>

                {/* Cột 2: Dịch vụ */}
                <FooterColumn title="Dịch vụ" links={services} />

                {/* Cột 3: Thông tin */}
                <FooterColumn title="Thông tin" links={info} />

                {/* Cột 4: Hỗ trợ */}
                <FooterColumn title="Hỗ trợ" links={support} />

            </div>

            {/* Phần Copyright và Language Selector */}
            <div className="footer-bottom">
                <p className="copyright-text">
                    © 2025 Nhà Hàng Huân Minh Quoanh. All rights reserved.
                </p>
                <div className="language-selector">
                    <Globe size={18} className="lang-icon" />
                    <span>English</span>
                </div>
            </div>
        </footer>
    );
};

export default HomeScreenFooter;