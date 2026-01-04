import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ReservationForm.css';
import { CiCalendar, CiClock2, CiUser, CiCircleCheck } from 'react-icons/ci';
import { IoChevronDownOutline } from 'react-icons/io5'; 
import { useToastContext } from '../../context/ToastContext';

const ReservationForm = () => {
    const toast = useToastContext();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState('');
    
    const [isTimeOpen, setIsTimeOpen] = useState(false);
    const [isGuestOpen, setIsGuestOpen] = useState(false);
    const timeRef = useRef(null);
    const guestRef = useRef(null);

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (timeRef.current && !timeRef.current.contains(e.target)) setIsTimeOpen(false);
            if (guestRef.current && !guestRef.current.contains(e.target)) setIsGuestOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const availableTimeSlots = useMemo(() => {
        if (!date) return [];
        const generate = (sH, sM, eH, eM) => {
            let slots = [];
            let curr = new Date(); curr.setHours(sH, sM, 0, 0);
            let end = new Date(); end.setHours(eH, eM, 0, 0);
            while (curr <= end) {
                slots.push(curr.toTimeString().substring(0, 5));
                curr.setMinutes(curr.getMinutes() + 30);
            }
            return slots;
        };

        if (date === todayStr) {
            let now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            return generate(now.getHours(), now.getMinutes() >= 30 ? 30 : 0, 20, 30);
        }
        return generate(11, 0, 21, 0);
    }, [date, todayStr]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time || !guests) {
            toast.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        toast.success(`Đặt bàn thành công cho ${guests} người vào ${time} ngày ${date}`);
    };

    return (
        <div className="quick-booking-container">
            <div className="booking-header">
                <h3>Đặt bàn nhanh</h3>
                <p>Chọn thời gian và số lượng người</p>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
                {/* Ngày */}
                <div className="form-group">
                    <label><CiCalendar className="form-icon" /> Ngày</label>
                    <input 
                        type="date" 
                        min={todayStr} 
                        value={date} 
                        onChange={(e) => { setDate(e.target.value); setTime(''); }} 
                        className="form-input" 
                    />
                </div>

                {/* Giờ - Custom Dropdown */}
                <div className="form-group" ref={timeRef}>
                    <label><CiClock2 className="form-icon" /> Giờ</label>
                    <div className={`custom-select ${!date ? 'disabled' : ''}`} onClick={() => date && setIsTimeOpen(!isTimeOpen)}>
                        <div className="select-trigger">
                            <span>{time || (date ? "Chọn giờ" : "Chọn ngày trước")}</span>
                            <IoChevronDownOutline className={`arrow ${isTimeOpen ? 'active' : ''}`} />
                        </div>
                        {isTimeOpen && (
                            <ul className="custom-dropdown">
                                {availableTimeSlots.length > 0 ? (
                                    availableTimeSlots.map(t => (
                                        <li key={t} onClick={() => { setTime(t); setIsTimeOpen(false); }}>{t}</li>
                                    ))
                                ) : (
                                    <li className="no-data">Hết giờ đặt hôm nay</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Số người - Custom Dropdown */}
                <div className="form-group" ref={guestRef}>
                    <label><CiUser className="form-icon" /> Số người</label>
                    <div className="custom-select" onClick={() => setIsGuestOpen(!isGuestOpen)}>
                        <div className="select-trigger">
                            <span>{guests ? `${guests} người` : "Chọn số người"}</span>
                            <IoChevronDownOutline className={`arrow ${isGuestOpen ? 'active' : ''}`} />
                        </div>
                        {isGuestOpen && (
                            <ul className="custom-dropdown">
                                {[...Array(10).keys()].map(i => (
                                    <li key={i+1} onClick={() => { setGuests(i+1); setIsGuestOpen(false); }}>{i+1} người</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <button type="submit" className="submit-button">Đặt bàn ngay</button>
            </form>

            <div className="booking-footer">
                <CiCircleCheck className="footer-icon" />
                <span>Đặt bàn nhanh một cách nhanh chóng</span>
            </div>
        </div>
    );
};

export default ReservationForm;