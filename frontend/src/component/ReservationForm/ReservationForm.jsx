import React, { useState } from 'react';
import './ReservationForm.css';
// Import các icon cần thiết từ react-icons (Giả định bạn đã cài đặt)
import { CiCalendar, CiClock2, CiUser, CiCircleCheck } from 'react-icons/ci';

const ReservationForm = () => {
    // 1. Khởi tạo state cho các trường input
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState('');

    // 2. Xử lý khi người dùng nhấn nút Đặt bàn ngay
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time || !guests) {
            alert("Vui lòng điền đầy đủ thông tin để đặt bàn.");
            return;
        }
        
        // Logic gửi dữ liệu đặt bàn đến server sẽ ở đây
        console.log({ date, time, guests });
        alert(`Đã đặt bàn thành công:\nNgày: ${date}\nGiờ: ${time}\nSố lượng: ${guests}`);
        
        // Reset form
        setDate('');
        setTime('');
        setGuests('');
    };

    return (
        <div className="quick-booking-container">
            <div className="booking-header">
                <h3>Đặt bàn nhanh</h3>
                <p>Chọn thời gian và số lượng người</p>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
                {/* Trường Ngày */}
                <div className="form-group">
                    <label htmlFor="date-input">
                        <CiCalendar className="form-icon" /> Ngày
                    </label>
                    <input
                        id="date-input"
                        type="date" // Sử dụng type="date" để hiển thị DatePicker
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="form-input"
                        placeholder="Chọn ngày"
                    />
                </div>

                {/* Trường Giờ */}
                <div className="form-group">
                    <label htmlFor="time-input">
                        <CiClock2 className="form-icon" /> Giờ
                    </label>
                    <select
                        id="time-input"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="form-input select-arrow"
                    >
                        <option value="" disabled>Chọn giờ</option>
                        {/* Ví dụ các tùy chọn giờ */}
                        <option value="18:00">18:00</option>
                        <option value="19:00">19:00</option>
                        <option value="20:00">20:00</option>
                    </select>
                </div>

                {/* Trường Số người */}
                <div className="form-group">
                    <label htmlFor="guests-input">
                        <CiUser className="form-icon" /> Số người
                    </label>
                    <select
                        id="guests-input"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        required
                        className="form-input select-arrow"
                    >
                        <option value="" disabled>Chọn số người</option>
                        {/* Ví dụ các tùy chọn số lượng */}
                        {[...Array(10).keys()].map(i => (
                            <option key={i + 1} value={i + 1}>{i + 1} người</option>
                        ))}
                    </select>
                </div>

                {/* Nút Đặt bàn ngay */}
                <button type="submit" className="submit-button">
                    Đặt bàn ngay
                </button>
            </form>

            {/* Chú thích Đặt bàn nhanh một cách nhanh chóng */}
            <div className="booking-footer">
                <CiCircleCheck className="footer-icon" />
                <span>Đặt bàn nhanh một cách nhanh chóng</span>
            </div>
        </div>
    );
};

export default ReservationForm;