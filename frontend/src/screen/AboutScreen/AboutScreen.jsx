import React from 'react';
import './AboutScreen.css';
import HomeScreenHeader from '../../component/HomeScreenHeader/HomeScreenHeader';
import HomeScreenFooter from '../../component/HomeScreenFooter/HomeScreenFooter';
import FloatingContactButtons from '../../component/FloatingContactButtons/FloatingContactButtons';
import nhahang from '../../picture/nhahang.jpg';
import { useTranslation } from 'react-i18next';

const AboutScreen = ({ user, onLogout }) => {
    const { t } = useTranslation();
    return (
        <div className="AboutScreen">
            <HomeScreenHeader user={user} onLogout={onLogout} />
            
            <main className="about-content">
                {/* Hero Section */}
                <section className="about-hero">
                    <div className="hero-content">
                        <h1>{t('about.hero.title')}</h1>
                        <p className="hero-subtitle">{t('about.hero.subtitle')}</p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="about-section story-section">
                    <div className="container">
                        <div className="section-content">
                            <div className="text-content">
                                <h2>{t('about.story.title')}</h2>
                                <p>{t('about.story.paragraph1')}</p>
                                <p>{t('about.story.paragraph2')}</p>
                            </div>
                            <div className="image-content">
                                <img src={nhahang} alt={t('about.story.imageAlt')} className="about-image" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="about-section values-section">
                    <div className="container">
                        <h2>{t('about.values.title')}</h2>
                        <div className="values-grid">
                            <div className="value-card">
                                <div className="value-icon">01</div>
                                <h3>{t('about.values.items.0.title')}</h3>
                                <p>{t('about.values.items.0.text')}</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">02</div>
                                <h3>{t('about.values.items.1.title')}</h3>
                                <p>{t('about.values.items.1.text')}</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">03</div>
                                <h3>{t('about.values.items.2.title')}</h3>
                                <p>{t('about.values.items.2.text')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="about-section why-us-section">
                    <div className="container">
                        <h2>{t('about.whyUs.title')}</h2>
                        <div className="features-grid">
                            <div className="feature-item">
                                <div className="feature-icon">1</div>
                                <h4>{t('about.whyUs.items.0.title')}</h4>
                                <p>{t('about.whyUs.items.0.text')}</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">2</div>
                                <h4>{t('about.whyUs.items.1.title')}</h4>
                                <p>{t('about.whyUs.items.1.text')}</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">3</div>
                                <h4>{t('about.whyUs.items.2.title')}</h4>
                                <p>{t('about.whyUs.items.2.text')}</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">4</div>
                                <h4>{t('about.whyUs.items.3.title')}</h4>
                                <p>{t('about.whyUs.items.3.text')}</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">5</div>
                                <h4>{t('about.whyUs.items.4.title')}</h4>
                                <p>{t('about.whyUs.items.4.text')}</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">6</div>
                                <h4>{t('about.whyUs.items.5.title')}</h4>
                                <p>{t('about.whyUs.items.5.text')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="about-section team-section">
                    <div className="container">
                        <h2>{t('about.team.title')}</h2>
                        <p className="section-intro">
                            {t('about.team.intro')}
                        </p>
                        <div className="team-grid">
                            <div className="team-member">
                                <div className="member-image">01</div>
                                <h4>{t('about.team.members.0.title')}</h4>
                                <p>{t('about.team.members.0.text')}</p>
                            </div>
                            <div className="team-member">
                                <div className="member-image">02</div>
                                <h4>{t('about.team.members.1.title')}</h4>
                                <p>{t('about.team.members.1.text')}</p>
                            </div>
                            <div className="team-member">
                                <div className="member-image">03</div>
                                <h4>{t('about.team.members.2.title')}</h4>
                                <p>{t('about.team.members.2.text')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <HomeScreenFooter />
            <FloatingContactButtons />
        </div>
    );
};

export default AboutScreen;
