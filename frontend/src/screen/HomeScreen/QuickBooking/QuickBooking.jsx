import React from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import RestaurantInformation from '../../../component/RestaurantInformation/RestaurantInfromation';
import HomeReservationImage from '../../../picture/HomeReservation.jpg';
import './QuickBooking.css';
import { CiCalendar, CiStar } from 'react-icons/ci';
import { FiPlus, FiShoppingBag } from 'react-icons/fi';
import { FiGift, FiClock, FiCalendar, FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const QuickBooking = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const featuredDishes = [
        {
            name: 'Phở Bò Đặc Biệt',
            desc: 'Phở bò truyền thống với nước dùng ninh từ xương bò 24 giờ',
            price: '85.000đ',
            rating: 4.9,
            popular: true,
            image: HomeReservationImage,
        },
        {
            name: 'Gỏi Cuốn Tôm Thịt',
            desc: 'Gỏi cuốn tươi ngon với tôm, thịt heo và rau sống',
            price: '45.000đ',
            rating: 4.7,
            popular: false,
            image: HomeReservationImage,
        },
        {
            name: 'Bún Chả Hà Nội',
            desc: 'Thịt nướng thơm phức, bún tươi và nước chấm đậm đà',
            price: '75.000đ',
            rating: 4.8,
            popular: true,
            image: HomeReservationImage,
        },
    ];

    const testimonials = [
        {
            name: 'Diep Vu Minh',
            role: 'Food lover',
            stars: 5,
            text: 'Food came out quickly, plating was elegant, and flavors were balanced. Great dinner atmosphere.',
        },
        {
            name: 'Nguyen Le Minh Han',
            role: 'Family guest',
            stars: 5,
            text: 'The staff supported us very well and arranged our table fast. My family was very satisfied.',
        },
        {
            name: 'Ngo Quang Danh',
            role: 'Corporate guest',
            stars: 4,
            text: 'Good place for team gatherings with comfortable sound levels and very good grilled dishes.',
        },
    ];

    const perks = [
        { icon: <FiGift />, title: 'Weekend Offer', desc: 'Save 20% for groups from 6 guests and above.' },
        { icon: <FiClock />, title: 'Happy Hour', desc: 'Special combo menu from 14:00 to 17:00 every day.' },
        { icon: <FiCalendar />, title: 'Private Space', desc: 'Private room for 8-12 guests with custom set menu.' },
    ];

    const faqs = [
        {
            question: 'How can I book a table?',
            answer: 'You can fill in the quick reservation form at the top of this page or call our hotline directly.',
        },
        {
            question: 'Do you support group bookings?',
            answer: 'Yes. We recommend booking 1-2 days in advance so we can prepare space and menu options.',
        },
        {
            question: 'Is parking available?',
            answer: 'Yes. Motorbike and car parking are both available near the main entrance.',
        },
        {
            question: 'What are your opening hours?',
            answer: 'We are open from 11:00 to 22:00 daily, and until 22:30 on weekends.',
        },
    ];

    return (
        <div className="home-quick-booking-section">
            
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>{t('home.rating')}</span>
                    </div>


                    <h1 className="restaurant-title">{t('home.restaurantName')}</h1>

                   
                    <p className="restaurant-description">
                        {t('home.description')}
                    </p>

                    
                    <div className="action-buttons">
                        <button className="btn btn-primary">
                            <CiCalendar className="btn-icon" /> {t('home.bookTable')}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/menu')}>
                            {t('home.takeaway')}
                        </button>
                    </div>
                </div>

                
                <div className="quick-booking-form-wrapper">
                    <ReservationForm user={user} /> 
                </div>

            </div>
            
            <div className="restaurant-main-image">

            </div>

            <RestaurantInformation />

            <section className="home-section home-featured-menu">
                <div className="section-head centered">
                    <h2>Thực đơn của chúng tôi</h2>
                    <p className="home-featured-menu__subtitle">Khám phá các món ăn đặc sắc được chế biến từ nguyên liệu tươi ngon hằng ngày</p>
                </div>
                <div className="home-featured-menu__tabs" role="tablist" aria-label="Danh mục món ăn">
                    <button className="home-featured-menu__tab home-featured-menu__tab--active" type="button">Món nổi bật</button>
                    <button className="home-featured-menu__tab" type="button">Theo mùa</button>
                    <button className="home-featured-menu__tab" type="button">Gợi ý cho bạn</button>
                </div>

                <div className="featured-grid">
                    {featuredDishes.map((dish) => (
                        <article className="featured-dish-card" key={dish.name}>
                            <div className="featured-dish-card__media">
                                <img src={dish.image} alt={dish.name} className="dish-thumb" />
                                {dish.popular ? <span className="featured-dish-card__tag">Phổ biến</span> : null}
                            </div>

                            <div className="featured-dish-card__content">
                                <div className="featured-dish-card__headline">
                                    <h3>{dish.name}</h3>
                                    <span className="featured-dish-card__rating"><CiStar /> {dish.rating}</span>
                                </div>

                                <p>{dish.desc}</p>
                                <div className="dish-price">{dish.price}</div>

                                <div className="featured-dish-card__actions">
                                    <button className="featured-dish-card__btn featured-dish-card__btn--ghost" type="button">
                                        <FiPlus /> Thêm
                                    </button>
                                    <button className="featured-dish-card__btn featured-dish-card__btn--primary" type="button" onClick={() => navigate('/menu')}>
                                        <FiShoppingBag /> Đặt mang về
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section home-testimonials">
                <div className="section-head centered">
                    <p className="section-subtitle">Rated 4.8 out of 5</p>
                    <h2>Guest Reviews</h2>
                </div>
                <div className="testimonial-grid">
                    {testimonials.map((item) => (
                        <article className="testimonial-card" key={item.name}>
                            <div className="testimonial-stars">{'*'.repeat(item.stars)}</div>
                            <p className="testimonial-text">{item.text}</p>
                            <div className="testimonial-author">
                                <strong>{item.name}</strong>
                                <span>{item.role}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section home-why-us">
                <div className="section-head centered">
                    <p className="section-subtitle">Service Quality</p>
                    <h2>What We Always Deliver</h2>
                </div>
                <div className="why-grid">
                    <div className="why-item"><FiCheckCircle /> Fresh ingredients prepared daily</div>
                    <div className="why-item"><FiCheckCircle /> Vietnamese flavors with modern touch</div>
                    <div className="why-item"><FiCheckCircle /> Warm ambience with refined design</div>
                    <div className="why-item"><FiCheckCircle /> Fast and professional service</div>
                </div>
            </section>

            <section className="home-section home-gallery">
                <div className="section-head centered">
                    <p className="section-subtitle">Restaurant Space</p>
                    <h2>Photo Gallery</h2>
                </div>
                <div className="gallery-grid">
                    <img src="/HomeReservation.jpg" alt="Dining area" />
                    <img src="/HomeReservation.jpg" alt="Open kitchen" />
                    <img src="/HomeReservation.jpg" alt="Signature dish" />
                </div>
            </section>

            <section className="home-section home-perks">
                <div className="perk-grid">
                    {perks.map((perk) => (
                        <article className="perk-card" key={perk.title}>
                            <div className="perk-icon">{perk.icon}</div>
                            <h3>{perk.title}</h3>
                            <p>{perk.desc}</p>
                            <button className="mini-btn" onClick={() => navigate('/menu')}>See details</button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section home-contact-map">
                <div className="section-head centered">
                    <p className="section-subtitle">Contact and Map</p>
                    <h2>Visit Us Today</h2>
                </div>
                <div className="contact-map-grid">
                    <div className="map-card">
                        <div className="map-pin"><FiMapPin /></div>
                        <h3>Google Maps</h3>
                        <p>Find the nearest branch in one tap and get directions instantly.</p>
                        <a href="https://maps.google.com" target="_blank" rel="noreferrer">Get directions</a>
                    </div>
                    <div className="contact-card">
                        <h3>Contact Info</h3>
                        <p><FiMapPin /> 123 Nguyen Hue, Ben Nghe Ward, District 1</p>
                        <p><FiPhone /> (+84) 90 123 4567</p>
                        <p><FiMail /> info@minhquoa.vn</p>
                    </div>
                </div>
            </section>

            <section className="home-section home-faq">
                <div className="section-head centered">
                    <p className="section-subtitle">Frequently Asked Questions</p>
                    <h2>Quick Answers</h2>
                </div>
                <div className="faq-list">
                    {faqs.map((faq) => (
                        <details className="faq-item" key={faq.question}>
                            <summary>{faq.question}</summary>
                            <p>{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default QuickBooking;

QuickBooking.propTypes = {
    user: PropTypes.object,
};