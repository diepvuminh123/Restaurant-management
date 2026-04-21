import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import './ReservationForm.css';
import { CiCalendar, CiClock2, CiUser, CiCircleCheck } from 'react-icons/ci';
import { IoChevronDownOutline } from 'react-icons/io5'; 
import { useToastContext } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import RoleSelectionModal from '../RoleSelectionModal/RoleSelectionModal';
import { useTranslation } from 'react-i18next'; 
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import {
    generateTimeSlots,
    getLocalMinutes,
    isSameLocalDate,
    roundUpMinutesToInterval,
} from '../../utils/timeSlots';

const ReservationForm = ({ user, onParamsChange, onContinue, submitting = false }) => {
    const navigate = useNavigate();
    const toast = useToastContext();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState('');
    
    const [isTimeOpen, setIsTimeOpen] = useState(false);
    const [isGuestOpen, setIsGuestOpen] = useState(false);
    const timeRef = useRef(null);
    const guestRef = useRef(null);
    const {t} = useTranslation();
    const { openingTime, closingTime } = useRestaurantInfoContext();

    // Auth states
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showCustomerForm, setShowCustomerForm] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];
    const isReservationReady = Boolean(date && time && guests);
    const isGuestFormReady = Boolean(customerName.trim() && customerPhone.trim());

    // Notify parent whenever form params change (for live table-map preview)
    useEffect(() => {
        onParamsChange?.({ date, time, guests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, time, guests]);

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

        // Keep a single source of truth for time slots across the app.
        const slots = generateTimeSlots({
            startTime: openingTime,
            endTime: closingTime,
            intervalMinutes: 30,
        });

        // For today, hide slots in the past (round up to next interval).
        if (isSameLocalDate(date)) {
            const nowMinutes = getLocalMinutes(new Date());
            const minStart = roundUpMinutesToInterval(nowMinutes + 1, 30);
            return slots.filter((s) => s.startMinutes >= minStart).map((s) => s.id);
        }

        return slots.map((s) => s.id);
    }, [date, openingTime, closingTime]);

    const handleRoleSelect = (role) => {
        setShowRoleModal(false);
        if (role === 'user') {
            // Lưu info đặt bàn vào sessionStorage trước khi login
            sessionStorage.setItem(
                STORAGE_KEYS.RESERVATION_INFO,
                JSON.stringify({
                    dayReservation: date,
                    timeReservation: time,
                    numOfGuess: guests,
                })
            );
            navigate('/login', { replace: true });
        } else if (role === 'guest') {
            setShowCustomerForm(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time || !guests) {
            toast.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Kiểm tra auth
        if (!user) {
            setShowRoleModal(true);
            return;
        }

        if (onContinue) {
            onContinue({ date, time, guests });
        } else {
            navigate('/table-map', { 
                state: { 
                    dayReservation: date, 
                    timeReservation: time, 
                    numOfGuess: guests 
                } 
            });
        }
    };

    const handleCustomerFormSubmit = (e) => {
        e.preventDefault();
        if (!customerName || !customerPhone) {
            toast.warning('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Navigate tới table-map với state
        if (onContinue) {
            onContinue({ date, time, guests, customerName, customerPhone });
        } else {
            navigate('/table-map', { 
                state: { 
                    dayReservation: date, 
                    timeReservation: time, 
                    numOfGuess: guests,
                    customerName,
                    customerPhone,
                } 
            });
        }
    };

    // Nếu guest chưa nhập thông tin, show form
    if (showCustomerForm) {
        return (
            <div className="quick-booking-container">
                <div className="booking-header">
                    <h3>Thông tin khách hàng</h3>
                    <p>Vui lòng nhập thông tin để tiếp tục đặt bàn</p>
                </div>

                <form className="booking-form" onSubmit={handleCustomerFormSubmit}>
                    <div className="form-group">
                        <label>Họ và tên <span className="required">*</span></label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nhập họ và tên"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại <span className="required">*</span></label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`submit-button ${isGuestFormReady ? 'submit-button--ready' : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang xử lý...' : 'Tiếp tục'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="quick-booking-container">
            <div className="booking-header">
                <h3>{t('reservationQuick.quickReservation')}</h3>
                <p>{t('reservationQuick.subtitle')}</p>
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

                <button
                    type="submit"
                    className={`submit-button ${isReservationReady ? 'submit-button--ready' : ''}`}
                    disabled={submitting}
                >
                    {submitting ? 'Đang đặt bàn...' : 'Đặt bàn ngay'}
                </button>
            </form>

            <div className="booking-footer">
                <CiCircleCheck className="footer-icon" />
                <span>Đặt bàn nhanh một cách nhanh chóng</span>
            </div>

            {/* Role Selection Modal */}
            {showRoleModal && (
                <RoleSelectionModal 
                    onSelectRole={handleRoleSelect}
                    onClose={() => setShowRoleModal(false)}
                />
            )}
        </div>
    );
};

export default ReservationForm;

ReservationForm.propTypes = {
    user: PropTypes.object,
    onParamsChange: PropTypes.func,
    onContinue: PropTypes.func,
    submitting: PropTypes.bool,
};