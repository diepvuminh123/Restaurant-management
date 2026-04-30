import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import RestaurantInformation from '../../../component/RestaurantInformation/RestaurantInfromation';
import HomeReservationImage from '../../../picture/HomeReservation.jpg';
import Restaurant1 from '../../../picture/Restaurant1.jpg';
import Restaurant2 from '../../../picture/Restaurant2.jpg';
import Restaurant3 from '../../../picture/Restaurant3.jpg';
import ApiService from '../../../services/apiService';
import { useRestaurantInfoContext } from '../../../context/RestaurantInfoContext';
import './QuickBooking.css';
import { CiCalendar, CiStar } from 'react-icons/ci';
import { FiShoppingBag, FiChevronLeft, FiChevronRight, FiGift, FiClock, FiCalendar, FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const QuickBooking = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        restaurantName,
        restaurantSlogan,
        contactPhone,
        contactEmail,
        addressLine,
        openingTime,
        closingTime,
        timeRangeLabel,
    } = useRestaurantInfoContext();

    const [featuredDishes, setFeaturedDishes] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);

    const PAGE_SIZE = 3;
    const [pageIndex, setPageIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('next');
    const touchStartXRef = useRef(null);

    // Fetch menu items (sorted by rating)
    useEffect(() => {
        fetchFeaturedDishes();
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const data = await ApiService.getActiveFaqs();
            if (Array.isArray(data)) {
                setFaqs(data);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        }
    };

    const fetchFeaturedDishes = async () => {
        try {
            setLoading(true);
            const filters = {
                limit: 100,
                sort_by: 'rating_avg',
                sort_order: 'DESC',
            };

            const response = await ApiService.getMenuItems(filters);
            if (response.success && response.items) {
                setFeaturedDishes(response.items);
            }
        } catch (error) {
            console.error('Error fetching featured dishes:', error);
            // Fallback: hiển thị array rỗng hoặc data mẫu
            setFeaturedDishes([]);
        } finally {
            setLoading(false);
        }
    };

    const sortedFeaturedDishes = useMemo(() => {
        const copy = Array.isArray(featuredDishes) ? [...featuredDishes] : [];
        copy.sort((a, b) => {
            const aRating = Number.isFinite(Number(a?.rating_avg)) ? Number(a.rating_avg) : -1;
            const bRating = Number.isFinite(Number(b?.rating_avg)) ? Number(b.rating_avg) : -1;
            return bRating - aRating;
        });
        return copy;
    }, [featuredDishes]);

    const totalPages = useMemo(() => {
        const count = Math.ceil(sortedFeaturedDishes.length / PAGE_SIZE);
        return Math.max(1, count);
    }, [sortedFeaturedDishes.length]);

    useEffect(() => {
        setPageIndex((prev) => Math.min(Math.max(prev, 0), totalPages - 1));
    }, [totalPages]);

    const pagedDishes = useMemo(() => {
        const start = pageIndex * PAGE_SIZE;
        return sortedFeaturedDishes.slice(start, start + PAGE_SIZE);
    }, [pageIndex, sortedFeaturedDishes]);

    const changePage = (direction) => {
        setPageIndex((prev) => {
            const nextIndex = direction === 'prev'
                ? Math.max(0, prev - 1)
                : Math.min(totalPages - 1, prev + 1);

            if (nextIndex !== prev) {
                setSlideDirection(direction);
            }

            return nextIndex;
        });
    };

    const goPrevPage = () => changePage('prev');
    const goNextPage = () => changePage('next');

    const onTouchStart = (e) => {
        touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
    };

    const onTouchEnd = (e) => {
        const startX = touchStartXRef.current;
        const endX = e.changedTouches?.[0]?.clientX ?? null;
        touchStartXRef.current = null;

        if (startX == null || endX == null) return;
        const deltaX = endX - startX;
        const threshold = 50;

        if (deltaX <= -threshold) goNextPage();
        if (deltaX >= threshold) goPrevPage();
    };

    let featuredMenuContent;

    if (loading) {
        featuredMenuContent = (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>
                <p>{t('common.loading')}</p>
            </div>
        );
    } else if (featuredDishes.length > 0) {
        featuredMenuContent = pagedDishes.map((dish, index) => (
            <article
                className="featured-dish-card"
                key={dish.id || dish.name}
                style={{ animationDelay: `${index * 70}ms` }}
            >
                <div className="featured-dish-card__media">
                    <img
                        src={dish.images && Array.isArray(dish.images) && dish.images.length > 0 ? dish.images[0] : HomeReservationImage}
                        alt={dish.name}
                        className="dish-thumb"
                    />
                    {dish.is_new ? <span className="featured-dish-card__tag">{t('menuScreen.new')}</span> : null}
                    {dish.is_popular ? <span className="featured-dish-card__tag">{t('menuScreen.popular')}</span> : null}
                </div>

                <div className="featured-dish-card__content">
                    <div className="featured-dish-card__headline">
                        <h3>{dish.name}</h3>
                        <span className="featured-dish-card__rating">
                            <CiStar /> {dish.rating_avg > 0 ? dish.rating_avg.toFixed(1) : t('home.featured.notRated')}
                        </span>
                    </div>

                    <p>{dish.description_short || dish.description || dish.desc}</p>
                    <div className="dish-price">{(dish.effective_price || dish.price || 0).toLocaleString()}đ</div>

                    <div className="featured-dish-card__actions">
                        <button
                            className="featured-dish-card__btn featured-dish-card__btn--primary"
                            type="button"
                            onClick={() => navigate('/menu')}
                            style={{ width: '100%' }}
                        >
                            <FiShoppingBag /> {t('home.featured.viewMenu')}
                        </button>
                    </div>
                </div>
            </article>
        ));
    } else {
        featuredMenuContent = (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>
                <p>{t('home.featured.empty')}</p>
            </div>
        );
    }

    const testimonials = [
        {
            name: 'Diep Vu Minh',
            role: t('home.testimonials.items.0.role'),
            stars: 5,
            text: t('home.testimonials.items.0.text'),
        },
        {
            name: 'Nguyen Le Minh Han',
            role: t('home.testimonials.items.1.role'),
            stars: 5,
            text: t('home.testimonials.items.1.text'),
        },
        {
            name: 'Ngo Quang Danh',
            role: t('home.testimonials.items.2.role'),
            stars: 4,
            text: t('home.testimonials.items.2.text'),
        },
    ];

    const perks = [
        { icon: <FiGift />, title: t('home.perks.items.0.title'), desc: t('home.perks.items.0.desc') },
        { icon: <FiClock />, title: t('home.perks.items.1.title'), desc: t('home.perks.items.1.desc') },
        { icon: <FiCalendar />, title: t('home.perks.items.2.title'), desc: t('home.perks.items.2.desc') },
    ];

    return (
        <div className="home-quick-booking-section">
            
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    
                    <div className="rating-badge">
                        <CiStar className="star-icon" />
                        <span>{t('home.rating')}</span>
                    </div>


                    <h1 className="restaurant-title">{restaurantName || t('home.restaurantName')}</h1>

                   
                    <p className="restaurant-description">
                        {restaurantSlogan || t('home.description')}
                    </p>

                    
                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={() => navigate('/booking')}>
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
                    <h2>{t('home.featured.title')}</h2>
                    <p className="home-featured-menu__subtitle">{t('home.featured.subtitle')}</p>
                </div>

                <div className="home-featured-menu__carousel">
                    {sortedFeaturedDishes.length > PAGE_SIZE ? (
                        <button
                            className="home-featured-menu__nav home-featured-menu__nav--prev"
                            type="button"
                            onClick={goPrevPage}
                            disabled={pageIndex === 0}
                            aria-label={t('home.featured.prevItems')}
                        >
                            <FiChevronLeft />
                        </button>
                    ) : null}

                    <div
                        className={`featured-grid featured-grid--animated featured-grid--${slideDirection}`}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        {featuredMenuContent}
                    </div>

                    {sortedFeaturedDishes.length > PAGE_SIZE ? (
                        <button
                            className="home-featured-menu__nav home-featured-menu__nav--next"
                            type="button"
                            onClick={goNextPage}
                            disabled={pageIndex >= totalPages - 1}
                            aria-label={t('home.featured.nextItems')}
                        >
                            <FiChevronRight />
                        </button>
                    ) : null}
                </div>

                {sortedFeaturedDishes.length > PAGE_SIZE ? (
                    <div className="home-featured-menu__status" aria-label={t('home.featured.pageStatus', { current: pageIndex + 1, total: totalPages })}>
                        <div className="home-featured-menu__status-bar" aria-hidden="true">
                            <span
                                className="home-featured-menu__status-fill"
                                style={{ width: `${((pageIndex + 1) / totalPages) * 100}%` }}
                            />
                        </div>
                        <span className="home-featured-menu__status-text">{pageIndex + 1}/{totalPages}</span>
                    </div>
                ) : null}
            </section>

            <section className="home-section home-testimonials">
                <div className="section-head centered">
                    <p className="section-subtitle">{t('home.testimonials.subtitle')}</p>
                    <h2>{t('home.testimonials.title')}</h2>
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
                    <p className="section-subtitle">{t('home.whyUs.subtitle')}</p>
                    <h2>{t('home.whyUs.title')}</h2>
                </div>
                <div className="why-grid">
                    <div className="why-item"><FiCheckCircle /> {t('home.whyUs.items.0')}</div>
                    <div className="why-item"><FiCheckCircle /> {t('home.whyUs.items.1')}</div>
                    <div className="why-item"><FiCheckCircle /> {t('home.whyUs.items.2')}</div>
                    <div className="why-item"><FiCheckCircle /> {t('home.whyUs.items.3')}</div>
                </div>
            </section>

            <section className="home-section home-gallery">
                <div className="section-head centered">
                    <p className="section-subtitle">{t('home.gallery.subtitle')}</p>
                </div>
                <div className="gallery-grid">
                    <img src={Restaurant1} alt={t('home.gallery.images.0')} />
                    <img src={Restaurant2} alt={t('home.gallery.images.1')} />
                    <img src={Restaurant3} alt={t('home.gallery.images.2')} />
                </div>
            </section>

            <section className="home-section home-perks">
                <div className="perk-grid">
                    {perks.map((perk) => (
                        <article className="perk-card" key={perk.title}>
                            <div className="perk-icon">{perk.icon}</div>
                            <h3>{perk.title}</h3>
                            <p>{perk.desc}</p>
                            <button className="mini-btn" onClick={() => navigate('/menu')}>{t('home.perks.viewDetails')}</button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section home-contact-map">
                <div className="section-head centered">
                    <p className="section-subtitle">{t('home.contact.subtitle')}</p>
                    <h2>{t('home.contact.title')}</h2>
                </div>
                <div className="contact-map-grid">
                    <div className="map-card">
                        <div className="map-pin"><FiMapPin /></div>
                        <h3>Google Maps</h3>
                        <p>{t('home.contact.mapDescription')}</p>
                        <a href="https://maps.google.com" target="_blank" rel="noreferrer">{t('home.contact.getDirections')}</a>
                    </div>
                    <div className="contact-card">
                        <h3>{t('home.contact.infoTitle')}</h3>
                        <p><FiMapPin /> {addressLine || t('home.contact.addressFallback')}</p>
                        <p><FiPhone /> {contactPhone || t('home.contact.phoneFallback')}</p>
                        <p><FiMail /> {contactEmail || t('home.contact.emailFallback')}</p>
                        <p><FiClock /> {t('home.contact.openingHours', { timeRangeLabel })}</p>
                    </div>
                </div>
            </section>

            {faqs.length > 0 && (
                <section className="home-section home-faq">
                    <div className="section-head centered">
                        <p className="section-subtitle">{t('home.faq.subtitle')}</p>
                        <h2>{t('home.faq.title')}</h2>
                    </div>
                    <div className="faq-list">
                        {faqs.map((faq) => (
                            <details className="faq-item" key={faq.id}>
                                <summary>{faq.question}</summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};

export default QuickBooking;

QuickBooking.propTypes = {
    user: PropTypes.object,
};