import React, { useEffect, useMemo, useState } from 'react';
import {
  IoAdd,
  IoCalendarClearOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPeopleOutline,
} from 'react-icons/io5';
import ApiService from '../../services/apiService';
import ReservationCreateModal from '../../component/ReservationCreateModal/ReservationCreateModal';
import { generateTimeSlots, getLocalMinutes, isSameLocalDate } from '../../utils/timeSlots';
import './BookingsManagement.css';

const TIME_SLOTS = generateTimeSlots({ startTime: '09:00', endTime: '22:00', intervalMinutes: 30 });

const GRID_ROWS = 8;
const SLOTS_PER_VIEW = 7;

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const getSlotIndexByMinutes = (minutes) => {
  if (!TIME_SLOTS.length) return 0;
  const idx = TIME_SLOTS.findIndex((slot) => minutes >= slot.startMinutes && minutes < slot.endMinutes);
  if (idx !== -1) return idx;

  if (minutes < TIME_SLOTS[0].startMinutes) return 0;
  return TIME_SLOTS.length - 1;
};

const getOffsetForSlotIndex = (slotIndex) => {
  const maxOffset = Math.max(0, TIME_SLOTS.length - SLOTS_PER_VIEW);
  const centered = slotIndex - Math.floor(SLOTS_PER_VIEW / 2);
  return clampNumber(centered, 0, maxOffset);
};

const formatInputDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (input) => {
  if (!input) return '--';
  const date = new Date(`${input}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('vi-VN');
};

const getBookingClassName = (status) => {
  if (status === 'COMPLETED') return 'booking-item booking-item--completed';
  if (status === 'CANCELED') return 'booking-item booking-item--canceled';
  return 'booking-item booking-item--pending';
};

const normalizeSlotId = (isoDateTime) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return null;
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = date.getMinutes() < 30 ? '00' : '30';
  return `${hour}:${minute}`;
};

const buildVNDayRange = (yyyyMmDd) => {
  // Keep explicit +07:00 offset so filtering matches local VN day.
  const from = `${yyyyMmDd}T00:00:00.000+07:00`;
  const to = `${yyyyMmDd}T23:59:59.999+07:00`;
  return { from, to };
};

const BookingsManagement = () => {
  const [selectedDate, setSelectedDate] = useState(() => formatInputDate(new Date()));
  const [activeSlotId, setActiveSlotId] = useState(() => {
    const nowIndex = getSlotIndexByMinutes(getLocalMinutes());
    return TIME_SLOTS[nowIndex]?.id || TIME_SLOTS[0]?.id || '09:00';
  });
  const [slotOffset, setSlotOffset] = useState(() => {
    const nowIndex = getSlotIndexByMinutes(getLocalMinutes());
    return getOffsetForSlotIndex(nowIndex);
  });

	const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [availableTables, setAvailableTables] = useState(null);

  const fetchReservations = async (yyyyMmDd, { signal } = {}) => {
    const { from, to } = buildVNDayRange(yyyyMmDd);
    const response = await ApiService.getReservationsForStaff({
      limit: 200,
      offset: 0,
      from,
      to,
    });

    if (signal?.aborted) return;
    setReservations(Array.isArray(response?.data) ? response.data : []);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchReservations(selectedDate, { signal: controller.signal }).catch((error) => {
      if (controller.signal.aborted) return;
      console.error('Fetch reservations for staff error:', error);
      setReservations([]);
    });

    return () => {
      controller.abort();
    };
  }, [selectedDate]);

  useEffect(() => {
    // Today: auto-focus the current time range.
    // Other days: reset to the start of the day (09:00) so the grid doesn't stay at "now".
    if (isSameLocalDate(selectedDate)) {
      const nowIndex = getSlotIndexByMinutes(getLocalMinutes());
      const nextActive = TIME_SLOTS[nowIndex]?.id;
      if (nextActive) setActiveSlotId((prev) => (prev === nextActive ? prev : nextActive));

      const nextOffset = getOffsetForSlotIndex(nowIndex);
      setSlotOffset((prev) => (prev === nextOffset ? prev : nextOffset));
      return;
    }

    const firstSlotId = TIME_SLOTS[0]?.id || '09:00';
    setActiveSlotId((prev) => (prev === firstSlotId ? prev : firstSlotId));
    setSlotOffset((prev) => (prev === 0 ? prev : 0));
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    const fetchAvailability = async () => {
      try {
        const response = await ApiService.getTablesAvailability({
          date: selectedDate,
          time: activeSlotId,
          guests: 1,
        });

        if (cancelled) return;
        const tables = Array.isArray(response?.data?.tables) ? response.data.tables : [];
        const available = tables.filter((table) => table?.selectable).length;
        setAvailableTables(available);
      } catch (error) {
        if (cancelled) return;
        console.error('Fetch tables availability error:', error);
        setAvailableTables(null);
      }
    };

    fetchAvailability();
    return () => {
      cancelled = true;
    };
  }, [activeSlotId, selectedDate]);

  const bookings = useMemo(() => {
    // Convert API data to grid items.
    // Each time-slot can stack up to GRID_ROWS items.
    const items = [];
    const rowCounterBySlot = new Map();

    (reservations || []).forEach((reservation) => {
      const slotId = normalizeSlotId(reservation?.reservation_time);
      if (!slotId) return;
      if (!TIME_SLOTS.some((s) => s.id === slotId)) return;

      const current = rowCounterBySlot.get(slotId) || 0;
      if (current >= GRID_ROWS) return;

      rowCounterBySlot.set(slotId, current + 1);

      const state = reservation?.reservation_state;
      let status = 'PENDING';
      if (state === 'COMPLETED') status = 'COMPLETED';
      if (state === 'CANCELED') status = 'CANCELED';

      const tableText = reservation?.table_id ? `Bàn ${reservation.table_id}` : `#${reservation?.reservation_id ?? '--'}`;
      const name = (reservation?.note && String(reservation.note).trim()) || tableText;
      const people = Number(reservation?.number_of_guests) || 0;

      items.push({
        id: String(reservation?.reservation_id ?? `${slotId}:${current}`),
        slotId,
        row: current,
        name,
        people,
        status,
      });
    });

    return items;
  }, [reservations]);

  const bookingMap = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      map.set(`${booking.row}:${booking.slotId}`, booking);
    });
    return map;
  }, [bookings]);

  const visibleSlots = useMemo(() => {
    const end = slotOffset + SLOTS_PER_VIEW;
    return TIME_SLOTS.slice(slotOffset, end);
  }, [slotOffset]);

  const canGoPrev = slotOffset > 0;
  const canGoNext = slotOffset + SLOTS_PER_VIEW < TIME_SLOTS.length;

  const handleCreateReservation = async ({ customer_name, customer_phone, email, date, timeSlotId, table_id, people, note }) => {
    const reservation_time = `${date}T${timeSlotId}:00.000+07:00`;
    const restaurant_note_parts = [];
    if (email) restaurant_note_parts.push(`Email: ${email}`);
    if (note) restaurant_note_parts.push(`Ghi chú: ${note}`);

    await ApiService.createReservationForStaff({
      customer_name,
      customer_phone,
      table_id: Number(table_id),
      reservation_time,
      number_of_guests: people,
      // Bookings grid currently renders reservation.note as title.
      note: customer_name,
      restaurant_note: restaurant_note_parts.join(' | ') || null,
    });

    await fetchReservations(date);
  };

  return (
    <div className="bookings-page">
      <div className="bookings-page__header">
        <div className="bookings-page__title">
          <h1>Đặt bàn</h1>
          <p>Khách đặt bàn trước</p>
        </div>

        <button type="button" className="bookings-page__create" onClick={() => setIsCreateOpen(true)}>
          <IoAdd className="bookings-page__createIcon" />
          <span>Tạo bàn</span>
        </button>
      </div>

      <ReservationCreateModal
        isOpen={isCreateOpen}
        branchName="Nhà Hàng Huân Minh Quanh"
        defaultDate={selectedDate}
        defaultTimeSlotId={activeSlotId}
        timeSlots={TIME_SLOTS}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateReservation}
      />

      <div className="bookings-page__top">
        <section className="bookings-card bookings-card--date">
          <div className="bookings-card__label">Chọn ngày</div>
          <div className="bookings-card__row">
            <div className="bookings-card__icon" aria-hidden="true">
              <IoCalendarClearOutline />
            </div>
            <div className="bookings-card__date">
              <div className="bookings-card__dateLabel">Ngày</div>
              <div className="bookings-card__dateValue">{formatDisplayDate(selectedDate)}</div>
            </div>

            <input
              className="bookings-card__dateInput"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Chọn ngày"
            />

            <button type="button" className="bookings-card__filterBtn">
              Lọc
            </button>
          </div>
        </section>

        <section className="bookings-card bookings-card--seats" aria-label="Số bàn còn trống">
          <div className="bookings-card__seatsNumber">{availableTables ?? 0}</div>
          <div className="bookings-card__seatsFooter">
            <span>Available tables</span>
            <IoPeopleOutline aria-hidden="true" />
          </div>
        </section>
      </div>

      <div className="bookings-timeline" aria-label="Chọn khung giờ">
        <button
          type="button"
          className="bookings-timeline__nav"
          onClick={() => setSlotOffset((prev) => Math.max(0, prev - 1))}
          disabled={!canGoPrev}
          aria-label="Khung giờ trước"
        >
          <IoChevronBackOutline />
        </button>

        <div
          className="bookings-timeline__slots"
          style={{
            '--cols': visibleSlots.length,
          }}
        >
          {visibleSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={
                slot.id === activeSlotId
                  ? 'bookings-timeline__slot bookings-timeline__slot--active'
                  : 'bookings-timeline__slot'
              }
              onPointerDown={() => setActiveSlotId(slot.id)}
              onMouseDown={() => setActiveSlotId(slot.id)}
              onTouchStart={() => setActiveSlotId(slot.id)}
              onClick={() => setActiveSlotId(slot.id)}
            >
              {slot.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="bookings-timeline__nav"
          onClick={() => setSlotOffset((prev) => Math.min(TIME_SLOTS.length - SLOTS_PER_VIEW, prev + 1))}
          disabled={!canGoNext}
          aria-label="Khung giờ tiếp theo"
        >
          <IoChevronForwardOutline />
        </button>
      </div>

      <div className="bookings-grid" aria-label="Lịch đặt bàn">
        <div
          className="bookings-grid__inner"
          style={{
            '--cols': visibleSlots.length,
            '--rows': GRID_ROWS,
          }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, rowIndex) =>
            visibleSlots.map((slot) => {
              const booking = bookingMap.get(`${rowIndex}:${slot.id}`);
              return (
                <div key={`${rowIndex}:${slot.id}`} className="bookings-grid__cell">
                  {booking ? (
                    <div className={getBookingClassName(booking.status)}>
                      <div className="booking-item__name" title={booking.name}>
                        {booking.name}
                      </div>
                      <div className="booking-item__meta">People: {booking.people}</div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bookings-legend" aria-label="Chú thích trạng thái">
        <div className="bookings-legend__item">
          <span className="bookings-legend__dot bookings-legend__dot--completed" aria-hidden="true" />
          <span>Hoàn tất</span>
        </div>
        <div className="bookings-legend__item">
          <span className="bookings-legend__dot bookings-legend__dot--canceled" aria-hidden="true" />
          <span>Đã hủy</span>
        </div>
      </div>
    </div>
  );
};

export default BookingsManagement;
