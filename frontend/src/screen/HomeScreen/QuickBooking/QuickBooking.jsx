import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ReservationForm from '../../../component/ReservationForm/ReservationForm';
import RestaurantInformation from '../../../component/RestaurantInformation/RestaurantInfromation';
import Loading from '../../../component/Loading/Loading';
import HomeReservationImage from '../../../picture/HomeReservation.jpg';
import Restaurant1 from '../../../picture/Restaurant1.jpg';
import Restaurant2 from '../../../picture/Restaurant2.jpg';
import Restaurant3 from '../../../picture/Restaurant3.jpg';
import ApiService from '../../../services/apiService';
import { useRestaurantInfoContext } from '../../../context/RestaurantInfoContext';
import './QuickBooking.css';
import { CiStar } from 'react-icons/ci';
import { FiShoppingBag, FiChevronLeft, FiChevronRight, FiGift, FiClock, FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';
import { HiOutlineCalendarDays, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

const FEATURED_PAGE_SIZE = 3;
const PROMOTION_PAGE_SIZE = 3;

const getCompactLayoutState = () => Boolean(globalThis.window?.innerWidth <= 640);

const formatPromotionCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const formatPromotionDate = (value, language) => {
    if (!value) return '';

    return new Intl.DateTimeFormat(language?.startsWith('vi') ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
};

const getPromotionDiscountLabel = (promotion) => {
    if (promotion?.discount_type === 'PERCENTAGE') {
        return `${Number(promotion.discount_value || 0)}%`;
    }

    return formatPromotionCurrency(promotion?.discount_value);
};

const isPromotionAvailable = (promotion) => {
    if (promotion?.code && promotion?.is_active) {
        const now = Date.now();
        const startTime = new Date(promotion.start_date).getTime();
        const endTime = new Date(promotion.end_date).getTime();
        const withinUsageLimit = promotion.usage_limit == null || Number(promotion.used_count || 0) < Number(promotion.usage_limit);

        return startTime <= now && endTime >= now && withinUsageLimit;
    }

    return false;
};

const useCompactFeaturedLayout = () => {
    const [isCompactFeaturedLayout, setIsCompactFeaturedLayout] = useState(getCompactLayoutState);

    useEffect(() => {
        const handleResize = () => {
            setIsCompactFeaturedLayout(getCompactLayoutState());
        };

        handleResize();
        globalThis.window?.addEventListener('resize', handleResize);

        return () => globalThis.window?.removeEventListener('resize', handleResize);
    }, []);

    return isCompactFeaturedLayout;
};

const useFaqItems = () => {
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
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

        fetchFaqs();
    }, []);

    return faqs;
};

const useFeaturedDishesData = () => {
    const [featuredDishes, setFeaturedDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sectionCount, setSectionCount] = useState(0);

    useEffect(() => {
        const fetchFeaturedDishes = async () => {
            try {
                setLoading(true);
                const [menuResponse, sectionsResponse] = await Promise.all([
                    ApiService.getMenuItems({
                        limit: 100,
                        sort_by: 'rating_avg',
                        sort_order: 'DESC',
                    }),
                    ApiService.getMenuSections(),
                ]);

                if (menuResponse.success && menuResponse.items) {
                    setFeaturedDishes(menuResponse.items);
                }

                if (sectionsResponse.success && Array.isArray(sectionsResponse.data)) {
                    setSectionCount(sectionsResponse.data.length);
                }
            } catch (error) {
                console.error('Error fetching featured dishes:', error);
                setFeaturedDishes([]);
                setSectionCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedDishes();
    }, []);

    return { featuredDishes, loading, sectionCount };
};

const renderSectionLoading = () => (
    <div className="home-section__loading">
        <Loading />
    </div>
);

const usePromotionItems = () => {
    const [promotions, setPromotions] = useState([]);
    const [promotionsLoading, setPromotionsLoading] = useState(false);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setPromotionsLoading(true);
                const response = await ApiService.getPublicPromotions({
                    limit: 100,
                });

                if (response.success) {
                    const nextPromotions = Array.isArray(response.data) ? response.data : [];

                    setPromotions(nextPromotions);
                }
            } catch (error) {
                console.error('Error fetching promotions:', error);
                setPromotions([]);
            } finally {
                setPromotionsLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    return {
        promotionsLoading,
        availablePromotions: promotions,
    };
};

const useHomeTestimonials = (featuredDishes, t) => {
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            const reviewSourceItems = featuredDishes
                .filter((dish) => Number(dish?.rating_count || 0) > 0)
                .slice(0, 3);

            if (reviewSourceItems.length === 0) {
                setTestimonials([]);
                return;
            }

            try {
                const responses = await Promise.all(
                    reviewSourceItems.map((dish) =>
                        ApiService.getPublicReviewsByMenuItem(dish.id, { page: 1, limit: 1 })
                    )
                );

                const nextTestimonials = responses
                    .map((response, index) => {
                        const review = response?.data?.[0];
                        const dish = reviewSourceItems[index];

                        if (!review) {
                            return null;
                        }

                        return {
                            name: review.full_name || review.username || t('home.testimonials.anonymous'),
                            role: dish?.name || t('home.testimonials.guestRole'),
                            stars: Math.max(1, Math.min(5, Number(review.rating) || 5)),
                            text: review.comment || t('home.testimonials.emptyComment'),
                        };
                    })
                    .filter(Boolean);

                setTestimonials(nextTestimonials);
            } catch (error) {
                console.error('Error fetching testimonials:', error);
                setTestimonials([]);
            }
        };

        fetchTestimonials();
    }, [featuredDishes, t]);

    return testimonials;
};

