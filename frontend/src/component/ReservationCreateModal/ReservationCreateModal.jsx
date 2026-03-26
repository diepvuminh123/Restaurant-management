import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { IoCalendarClearOutline, IoCloseOutline } from 'react-icons/io5';
import ApiService from '../../services/apiService';
import { getLocalMinutes, isSameLocalDate, parseTimeToMinutes, roundUpMinutesToInterval } from '../../utils/timeSlots';
import './ReservationCreateModal.css';

const formatDisplayDate = (input) => {
  if (!input) return '--';
  const date = new Date(`${input}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('vi-VN');
};

const pad2 = (value) => String(value).padStart(2, '0');

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const parseISODate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getTablesFromAvailabilityResponse = (response) =>
  Array.isArray(response?.data?.tables) ? response.data.tables : [];

const getSelectableTables = (tables) => (tables || []).filter((t) => Boolean(t?.selectable));

const pickTableId = (currentTableId, selectableTables) => {
  const current = String(currentTableId || '').trim();
  if (current) {
    for (const table of selectableTables) {
      if (String(table?.table_id) === current) return current;
    }
  }

  if (!selectableTables.length) return '';
  return String(selectableTables[0].table_id);
};

const useTablesAvailability = ({
  isOpen,
  date,
  time,
  guests,
  selectedTableId,
  setSelectedTableId,
}) => {
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState('');
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setTablesLoading(false);
      setTablesError('');
      setTables([]);
      return;
    }

    const normalizedDate = String(date || '').trim();
    const normalizedTime = String(time || '').trim();
    const normalizedGuests = Number(guests);

    const canFetch =
      normalizedDate &&
      normalizedTime &&
      Number.isFinite(normalizedGuests) &&
      normalizedGuests >= 1;

    if (!canFetch) {
      setTablesLoading(false);
      setTablesError('');
      setTables([]);
      if (String(selectedTableId || '').trim()) setSelectedTableId('');
      return;
    }

    // Show loading state immediately (even during debounce) to avoid a blank map area.
    setTablesLoading(true);
    setTablesError('');

    let cancelled = false;

    const run = async () => {
      setTablesLoading(true);
      setTablesError('');

      try {
        const response = await ApiService.getTablesAvailability({
          date: normalizedDate,
          time: normalizedTime,
          guests: normalizedGuests,
        });

        if (cancelled) return;

        const apiTables = getTablesFromAvailabilityResponse(response);
        setTables(apiTables);

        const selectableTables = getSelectableTables(apiTables);
        const nextId = pickTableId(selectedTableId, selectableTables);
        if (nextId !== String(selectedTableId || '')) setSelectedTableId(nextId);
      } catch (error) {
        if (cancelled) return;
        setTables([]);
        setSelectedTableId('');
        setTablesError(error?.message || 'Không thể tải danh sách bàn');
      } finally {
        if (cancelled) return;
        setTablesLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void run();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [date, guests, isOpen, selectedTableId, setSelectedTableId, time]);

  return { tablesLoading, tablesError, tables };
};

const getDisabledReasonLabel = (reason) => {
  switch (reason) {
    case 'OCCUPIED':
      return 'Đang có khách';
    case 'CAPACITY':
      return 'Không đủ chỗ';
    case 'TIME_CONFLICT':
      return 'Trùng thời gian';
    default:
      return null;
  }
};

const getTodayISODate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthIndex = (year, monthZeroBased) => year * 12 + monthZeroBased;

const getSlotStartMinutes = (slot) => {
  if (!slot) return null;
  if (Number.isFinite(slot.startMinutes)) return Number(slot.startMinutes);
  return parseTimeToMinutes(slot.id);
};

const getIntervalMinutesFromSlots = (slots) => {
  if (!Array.isArray(slots) || slots.length < 2) return 30;
  const firstStart = getSlotStartMinutes(slots[0]);
  const secondStart = getSlotStartMinutes(slots[1]);
  const delta = Number(secondStart) - Number(firstStart);
  return Number.isFinite(delta) && delta > 0 ? delta : 30;
};

const ReservationCreateModal = ({
  isOpen,
  branchName,
  defaultDate,
  defaultTimeSlotId,
  timeSlots,
  onClose,
  onSubmit,
}) => {
	const dialogRef = useRef(null);
  const calendarWrapRef = useRef(null);
  const initialState = useMemo(
    () => ({
      customer_name: '',
      customer_phone: '',
      email: '',
      date: defaultDate || '',
      timeSlotId: defaultTimeSlotId || (timeSlots?.[0]?.id ?? ''),
      table_id: '',
      people: 1,
      note: '',
    }),
    [defaultDate, defaultTimeSlotId, timeSlots]
  );

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const selected = parseISODate(defaultDate);
    return selected ? selected.getMonth() : new Date().getMonth();
  });
  const [calendarYear, setCalendarYear] = useState(() => {
    const selected = parseISODate(defaultDate);
    return selected ? selected.getFullYear() : new Date().getFullYear();
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialState);
    setErrors({});
    setSubmitError('');
    setCalendarOpen(false);
  }, [initialState, isOpen]);

  useEffect(() => {
    if (!calendarOpen) return;

    const onPointerDown = (event) => {
      const wrap = calendarWrapRef.current;
      if (!wrap) return;
      if (wrap.contains(event.target)) return;
      setCalendarOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setCalendarOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [calendarOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isOpen) return;
    if (dialog.open) return;
    // showModal provides native backdrop.
    dialog.showModal();
  }, [isOpen]);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setSelectedTableId = useCallback(
    (nextId) => {
      setField('table_id', nextId);
    },
    [setField]
  );

  const { tablesLoading, tablesError, tables } = useTablesAvailability({
    isOpen,
    date: form.date,
    time: form.timeSlotId,
    guests: form.people,
    selectedTableId: form.table_id,
    setSelectedTableId,
  });

  const intervalMinutes = useMemo(() => getIntervalMinutesFromSlots(timeSlots), [timeSlots]);
  const filteredTimeSlots = useMemo(() => {
    const slots = Array.isArray(timeSlots) ? timeSlots : [];
    const selectedDate = String(form.date || '').trim();
    if (!selectedDate) return slots;
    if (!isSameLocalDate(selectedDate)) return slots;

    const nowMinutes = getLocalMinutes(new Date());
    const minStart = roundUpMinutesToInterval(nowMinutes, intervalMinutes);
    return slots.filter((slot) => {
      const startMinutes = getSlotStartMinutes(slot);
      if (!Number.isFinite(startMinutes)) return false;
      return startMinutes >= minStart;
    });
  }, [form.date, intervalMinutes, timeSlots]);

  useEffect(() => {
    if (!isOpen) return;
    const slots = filteredTimeSlots;
    if (!Array.isArray(slots) || slots.length === 0) {
      const selectedDate = String(form.date || '').trim();
      if (selectedDate && isSameLocalDate(selectedDate) && String(form.timeSlotId || '').trim()) {
        setField('timeSlotId', '');
      }
      return;
    }
    const currentId = String(form.timeSlotId || '').trim();
    if (!currentId) {
      setField('timeSlotId', slots[0].id);
      return;
    }
    const stillValid = slots.some((s) => String(s?.id) === currentId);
    if (!stillValid) setField('timeSlotId', slots[0].id);
  }, [filteredTimeSlots, form.timeSlotId, isOpen, setField]);

  const selectableTables = useMemo(() => getSelectableTables(tables), [tables]);
  const selectedTable = useMemo(() => {
    const id = String(form.table_id || '').trim();
    if (!id) return null;
    return (tables || []).find((t) => String(t?.table_id) === id) || null;
  }, [form.table_id, tables]);

  const minDate = useMemo(getTodayISODate, []);
  const minDateObj = useMemo(() => parseISODate(minDate), [minDate]);

  useEffect(() => {
    if (!calendarOpen) return;
    const selected = parseISODate(form.date);
    const base = selected || minDateObj || new Date();
    setCalendarMonth(base.getMonth());
    setCalendarYear(base.getFullYear());
  }, [calendarOpen, form.date, minDateObj]);

  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    // Monday-first index
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(calendarYear, calendarMonth, day));
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [calendarMonth, calendarYear]);

  const canGoPrevMonth = useMemo(() => {
    if (!minDateObj) return true;
    const minIdx = getMonthIndex(minDateObj.getFullYear(), minDateObj.getMonth());
    const prevIdx = getMonthIndex(calendarYear, calendarMonth) - 1;
    return prevIdx >= minIdx;
  }, [calendarMonth, calendarYear, minDateObj]);

  const goPrevMonth = () => {
    if (!canGoPrevMonth) return;
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goNextMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    if (!String(form.customer_name || '').trim()) nextErrors.customer_name = 'Vui lòng nhập họ tên';
    if (!String(form.customer_phone || '').trim()) nextErrors.customer_phone = 'Vui lòng nhập số điện thoại';
    if (!String(form.date || '').trim()) nextErrors.date = 'Vui lòng chọn ngày';
    if (!String(form.timeSlotId || '').trim()) nextErrors.timeSlotId = 'Vui lòng chọn giờ';
    if (!String(form.table_id || '').trim()) nextErrors.table_id = 'Vui lòng chọn bàn';
    const peopleNumber = Number(form.people);
    if (!Number.isFinite(peopleNumber) || peopleNumber < 1) nextErrors.people = 'Số khách phải >= 1';
    if (peopleNumber > 50) nextErrors.people = 'Số khách tối đa 50';
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await onSubmit({
        customer_name: String(form.customer_name).trim(),
        customer_phone: String(form.customer_phone).trim(),
        email: String(form.email || '').trim(),
        date: form.date,
        timeSlotId: form.timeSlotId,
        table_id: Number(form.table_id),
        people: Number(form.people),
        note: String(form.note || '').trim(),
      });
		requestClose();
    } catch (err) {
      setSubmitError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const requestClose = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  };

  return (
    <dialog ref={dialogRef} className="reservation-create__dialog" aria-label="Online Reservation" onClose={onClose}>
      <div className="reservation-create__header">
        <div className="reservation-create__title">Online Reservation</div>
        <button
          type="button"
          className="reservation-create__close"
          onClick={requestClose}
          aria-label="Đóng"
        >
          <IoCloseOutline />
        </button>
      </div>

      <form className="reservation-create__form" onSubmit={handleSubmit}>
          <div className="reservation-create__layout">
            <div className="reservation-create__left">
              <div className="reservation-create__grid">
            <label className="reservation-create__label" htmlFor="reservation-fullname">
              Full name <span className="reservation-create__req">*</span>
            </label>
            <div className="reservation-create__field">
              <input
                id="reservation-fullname"
                className={errors.customer_name ? 'reservation-create__input reservation-create__input--error' : 'reservation-create__input'}
                value={form.customer_name}
                onChange={(e) => setField('customer_name', e.target.value)}
                placeholder=""
                autoComplete="name"
              />
              {errors.customer_name ? <div className="reservation-create__error">{errors.customer_name}</div> : null}
            </div>

            <label className="reservation-create__label" htmlFor="reservation-phone">
              Phone number <span className="reservation-create__req">*</span>
            </label>
            <div className="reservation-create__field">
              <input
                id="reservation-phone"
                className={errors.customer_phone ? 'reservation-create__input reservation-create__input--error' : 'reservation-create__input'}
                value={form.customer_phone}
                onChange={(e) => setField('customer_phone', e.target.value)}
                placeholder=""
                autoComplete="tel"
              />
              {errors.customer_phone ? <div className="reservation-create__error">{errors.customer_phone}</div> : null}
            </div>

            <label className="reservation-create__label" htmlFor="reservation-email">
              Email
            </label>
            <div className="reservation-create__field">
              <input
                id="reservation-email"
                className="reservation-create__input"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder=""
                autoComplete="email"
              />
            </div>

            <div className="reservation-create__label">Branch</div>
            <div className="reservation-create__field">
              <div className="reservation-create__branch">{branchName}</div>
            </div>

            <div className="reservation-create__label">
              Date <span className="reservation-create__req">*</span>
            </div>
            <div className="reservation-create__field">
              <div className="reservation-create__calendarWrap" ref={calendarWrapRef}>
                <button
                  type="button"
                  className={errors.date ? 'reservation-create__date reservation-create__date--error' : 'reservation-create__date'}
                  onClick={() => setCalendarOpen((prev) => !prev)}
                  aria-haspopup="dialog"
                  aria-expanded={calendarOpen}
                >
                  <div className="reservation-create__dateIcon" aria-hidden="true">
                    <IoCalendarClearOutline />
                  </div>
                  <div className="reservation-create__dateBody">
                    <div className="reservation-create__dateLabel">Ngày</div>
                    <div className="reservation-create__dateValue">{formatDisplayDate(form.date)}</div>
                  </div>
                </button>

                {calendarOpen ? (
                  <div className="reservation-create__calendarPopover" role="dialog" aria-label="Chọn ngày">
                    <div className="reservation-create__calendarHeader">
                      <button
                        type="button"
                        className="reservation-create__calendarNav"
                        onClick={goPrevMonth}
                        disabled={!canGoPrevMonth}
                        aria-label="Tháng trước"
                      >
                        ‹
                      </button>
                      <div className="reservation-create__calendarTitle">
                        {`${pad2(calendarMonth + 1)}/${calendarYear}`}
                      </div>
                      <button
                        type="button"
                        className="reservation-create__calendarNav"
                        onClick={goNextMonth}
                        aria-label="Tháng sau"
                      >
                        ›
                      </button>
                    </div>

                    <div className="reservation-create__calendarWeekdays" aria-hidden="true">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                        <div key={d} className="reservation-create__calendarWeekday">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="reservation-create__calendarGrid" role="grid" aria-label="Lịch">
                      {calendarWeeks.flat().map((cellDate, idx) => {
                        if (!cellDate) {
                          return <div key={`empty-${idx}`} className="reservation-create__calendarCell reservation-create__calendarCell--empty" />;
                        }

                        const iso = toISODate(cellDate);
                        const isDisabled = Boolean(minDate) && iso < minDate;
                        const isSelected = iso === String(form.date || '');

                        return (
                          <button
                            type="button"
                            key={iso}
                            className={
                              isSelected
                                ? 'reservation-create__calendarCell reservation-create__calendarCell--selected'
                                : 'reservation-create__calendarCell'
                            }
                            onClick={() => {
                              if (isDisabled) return;
                              setField('date', iso);
                              setCalendarOpen(false);
                            }}
                            disabled={isDisabled}
                            aria-selected={isSelected}
                          >
                            {cellDate.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
              {errors.date ? <div className="reservation-create__error">{errors.date}</div> : null}
            </div>

            <label className="reservation-create__label" htmlFor="reservation-time">
              Time <span className="reservation-create__req">*</span>
            </label>
            <div className="reservation-create__field">
              <select
                id="reservation-time"
                className={errors.timeSlotId ? 'reservation-create__select reservation-create__input--error' : 'reservation-create__select'}
                value={form.timeSlotId}
                onChange={(e) => setField('timeSlotId', e.target.value)}
                disabled={filteredTimeSlots.length === 0}
              >
                {filteredTimeSlots.length === 0 ? (
                  <option value="" disabled>
                    Hết giờ đặt hôm nay
                  </option>
                ) : null}
                {(filteredTimeSlots || []).map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {errors.timeSlotId ? <div className="reservation-create__error">{errors.timeSlotId}</div> : null}
            </div>

            <div className="reservation-create__label">
              Table <span className="reservation-create__req">*</span>
            </div>
            <div className="reservation-create__field">
              <div className={errors.table_id ? 'reservation-create__picked reservation-create__picked--error' : 'reservation-create__picked'}>
                {selectedTable ? `Bàn ${selectedTable.table_id} (Sức chứa ${selectedTable.capacity})` : '--'}
              </div>
              {tablesError ? <div className="reservation-create__error">{tablesError}</div> : null}
              {errors.table_id ? <div className="reservation-create__error">{errors.table_id}</div> : null}
              {!tablesLoading && !tablesError && String(form.date || '').trim() && String(form.timeSlotId || '').trim() && Number(form.people) >= 1 && selectableTables.length === 0 ? (
                <div className="reservation-create__error">Không còn bàn trống cho khung giờ này</div>
              ) : null}
            </div>

            <label className="reservation-create__label" htmlFor="reservation-people">
              People <span className="reservation-create__req">*</span>
            </label>
            <div className="reservation-create__field">
              <input
                id="reservation-people"
                type="number"
                min={1}
                max={50}
                className={errors.people ? 'reservation-create__input reservation-create__input--error' : 'reservation-create__input'}
                value={form.people}
                onChange={(e) => setField('people', e.target.value)}
                placeholder=""
              />
              {errors.people ? <div className="reservation-create__error">{errors.people}</div> : null}
            </div>

            <label className="reservation-create__label" htmlFor="reservation-note">
              Note
            </label>
            <div className="reservation-create__field">
              <input
                id="reservation-note"
                className="reservation-create__input"
                value={form.note}
                onChange={(e) => setField('note', e.target.value)}
                placeholder=""
              />
            </div>
              </div>

              {submitError ? <div className="reservation-create__submitError">{submitError}</div> : null}

              <div className="reservation-create__actions">
                <button
                  type="submit"
                  className="reservation-create__submit"
                  disabled={submitting}
                >
                  {submitting ? 'Đang đặt...' : 'Đặt'}
                </button>
              </div>
            </div>

            <div className="reservation-create__right" aria-label="Sơ đồ nhà hàng">
              <div className="reservation-create__mapTitle">Sơ đồ nhà hàng</div>

              <div className="reservation-create__mapScroll" aria-label="Kéo để xem toàn bộ sơ đồ">
                {tablesLoading && (tables || []).length === 0 ? (
                  <div className="reservation-create__mapLoading" role="status" aria-live="polite">
                    <div className="reservation-create__spinner" aria-hidden="true" />
                    <div className="reservation-create__mapLoadingText">Đang tải sơ đồ...</div>
                  </div>
                ) : null}
                <div className="reservation-create__tableGrid" aria-label="Chọn bàn trên sơ đồ">
                  {(tables || []).map((table, index) => {
                  const tableId = String(table?.table_id ?? '');
                  const isSelectable = Boolean(table?.selectable);
                  const isSelected = tableId && tableId === String(form.table_id || '');
                  const isServing = !isSelectable && table?.disabled_reason === 'OCCUPIED';
                  const statusClass = isSelectable ? 'available' : (isServing ? 'serving' : 'booked');
                  const disabledReason = getDisabledReasonLabel(table?.disabled_reason);

                  return (
                    <button
                      type="button"
                      key={tableId || `table-${index}`}
                      className={
                        `reservation-create__tableBox ${statusClass}${isSelected ? ' selected' : ''}`
                      }
                      onClick={() => {
                        if (!isSelectable) return;
                        setField('table_id', isSelected ? '' : tableId);
                      }}
                      disabled={!isSelectable}
                      aria-pressed={isSelected}
                      aria-label={`Bàn ${tableId}, ${table?.capacity ?? 0} ghế, ${isSelectable ? 'có sẵn' : (disabledReason || 'không khả dụng')}`}
                    >
                      <span className="id">Bàn {tableId}</span>
                      <span className="seats">{table?.capacity ?? 0} ghế</span>
                    </button>
                  );
                  })}
                </div>
              </div>

              {tablesLoading ? <div className="reservation-create__mapHint">Đang tải danh sách bàn...</div> : null}
              {!tablesLoading && selectableTables.length ? (
                <output className="reservation-create__mapNotice" aria-live="polite">
                  {selectedTable
                    ? `Đã chọn: Bàn ${selectedTable.table_id} • ${selectedTable.capacity} ghế • Phù hợp cho ${Number(form.people) || 0} người`
                    : 'Click vào một bàn để chọn'}
                </output>
              ) : null}
            </div>

            <aside className="reservation-create__legendPanel" aria-label="Trạng thái bàn">
              <div className="reservation-create__legendTitle">Trạng thái bàn</div>
              <div className="reservation-create__legend" aria-label="Chú thích trạng thái bàn">
                <div className="reservation-create__legendItem">
                  <span className="reservation-create__legendSwatch reservation-create__legendSwatch--available" aria-hidden="true" />
                  <span>Trống</span>
                </div>
                <div className="reservation-create__legendItem">
                  <span className="reservation-create__legendSwatch reservation-create__legendSwatch--booked" aria-hidden="true" />
                  <span>Đã có người đặt</span>
                </div>
                <div className="reservation-create__legendItem">
                  <span className="reservation-create__legendSwatch reservation-create__legendSwatch--serving" aria-hidden="true" />
                  <span>Đang phục vụ</span>
                </div>
              </div>
              <div className="reservation-create__legendNote">
                Bàn không chọn được sẽ hiển thị theo trạng thái tương ứng.
              </div>
            </aside>
          </div>
      </form>
    </dialog>
  );
};

ReservationCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  branchName: PropTypes.string.isRequired,
  defaultDate: PropTypes.string,
  defaultTimeSlotId: PropTypes.string,
  timeSlots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ReservationCreateModal;
