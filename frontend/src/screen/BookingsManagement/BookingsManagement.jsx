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
import ReservationDetailModal from '../../component/ReservationDetailModal/ReservationDetailModal';
import { useToastContext } from '../../context/ToastContext';
import { useRestaurantInfoContext } from '../../context/RestaurantInfoContext';
import { generateTimeSlots, getLocalMinutes, isSameLocalDate } from '../../utils/timeSlots';
import './BookingsManagement.css';

const GRID_ROWS = 8;
const SLOTS_PER_VIEW = 7;

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const getSlotIndexByMinutes = (minutes, timeSlots) => {
  if (!timeSlots.length) return 0;
  const idx = timeSlots.findIndex((slot) => minutes >= slot.startMinutes && minutes < slot.endMinutes);
  if (idx !== -1) return idx;

  if (minutes < timeSlots[0].startMinutes) return 0;
  return timeSlots.length - 1;
};

const getOffsetForSlotIndex = (slotIndex, timeSlots) => {
  const maxOffset = Math.max(0, timeSlots.length - SLOTS_PER_VIEW);
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
  if (status === 'ON_SERVING') return 'booking-item booking-item--on-serving';
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
  const { openingTime, closingTime, restaurantName } = useRestaurantInfoContext();
  const toast = useToastContext();
  const timeSlots = useMemo(
    () => generateTimeSlots({ startTime: openingTime, endTime: closingTime, intervalMinutes: 30 }),
    [openingTime, closingTime]
  );

  const [selectedDate, setSelectedDate] = useState(() => formatInputDate(new Date()));
  const [activeSlotId, setActiveSlotId] = useState(() => {
    const nowIndex = getSlotIndexByMinutes(getLocalMinutes(), timeSlots);
    return timeSlots[nowIndex]?.id || timeSlots[0]?.id || openingTime;
  });
  const [slotOffset, setSlotOffset] = useState(() => {
    const nowIndex = getSlotIndexByMinutes(getLocalMinutes(), timeSlots);
    return getOffsetForSlotIndex(nowIndex, timeSlots);
  });

	const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [reservationDetail, setReservationDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

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

  const loadAvailability = async (date, slotId, { signal } = {}) => {
    if (!slotId) {
      setAvailableTables(null);
      return;
    }

    const response = await ApiService.getTablesAvailability({
      date,
      time: slotId,
      guests: 1,
      ignoreCapacity: true,
    });

    if (signal?.aborted) return;
    const tables = Array.isArray(response?.data?.tables) ? response.data.tables : [];
    const available = tables.filter((table) => table?.selectable).length;
    setAvailableTables(available);
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
    if (!timeSlots.length) {
      setActiveSlotId('');
      setSlotOffset(0);
      return;
    }

    setActiveSlotId((prev) => {
      if (timeSlots.some((slot) => slot.id === prev)) return prev;
      const nowIndex = getSlotIndexByMinutes(getLocalMinutes(), timeSlots);
      return timeSlots[nowIndex]?.id || timeSlots[0].id;
    });
  }, [timeSlots]);

  useEffect(() => {
    // Today: auto-focus the current time range.
    // Other days: reset to the first configured opening slot.
    if (!timeSlots.length) return;

    if (isSameLocalDate(selectedDate)) {
      const nowIndex = getSlotIndexByMinutes(getLocalMinutes(), timeSlots);
      const nextActive = timeSlots[nowIndex]?.id;
      if (nextActive) setActiveSlotId((prev) => (prev === nextActive ? prev : nextActive));

      const nextOffset = getOffsetForSlotIndex(nowIndex, timeSlots);
      setSlotOffset((prev) => (prev === nextOffset ? prev : nextOffset));
      return;
    }

    const firstSlotId = timeSlots[0]?.id || openingTime;
    setActiveSlotId((prev) => (prev === firstSlotId ? prev : firstSlotId));
    setSlotOffset((prev) => (prev === 0 ? prev : 0));
  }, [selectedDate, openingTime, timeSlots]);

  useEffect(() => {
    let cancelled = false;

    if (!activeSlotId) {
      setAvailableTables(null);
      return () => {
        cancelled = true;
      };
    }

    const fetchActiveAvailability = async () => {
      try {
        await loadAvailability(selectedDate, activeSlotId, {
          signal: { aborted: cancelled },
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Fetch tables availability error:', error);
        setAvailableTables(null);
      }
    };

    fetchActiveAvailability();
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
      if (!timeSlots.some((s) => s.id === slotId)) return;

      const current = rowCounterBySlot.get(slotId) || 0;
      if (current >= GRID_ROWS) return;

      rowCounterBySlot.set(slotId, current + 1);

      const state = reservation?.reservation_state;
      let status = 'PENDING';
      if (state === 'COMPLETED') status = 'COMPLETED';
      if (state === 'CANCELED') status = 'CANCELED';
      if (state === 'ON_SERVING') status = 'ON_SERVING';

      const tableText = reservation?.table_id ? `Bàn ${reservation.table_id}` : `#${reservation?.reservation_id ?? '--'}`;
      const name = (reservation?.customer_name && String(reservation.customer_name).trim())
        || (reservation?.note && String(reservation.note).trim())
        || tableText;
      const people = Number(reservation?.number_of_guests) || 0;

      items.push({
        id: String(reservation?.reservation_id ?? `${slotId}:${current}`),
        reservationId: reservation?.reservation_id ?? null,
        slotId,
        row: current,
        name,
        people,
        status,
      });
    });

    return items;
  }, [reservations, timeSlots]);

  useEffect(() => {
    if (!isDetailOpen) return;
    if (!selectedReservationId) return;

    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError('');
    setReservationDetail(null);

    ApiService.getReservationDetailForStaff(selectedReservationId, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        setReservationDetail(response?.data || null);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Fetch reservation detail for staff error:', error);
        setDetailError(error?.message || 'Không thể tải chi tiết đặt bàn');
        setReservationDetail(null);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setDetailLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [isDetailOpen, selectedReservationId]);

  const bookingMap = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      map.set(`${booking.row}:${booking.slotId}`, booking);
    });
    return map;
  }, [bookings]);

  const visibleSlots = useMemo(() => {
    const end = slotOffset + SLOTS_PER_VIEW;
    return timeSlots.slice(slotOffset, end);
  }, [slotOffset, timeSlots]);

  const canGoPrev = slotOffset > 0;
  const canGoNext = slotOffset + SLOTS_PER_VIEW < timeSlots.length;

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
    await loadAvailability(date, timeSlotId);
    toast.success('Tạo đặt bàn thành công');
  };

  const openDetail = (reservationId) => {
    if (reservationId === null || reservationId === undefined) return;
    const id = Number(reservationId);
    if (!Number.isFinite(id) || id <= 0) return;
    setSelectedReservationId(id);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedReservationId(null);
    setReservationDetail(null);
    setDetailLoading(false);
    setDetailError('');
    setIsStatusUpdating(false);
  };

  const handleUpdateReservationStatus = async (reservationId, reservationState) => {
    if (!reservationId || !reservationState || isStatusUpdating) return;

    try {
      setIsStatusUpdating(true);
      const response = await ApiService.updateReservationStatusForStaff(reservationId, reservationState);
      const updatedDetail = response?.data || null;

      setReservationDetail(updatedDetail);
      await Promise.all([
        fetchReservations(selectedDate),
        loadAvailability(selectedDate, activeSlotId),
      ]);

      toast.success('Cập nhật trạng thái đặt bàn thành công');
    } catch (error) {
      console.error('Update reservation status error:', error);
      toast.error(error?.message || 'Không thể cập nhật trạng thái đặt bàn');
    } finally {
      setIsStatusUpdating(false);
    }
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
        branchName={restaurantName}
        defaultDate={selectedDate}
        defaultTimeSlotId={activeSlotId}
        timeSlots={timeSlots}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateReservation}
      />

      <ReservationDetailModal
        isOpen={isDetailOpen}
        reservationId={selectedReservationId}
        detail={reservationDetail}
        loading={detailLoading}
        error={detailError}
        timeSlots={timeSlots}
        onClose={closeDetail}
        onUpdateStatus={handleUpdateReservationStatus}
        updatingStatus={isStatusUpdating}
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
          className="bookings-timeline__nav bookings-timeline__nav--prev"
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
          className="bookings-timeline__nav bookings-timeline__nav--next"
          onClick={() => setSlotOffset((prev) => Math.min(Math.max(0, timeSlots.length - SLOTS_PER_VIEW), prev + 1))}
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
                    <button
                      type="button"
                      className={getBookingClassName(booking.status)}
                      onClick={() => openDetail(booking.reservationId)}
                      aria-label={`Xem chi tiết đặt bàn ${booking.name}`}
                    >
                      <div className="booking-item__name" title={booking.name}>
                        {booking.name}
                      </div>
                      <div className="booking-item__meta">People: {booking.people}</div>
                    </button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bookings-legend" aria-label="Chú thích trạng thái">
        <div className="bookings-legend__item">
          <span className="bookings-legend__dot bookings-legend__dot--on-serving" aria-hidden="true" />
          <span>Đang phục vụ</span>
        </div>
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