const getGalleryImages = () => [Restaurant1, Restaurant2, Restaurant3];

const getDynamicHighlights = ({ t, sectionCount, featuredDishCount, promotionCount, faqCount, timeRangeLabel }) => {
    const highlightItems = [
        t('home.dynamicHighlights.menuSections', { count: sectionCount || featuredDishCount > 0 ? sectionCount : 0 }),
        t('home.dynamicHighlights.featuredDishes', { count: featuredDishCount }),
        t('home.dynamicHighlights.promotions', { count: promotionCount }),
        t('home.dynamicHighlights.faqs', { count: faqCount }),
    ];

    if (timeRangeLabel) {
        highlightItems[0] = t('home.dynamicHighlights.openHours', { timeRangeLabel });
    }

    return highlightItems;
};

const renderFeaturedContent = ({ loading, featuredDishes, featuredDishesToRender, navigate, t }) => {
    if (loading) {
        return renderSectionLoading();
    }

    if (featuredDishes.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>
                <p>{t('home.featured.empty')}</p>
            </div>
        );
    }

    return featuredDishesToRender.map((dish, index) => (
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
};

const renderPromotionContent = ({ promotionsLoading, promotionsToRender, navigate, t, i18n }) => {
    if (promotionsLoading) {
        return renderSectionLoading();
    }

    if (promotionsToRender.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>
                <p>{t('home.promotions.empty')}</p>
            </div>
        );
    }

    return promotionsToRender.map((promotion, index) => (
        <article
            className="perk-card"
            key={promotion.id || promotion.code}
            style={{ animationDelay: `${index * 70}ms` }}
        >
            <div className="perk-icon"><FiGift /></div>
            <div className="perk-card__code">{promotion.code}</div>
            <h3>{getPromotionDiscountLabel(promotion)}</h3>
            <p>{promotion.description || t('home.promotions.noDescription')}</p>
            <div className="perk-card__meta">
                <span>{t('home.promotions.minOrder', { value: formatPromotionCurrency(promotion.min_order_value) })}</span>
                <span>{t('home.promotions.validUntil', { date: formatPromotionDate(promotion.end_date, i18n.language) })}</span>
            </div>
            <button className="mini-btn" onClick={() => navigate('/menu')}>
                {t('home.perks.viewDetails')}
            </button>
        </article>
    ));
};

