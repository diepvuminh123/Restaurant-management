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
import {
    normalizeReservationName,
    normalizeReservationPhone,
    validateReservationName,
    validateReservationPhone,
} from '../../utils/reservationValidation';

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
    const [guestErrors, setGuestErrors] = useState({});
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
            setGuestErrors({});
            setShowCustomerForm(true);
        }
    };

    const setGuestField = (field, value) => {
        if (field === 'customerName') {
            setCustomerName(value);
        }

        if (field === 'customerPhone') {
            setCustomerPhone(value);
        }

        setGuestErrors((prev) => {
            if (!prev[field]) return prev;

            const next = { ...prev };
            const validator = field === 'customerName' ? validateReservationName : validateReservationPhone;
            const error = validator(value);

            if (error) next[field] = error;
            else delete next[field];

            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time || !guests) {
            toast.warning(t('reservationQuick.fillAllFields'));
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
        const nameError = validateReservationName(customerName);
        const phoneError = validateReservationPhone(customerPhone);
        const nextGuestErrors = {};

        if (nameError) nextGuestErrors.customerName = nameError;
        if (phoneError) nextGuestErrors.customerPhone = phoneError;

        setGuestErrors(nextGuestErrors);

        if (Object.keys(nextGuestErrors).length) {
            return;
        }

        const normalizedCustomerName = normalizeReservationName(customerName);
        const normalizedCustomerPhone = normalizeReservationPhone(customerPhone);

        // Navigate tới table-map với state
        if (onContinue) {
            onContinue({
                date,
                time,
                guests,
                customerName: normalizedCustomerName,
                customerPhone: normalizedCustomerPhone,
            });
        } else {
            navigate('/table-map', { 
                state: { 
                    dayReservation: date, 
                    timeReservation: time, 
                    numOfGuess: guests,
                    customerName: normalizedCustomerName,
                    customerPhone: normalizedCustomerPhone,
                } 
            });
        }
    };

    // Nếu guest chưa nhập thông tin, show form
    if (showCustomerForm) {
        return (
            <div className="quick-booking-container">
                <div className="booking-header">
                    <h3>{t('reservationQuick.guestInfoTitle')}</h3>
                    <p>{t('reservationQuick.guestInfoSubtitle')}</p>
                </div>

                <form className="booking-form" onSubmit={handleCustomerFormSubmit}>
                    <div className="form-group">
                        <label>{t('reservationQuick.fullName')} <span className="required">*</span></label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setGuestField('customerName', e.target.value)}
                            placeholder={t('reservationQuick.fullNamePlaceholder')}
                            className={`form-input ${guestErrors.customerName ? 'form-input--error' : ''}`}
                        />
                        {guestErrors.customerName ? <div className="form-error">{guestErrors.customerName}</div> : null}
                    </div>

                    <div className="form-group">
                        <label>{t('reservationQuick.phone')} <span className="required">*</span></label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setGuestField('customerPhone', e.target.value)}
                            placeholder={t('reservationQuick.phonePlaceholder')}
                            className={`form-input ${guestErrors.customerPhone ? 'form-input--error' : ''}`}
                            inputMode="numeric"
                        />
                        {guestErrors.customerPhone ? <div className="form-error">{guestErrors.customerPhone}</div> : null}
                    </div>

                    <button
                        type="submit"
                        className={`submit-button ${isGuestFormReady ? 'submit-button--ready' : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? t('reservationQuick.processing') : t('reservationQuick.continue')}
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
                    <label><CiCalendar className="form-icon" /> {t('reservationQuick.date')}</label>
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
                    <label><CiClock2 className="form-icon" /> {t('reservationQuick.time')}</label>
                    <div className={`custom-select ${!date ? 'disabled' : ''}`} onClick={() => date && setIsTimeOpen(!isTimeOpen)}>
                        <div className="select-trigger">
                            <span>{time || (date ? t('reservationQuick.selectTime') : t('reservationQuick.timePlaceholder'))}</span>
                            <IoChevronDownOutline className={`arrow ${isTimeOpen ? 'active' : ''}`} />
                        </div>
                        {isTimeOpen && (
                            <ul className="custom-dropdown">
                                {availableTimeSlots.length > 0 ? (
                                    availableTimeSlots.map(t => (
                                        <li key={t} onClick={() => { setTime(t); setIsTimeOpen(false); }}>{t}</li>
                                    ))
                                ) : (
                                    <li className="no-data">{t('reservationQuick.noSlots')}</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Số người - Custom Dropdown */}
                <div className="form-group" ref={guestRef}>
                    <label><CiUser className="form-icon" /> {t('reservationQuick.people')}</label>
                    <div className="custom-select" onClick={() => setIsGuestOpen(!isGuestOpen)}>
                        <div className="select-trigger">
                            <span>{guests ? t('reservationQuick.peopleCount', { count: guests }) : t('reservationQuick.peoplePlaceholder')}</span>
                            <IoChevronDownOutline className={`arrow ${isGuestOpen ? 'active' : ''}`} />
                        </div>
                        {isGuestOpen && (
                            <ul className="custom-dropdown">
                                {[...Array(10).keys()].map(i => (
                                    <li key={i+1} onClick={() => { setGuests(i+1); setIsGuestOpen(false); }}>{t('reservationQuick.peopleCount', { count: i + 1 })}</li>
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
                    {submitting ? t('reservationQuick.submitting') : t('reservationQuick.submit')}
                </button>
            </form>

            <div className="booking-footer">
                <CiCircleCheck className="footer-icon" />
                <span>{t('reservationQuick.note')}</span>
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