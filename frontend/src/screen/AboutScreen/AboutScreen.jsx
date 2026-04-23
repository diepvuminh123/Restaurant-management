import React from 'react';
import './AboutScreen.css';
import HomeScreenHeader from '../../component/HomeScreenHeader/HomeScreenHeader';
import HomeScreenFooter from '../../component/HomeScreenFooter/HomeScreenFooter';
import FloatingContactButtons from '../../component/FloatingContactButtons/FloatingContactButtons';
import nhahang from '../../picture/nhahang.jpg';

const AboutScreen = ({ user, onLogout }) => {
    return (
        <div className="AboutScreen">
            <HomeScreenHeader user={user} onLogout={onLogout} />
            
            <main className="about-content">
                {/* Hero Section */}
                <section className="about-hero">
                    <div className="hero-content">
                        <h1>Về Chúng Tôi</h1>
                        <p className="hero-subtitle">Khám phá câu chuyện và passion phía sau Nhà hàng</p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="about-section story-section">
                    <div className="container">
                        <div className="section-content">
                            <div className="text-content">
                                <h2>Câu Chuyện Của Chúng Tôi</h2>
                                <p>
                                    Nhà hàng của chúng tôi được thành lập với niềm đam mê mang đến những trải nghiệm ẩm thực tuyệt vời cho khách hàng. 
                                    Từ những ngày đầu tiên, chúng tôi cam kết sử dụng những nguyên liệu tươi mới, chất lượng cao nhất để tạo nên những món ăn ngon miệng.
                                </p>
                                <p>
                                    Với đội ngũ đầu bếp tận tâm và nhân viên phục vụ chuyên nghiệp, chúng tôi luôn nỗ lực để mang lại cho mỗi vị khách những kỉ niệm đáng nhớ 
                                    qua từng bữa ăn.
                                </p>
                            </div>
                            <div className="image-content">
                                <img src={nhahang} alt="Nội thất nhà hàng" className="about-image" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="about-section values-section">
                    <div className="container">
                        <h2>Sứ Mệnh & Tầm Nhìn</h2>
                        <div className="values-grid">
                            <div className="value-card">
                                <div className="value-icon">01</div>
                                <h3>Sứ Mệnh</h3>
                                <p>
                                    Cung cấp các bữa ăn chất lượng cao với dịch vụ xuất sắc, mang lại niềm vui và sự hài lòng cho mỗi khách hàng.
                                </p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">02</div>
                                <h3>Tầm Nhìn</h3>
                                <p>
                                    Trở thành nhà hàng hàng đầu được yêu thích và tin tưởng, nơi mọi người muốn quay lại.
                                </p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">03</div>
                                <h3>Giá Trị Cốt Lõi</h3>
                                <p>
                                    Chất lượng, Tận tâm, Độc lạ, và Bền vững là những giá trị mà chúng tôi luôn theo đuổi.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="about-section why-us-section">
                    <div className="container">
                        <h2>Tại Sao Chọn Chúng Tôi?</h2>
                        <div className="features-grid">
                            <div className="feature-item">
                                <div className="feature-icon">1</div>
                                <h4>Nguyên Liệu Tươi Sạch</h4>
                                <p>Chúng tôi chỉ sử dụng nguyên liệu tươi mới, chất lượng cao từ những nhà cung cấp đáng tin cậy.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">2</div>
                                <h4>Đầu Bếp Tâm Huyết</h4>
                                <p>Đội ngũ đầu bếp giàu kinh nghiệm với đam mê nấu nướng và tạo ra những món ăn độc đáo.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">3</div>
                                <h4>Dịch Vụ Tuyệt Vời</h4>
                                <p>Nhân viên phục vụ chuyên nghiệp, tận tâm và luôn sẵn sàng giúp đỡ bạn.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">4</div>
                                <h4>Giá Cả Hợp Lý</h4>
                                <p>Chúng tôi cung cấp giá trị tốt nhất cho tiền của bạn, không bao giờ hy sinh chất lượng.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">5</div>
                                <h4>Nhiều Giải Thưởng</h4>
                                <p>Được công nhận và đạt nhiều giải thưởng trong các cuộc thi ẩm thực danh giá.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">6</div>
                                <h4>Vị Trí Tiện Lợi</h4>
                                <p>Nằm ở vị trí trung tâm, dễ dàng tiếp cận và có đủ chỗ đậu xe.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="about-section team-section">
                    <div className="container">
                        <h2>Đội Ngũ Của Chúng Tôi</h2>
                        <p className="section-intro">
                            Đội ngũ của chúng tôi bao gồm những chuyên gia tận tâm trong lĩnh vực ẩm thực và dịch vụ khách hàng.
                        </p>
                        <div className="team-grid">
                            <div className="team-member">
                                <div className="member-image">01</div>
                                <h4>Đầu Bếp Trưởng</h4>
                                <p>20+ năm kinh nghiệm nấu ăn, chuyên gia trong các món ăn truyền thống Việt Nam</p>
                            </div>
                            <div className="team-member">
                                <div className="member-image">02</div>
                                <h4>Quản Lý Nhà Hàng</h4>
                                <p>Đảm bảo mọi hoạt động của nhà hàng diễn ra trôi chảy và chuyên nghiệp</p>
                            </div>
                            <div className="team-member">
                                <div className="member-image">03</div>
                                <h4>Chuyên Viên Phục Vụ</h4>
                                <p>Đội ngũ phục vụ tàn tâm, luôn sẵn sàng phục vụ với nụ cười</p>
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