const QuickBooking = ({ user }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const {
        restaurantName,
        restaurantSlogan,
        brandImageUrl,
        contactPhone,
        contactEmail,
        addressLine,
        timeRangeLabel,
    } = useRestaurantInfoContext();

    const faqs = useFaqItems();
    const isCompactFeaturedLayout = useCompactFeaturedLayout();
    const { featuredDishes, loading, sectionCount } = useFeaturedDishesData();
    const { availablePromotions, promotionsLoading } = usePromotionItems();
    const testimonials = useHomeTestimonials(featuredDishes, t);

    const [pageIndex, setPageIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('next');
    const [promotionPageIndex, setPromotionPageIndex] = useState(0);
    const [promotionSlideDirection, setPromotionSlideDirection] = useState('next');
    const touchStartXRef = useRef(null);
    const featuredGridRef = useRef(null);
    const dragStateRef = useRef({
        isDragging: false,
        pointerType: null,
        startX: 0,
        startScrollLeft: 0,
    });

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
        const count = Math.ceil(sortedFeaturedDishes.length / FEATURED_PAGE_SIZE);
        return Math.max(1, count);
    }, [sortedFeaturedDishes.length]);

    useEffect(() => {
        setPageIndex((prev) => Math.min(Math.max(prev, 0), totalPages - 1));
    }, [totalPages]);

    const pagedDishes = useMemo(() => {
        const start = pageIndex * FEATURED_PAGE_SIZE;
        return sortedFeaturedDishes.slice(start, start + FEATURED_PAGE_SIZE);
    }, [pageIndex, sortedFeaturedDishes]);

    const featuredDishesToRender = isCompactFeaturedLayout ? sortedFeaturedDishes : pagedDishes;

    const promotionTotalPages = useMemo(() => {
        const count = Math.ceil(availablePromotions.length / PROMOTION_PAGE_SIZE);
        return Math.max(1, count);
    }, [availablePromotions.length]);

    useEffect(() => {
        setPromotionPageIndex((prev) => Math.min(Math.max(prev, 0), promotionTotalPages - 1));
    }, [promotionTotalPages]);

    const pagedPromotions = useMemo(() => {
        if (isCompactFeaturedLayout) {
            return availablePromotions;
        }

        const start = promotionPageIndex * PROMOTION_PAGE_SIZE;
        return availablePromotions.slice(start, start + PROMOTION_PAGE_SIZE);
    }, [availablePromotions, isCompactFeaturedLayout, promotionPageIndex]);

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

    const changePromotionPage = (direction) => {
        setPromotionPageIndex((prev) => {
            const nextPage = direction === 'prev'
                ? Math.max(0, prev - 1)
                : Math.min(promotionTotalPages - 1, prev + 1);

            if (nextPage !== prev) {
                setPromotionSlideDirection(direction);
            }

            return nextPage;
        });
    };

    const goPrevPromotionPage = () => changePromotionPage('prev');
    const goNextPromotionPage = () => changePromotionPage('next');

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

    const handleFeaturedPointerDown = (event) => {
        if (!isCompactFeaturedLayout || !featuredGridRef.current) return;
        if (event.pointerType !== 'mouse') return;

        dragStateRef.current = {
            isDragging: true,
            pointerType: event.pointerType,
            startX: event.clientX,
            startScrollLeft: featuredGridRef.current.scrollLeft,
        };

        featuredGridRef.current.setPointerCapture?.(event.pointerId);
    };

    const handleFeaturedPointerMove = (event) => {
        if (
            !isCompactFeaturedLayout ||
            !featuredGridRef.current ||
            !dragStateRef.current.isDragging ||
            dragStateRef.current.pointerType !== 'mouse'
        ) return;

        const deltaX = event.clientX - dragStateRef.current.startX;
        featuredGridRef.current.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    };

    const handleFeaturedPointerUp = (event) => {
        if (!isCompactFeaturedLayout || !featuredGridRef.current) return;

        dragStateRef.current = {
            isDragging: false,
            pointerType: null,
            startX: 0,
            startScrollLeft: 0,
        };
        featuredGridRef.current.releasePointerCapture?.(event.pointerId);
    };

    const featuredGridClassName = isCompactFeaturedLayout
        ? 'featured-grid featured-grid--mobile'
        : `featured-grid featured-grid--animated featured-grid--${slideDirection}`;

    const promotionGridClassName = isCompactFeaturedLayout
        ? 'perk-grid'
        : `perk-grid perk-grid--animated perk-grid--${promotionSlideDirection}`;

    const featuredMenuContent = renderFeaturedContent({
        loading,
        featuredDishes,
        featuredDishesToRender,
        navigate,
        t,
    });

    const promotionsContent = renderPromotionContent({
        promotionsLoading,
        promotionsToRender: pagedPromotions,
        navigate,
        t,
        i18n,
    });

    const testimonialItems = testimonials.length > 0
        ? testimonials
        : [
            {
                name: t('home.testimonials.items.0.name'),
                role: t('home.testimonials.items.0.role'),
                stars: 5,
                text: t('home.testimonials.items.0.text'),
            },
            {
                name: t('home.testimonials.items.1.name'),
                role: t('home.testimonials.items.1.role'),
                stars: 5,
                text: t('home.testimonials.items.1.text'),
            },
            {
                name: t('home.testimonials.items.2.name'),
                role: t('home.testimonials.items.2.role'),
                stars: 4,
                text: t('home.testimonials.items.2.text'),
            },
        ];

    const whyUsItems = getDynamicHighlights({
        t,
        sectionCount,
        featuredDishCount: featuredDishes.length,
        promotionCount: availablePromotions.length,
        faqCount: faqs.length,
        timeRangeLabel,
    });

    const galleryImages = getGalleryImages();

    const heroHighlights = [
        {
            key: 'hours',
            icon: FiClock,
            label: t('home.heroHighlights.openHoursLabel'),
            value: timeRangeLabel || t('home.heroHighlights.openHoursFallback'),
        },
        {
            key: 'featured',
            icon: FiShoppingBag,
            label: t('home.heroHighlights.featuredLabel'),
            value: t('home.heroHighlights.featuredValue', { count: featuredDishes.length }),
        },
        {
            key: 'promotions',
            icon: FiGift,
            label: t('home.heroHighlights.promotionsLabel'),
            value: t('home.heroHighlights.promotionsValue', { count: availablePromotions.length }),
        },
    ];

    const mapHref = addressLine
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`
        : 'https://maps.google.com';

    return (
        <div className="home-quick-booking-section">
            
            <div className="booking-content-top">
                
                
                <div className="restaurant-info-panel">
                    <p className="hero-kicker">{t('home.heroKicker')}</p>
                    <h1 className="restaurant-title">{restaurantName || t('home.restaurantName')}</h1>

                   
                    <p className="restaurant-description">
                        {restaurantSlogan || t('home.description')}
                    </p>

                    <div className="hero-highlight-grid">
                        {heroHighlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article className="hero-highlight-card" key={item.key}>
                                    <div className="hero-highlight-card__icon">
                                        <Icon />
                                    </div>
                                    <div className="hero-highlight-card__content">
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    
                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={() => navigate('/booking')}>
                            <span className="btn-icon-wrap" aria-hidden="true">
                                <HiOutlineCalendarDays className="btn-icon" />
                            </span>
                            <span>{t('home.bookTable')}</span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/menu')}>
                            <span className="btn-icon-wrap" aria-hidden="true">
                                <HiOutlineShoppingBag className="btn-icon" />
                            </span>
                            <span>{t('home.takeaway')}</span>
                        </button>
                    </div>
                </div>

                
                <div className="quick-booking-form-wrapper">
                    <ReservationForm user={user} /> 
                </div>

            </div>
            
            <div
                className="restaurant-main-image"
                style={brandImageUrl ? { backgroundImage: `url(${brandImageUrl})` } : undefined}
            />

            <RestaurantInformation />

            <section className="home-section home-featured-menu">
                <div className="section-head centered">
                    <h2>{t('home.featured.title')}</h2>
                    <p className="home-featured-menu__subtitle">{t('home.featured.subtitle')}</p>
                </div>

                <div className="home-featured-menu__carousel">
                    {!isCompactFeaturedLayout && sortedFeaturedDishes.length > FEATURED_PAGE_SIZE ? (
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
                        ref={featuredGridRef}
                        className={featuredGridClassName}
                        onTouchStart={isCompactFeaturedLayout ? undefined : onTouchStart}
                        onTouchEnd={isCompactFeaturedLayout ? undefined : onTouchEnd}
                        onPointerDown={isCompactFeaturedLayout ? handleFeaturedPointerDown : undefined}
                        onPointerMove={isCompactFeaturedLayout ? handleFeaturedPointerMove : undefined}
                        onPointerUp={isCompactFeaturedLayout ? handleFeaturedPointerUp : undefined}
                        onPointerCancel={isCompactFeaturedLayout ? handleFeaturedPointerUp : undefined}
                        onPointerLeave={isCompactFeaturedLayout ? handleFeaturedPointerUp : undefined}
                    >
                        {featuredMenuContent}
                    </div>

                    {!isCompactFeaturedLayout && sortedFeaturedDishes.length > FEATURED_PAGE_SIZE ? (
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

                {!isCompactFeaturedLayout && sortedFeaturedDishes.length > FEATURED_PAGE_SIZE ? (
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
                    {testimonialItems.map((item, index) => (
                        <article className="testimonial-card" key={item.name}>
                            <div className="testimonial-stars">{'*'.repeat(item.stars)}</div>
                            <p className="testimonial-text">{item.text}</p>
                            <div className="testimonial-author">
                                <strong>{item.name}</strong>
                                <span>{item.role || `${t('home.testimonials.guestRole')} ${index + 1}`}</span>
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
                    {whyUsItems.map((item) => (
                        <div className="why-item" key={item}><FiCheckCircle /> {item}</div>
                    ))}
                </div>
            </section>

            <section className="home-section home-gallery">
                <div className="section-head centered">
                    <p className="section-subtitle">{t('home.gallery.subtitle')}</p>
                </div>
                <div className="gallery-grid">
                    {galleryImages.map((image, index) => (
                        <img key={image} src={image} alt={t(`home.gallery.images.${index}`)} />
                    ))}
                </div>
            </section>

            <section className="home-section home-perks">
                <div className="home-featured-menu__carousel">
                    {!isCompactFeaturedLayout && promotionTotalPages > 1 ? (
                        <button
                            className="home-featured-menu__nav home-featured-menu__nav--prev"
                            type="button"
                            onClick={goPrevPromotionPage}
                            disabled={promotionPageIndex === 0 || promotionsLoading}
                            aria-label={t('home.promotions.prevItems')}
                        >
                            <FiChevronLeft />
                        </button>
                    ) : null}

                    <div className={promotionGridClassName}>
                        {promotionsContent}
                    </div>

                    {!isCompactFeaturedLayout && promotionTotalPages > 1 ? (
                        <button
                            className="home-featured-menu__nav home-featured-menu__nav--next"
                            type="button"
                            onClick={goNextPromotionPage}
                            disabled={promotionPageIndex >= promotionTotalPages - 1 || promotionsLoading}
                            aria-label={t('home.promotions.nextItems')}
                        >
                            <FiChevronRight />
                        </button>
                    ) : null}
                </div>

                {!isCompactFeaturedLayout && promotionTotalPages > 1 ? (
                    <div className="home-featured-menu__status" aria-label={t('home.promotions.pageStatus', { current: promotionPageIndex + 1, total: promotionTotalPages })}>
                        <div className="home-featured-menu__status-bar" aria-hidden="true">
                            <span
                                className="home-featured-menu__status-fill"
                                style={{ width: `${((promotionPageIndex + 1) / promotionTotalPages) * 100}%` }}
                            />
                        </div>
                        <span className="home-featured-menu__status-text">{promotionPageIndex + 1}/{promotionTotalPages}</span>
                    </div>
                ) : null}
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
                        <a href={mapHref} target="_blank" rel="noreferrer">{t('home.contact.getDirections')}</a>
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
