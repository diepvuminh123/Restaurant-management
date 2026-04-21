import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Globe } from 'lucide-react';
import { LuUtensilsCrossed, LuPhone } from "react-icons/lu";
import './HomeScreenFooter.css';
import { useTranslation } from 'react-i18next';
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';

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
    const { t } = useTranslation();
    const { restaurantName, restaurantSlogan } = useRestaurantInfoContext();
    const currentYear = new Date().getFullYear();
    
    // Dữ liệu cho các cột Footer
    const services = [
        t('footer.bookTable'), 
        t('footer.menu'), 
        t('footer.takeaway'), 
        t('footer.events')
    ];

    const info = [
        t('footer.aboutUs'), 
        t('footer.reviews'), 
        t('footer.news'), 
        t('footer.careers')
    ];

    const support = [
        t('footer.privacy'), 
        t('footer.terms'), 
        t('footer.refund'), 
        t('footer.contact')
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
                            <h2 className="restaurant-name">{restaurantName || t('home.restaurantName')}</h2>
                            <p className="slogan">{restaurantSlogan || t('home.restaurantSlogan')}</p>
                        </div>
                    </div>
                    
                    <p className="brand-description">
                        {t('home.footerDescription')}
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
                <FooterColumn title={t('footer.services')} links={services} />

                {/* Cột 3: Thông tin */}
                <FooterColumn title={t('footer.information')} links={info} />

                {/* Cột 4: Hỗ trợ */}
                <FooterColumn title={t('footer.support')} links={support} />

            </div>

            {/* Phần Copyright và Language Selector */}
            <div className="footer-bottom">
                <p className="copyright-text">
                    {`© ${currentYear} ${restaurantName || t('home.restaurantName')}. All rights reserved.`}
                </p>
            </div>
        </footer>
    );
};

export default HomeScreenFooter;