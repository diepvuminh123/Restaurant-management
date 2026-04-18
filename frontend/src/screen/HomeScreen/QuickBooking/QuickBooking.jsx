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
import './QuickBooking.css';
import { CiCalendar, CiStar } from 'react-icons/ci';
import { FiShoppingBag, FiChevronLeft, FiChevronRight, FiGift, FiClock, FiCalendar, FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const QuickBooking = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [featuredDishes, setFeaturedDishes] = useState([]);
    const [loading, setLoading] = useState(false);

    const PAGE_SIZE = 3;
    const [pageIndex, setPageIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('next');
    const touchStartXRef = useRef(null);

    // Fetch menu items (sorted by rating)
    useEffect(() => {
        fetchFeaturedDishes();
    }, []);

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
                <p>Đang tải...</p>
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
                    {dish.is_new ? <span className="featured-dish-card__tag">Mới</span> : null}
                    {dish.is_popular ? <span className="featured-dish-card__tag">Phổ biến</span> : null}
                </div>

                <div className="featured-dish-card__content">
                    <div className="featured-dish-card__headline">
                        <h3>{dish.name}</h3>
                        <span className="featured-dish-card__rating">
                            <CiStar /> {dish.rating_avg > 0 ? dish.rating_avg.toFixed(1) : 'Chưa đánh giá'}
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
                            <FiShoppingBag /> Xem thực đơn
                        </button>
                    </div>
                </div>
            </article>
        ));
    } else {
        featuredMenuContent = (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>
                <p>Không có món ăn trong danh mục này</p>
            </div>
        );
    }

    const testimonials = [
        {
            name: 'Diep Vu Minh',
            role: 'Yêu thích ẩm thực',
            stars: 5,
            text: 'Món ăn nhanh chóng được phục vụ, trình bày sang trọng và hương vị cân bằng. Bầu không khí bữa tối tuyệt vời.',
        },
        {
            name: 'Nguyen Le Minh Han',
            role: 'Khách hàng gia đình',
            stars: 5,
            text: 'Nhân viên phục vụ rất tuyệt vời và sắp xếp bàn cho chúng tôi nhanh chóng. Gia đình tôi rất hài lòng.',
        },
        {
            name: 'Ngo Quang Danh',
            role: 'Khách hàng công ty',
            stars: 4,
            text: 'Nơi tốt để họp nhóm với mức âm thanh thoải mái và các món nướng rất ngon.',
        },
    ];

    const perks = [
        { icon: <FiGift />, title: 'Ưu đãi cuối tuần', desc: 'Tiết kiệm 20% cho nhóm từ 6 khách trở lên.' },
        { icon: <FiClock />, title: 'Giờ vàng', desc: 'Thực đơn combo đặc biệt từ 14:00 đến 17:00 mỗi ngày.' },
        { icon: <FiCalendar />, title: 'Không gian riêng tư', desc: 'Phòng riêng cho 8-12 khách với thực đơn tùy chỉnh.' },
    ];

    const faqs = [
        {
            question: 'Tôi có thể đặt bàn như thế nào?',
            answer: 'Bạn có thể điền vào biểu mẫu đặt bàn nhanh ở đầu trang này hoặc gọi trực tiếp đến hotline của chúng tôi.',
        },
        {
            question: 'Bạn có hỗ trợ đặt bàn nhóm không?',
            answer: 'Có. Chúng tôi khuyên bạn đặt bàn trước 1-2 ngày để chúng tôi có thể chuẩn bị không gian và các tùy chọn thực đơn.',
        },
        {
            question: 'Có chỗ đỗ xe không?',
            answer: 'Có. Cả chỗ đỗ xe máy và ô tô đều có sẵn gần lối vào chính.',
        },
        {
            question: 'Giờ mở cửa của bạn là bao nhiêu?',
            answer: 'Chúng tôi mở cửa từ 11:00 đến 22:00 hàng ngày, và đến 22:30 vào cuối tuần.',
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
                    <h2>Thực đơn của chúng tôi</h2>
                    <p className="home-featured-menu__subtitle">Khám phá các món ăn đặc sắc được chế biến từ nguyên liệu tươi ngon hằng ngày</p>
                </div>

                <div className="home-featured-menu__carousel">
                    {sortedFeaturedDishes.length > PAGE_SIZE ? (
                        <button
                            className="home-featured-menu__nav home-featured-menu__nav--prev"
                            type="button"
                            onClick={goPrevPage}
                            disabled={pageIndex === 0}
                            aria-label="Xem 3 món trước"
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
                            aria-label="Xem 3 món tiếp theo"
                        >
                            <FiChevronRight />
                        </button>
                    ) : null}
                </div>

                {sortedFeaturedDishes.length > PAGE_SIZE ? (
                    <div className="home-featured-menu__status" aria-label={`Trang ${pageIndex + 1} trên ${totalPages}`}>
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
                    <p className="section-subtitle">Đánh giá 4.8 trên 5</p>
                    <h2>Đánh giá của khách hàng</h2>
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
                    <p className="section-subtitle">Chất lượng dịch vụ</p>
                    <h2>Những gì chúng tôi luôn mang lại</h2>
                </div>
                <div className="why-grid">
                    <div className="why-item"><FiCheckCircle /> Nguyên liệu tươi chuẩn bị hàng ngày</div>
                    <div className="why-item"><FiCheckCircle /> Hương vị Việt Nam với nét hiện đại</div>
                    <div className="why-item"><FiCheckCircle /> Không gian ấm áp với thiết kế tinh tế</div>
                    <div className="why-item"><FiCheckCircle /> Dịch vụ nhanh chóng và chuyên nghiệp</div>
                </div>
            </section>

            <section className="home-section home-gallery">
                <div className="section-head centered">
                    <p className="section-subtitle">Không gian nhà hàng</p>
                </div>
                <div className="gallery-grid">
                    <img src={Restaurant1} alt="Khu vực ăn uống" />
                    <img src={Restaurant2} alt="Bếp mở" />
                    <img src={Restaurant3} alt="Không gian đặc biệt" />
                </div>
            </section>

            <section className="home-section home-perks">
                <div className="perk-grid">
                    {perks.map((perk) => (
                        <article className="perk-card" key={perk.title}>
                            <div className="perk-icon">{perk.icon}</div>
                            <h3>{perk.title}</h3>
                            <p>{perk.desc}</p>
                            <button className="mini-btn" onClick={() => navigate('/menu')}>Xem chi tiết</button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section home-contact-map">
                <div className="section-head centered">
                    <p className="section-subtitle">Liên hệ và bản đồ</p>
                    <h2>Hãy ghé thăm chúng tôi hôm nay</h2>
                </div>
                <div className="contact-map-grid">
                    <div className="map-card">
                        <div className="map-pin"><FiMapPin /></div>
                        <h3>Google Maps</h3>
                        <p>Tìm chi nhánh gần nhất chỉ trong một lần nhấp và nhận chỉ dẫn ngay lập tức.</p>
                        <a href="https://maps.google.com" target="_blank" rel="noreferrer">Nhận chỉ dẫn</a>
                    </div>
                    <div className="contact-card">
                        <h3>Thông tin liên hệ</h3>
                        <p><FiMapPin /> 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1</p>
                        <p><FiPhone /> (+84) 90 123 4567</p>
                        <p><FiMail /> info@minhquoa.vn</p>
                    </div>
                </div>
            </section>

            <section className="home-section home-faq">
                <div className="section-head centered">
                    <p className="section-subtitle">Câu hỏi thường gặp</p>
                    <h2>Câu trả lời nhanh</h2>
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