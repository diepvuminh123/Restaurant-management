import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../../../../services/apiService';
import { useToast } from '../../../../hooks/useToast';
import { useConfirm } from '../../../../hooks/useConfirm';
import ToastContainer from '../../../Toast/ToastContainer';
import ConfirmDialog from '../../../ConfirmDialog/ConfirmDialog';
import './ReservationHistory.css';

const DropdownSelect = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const reactId = useId();
  const menuId = `reservation-history-dropdown-${reactId}`;

  const selected = useMemo(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    return safeOptions.find((o) => String(o?.value) === String(value)) || safeOptions[0] || null;
  }, [options, value]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!open) return;
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
    };
  }, [open]);

  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div ref={containerRef} className="reservation-history__dropdown">
      <span className="reservation-history__filter-label">{label}</span>
      <button
        type="button"
        className={
          open
            ? 'reservation-history__dropdown-trigger reservation-history__dropdown-trigger--open'
            : 'reservation-history__dropdown-trigger'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <span className="reservation-history__dropdown-value">{selected?.label || ''}</span>
      </button>

      {open && (
        <div id={menuId} className="reservation-history__dropdown-menu">
          {safeOptions.map((opt) => {
            const optValue = String(opt?.value);
            const isActive = String(value) === optValue;
            return (
              <button
                key={optValue}
                type="button"
                className={
                  isActive
                    ? 'reservation-history__dropdown-option reservation-history__dropdown-option--active'
                    : 'reservation-history__dropdown-option'
                }
                onClick={() => {
                  onChange(opt?.value);
                  setOpen(false);
                }}
              >
                {opt?.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

DropdownSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleString('vi-VN');
  }
};

const mapStateLabel = (state) => {
  switch (state) {
    case 'CONFIRM':
      return 'Đã xác nhận';
    case 'CANCELED':
      return 'Đã hủy';
    case 'ON_SERVING':
      return 'Đang phục vụ';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return state || '';
  }
};

const ReservationHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const { toasts, removeToast, success, error: toastError } = useToast();
  const { confirmState, showConfirm } = useConfirm();

  const displayedItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];

    const toTime = (value) => {
      const date = value instanceof Date ? value : new Date(value);
      const ts = date.getTime();
      return Number.isNaN(ts) ? null : ts;
    };

    const now = Date.now();
    const normalizedFilterMode = String(filterMode || 'all');

    const filtered = safeItems.filter((r) => {
      if (!r) return false;

      if (normalizedFilterMode === 'canceled') {
        return r.reservation_state === 'CANCELED';
      }

      if (normalizedFilterMode === 'upcoming') {
        const ts = toTime(r.reservation_time);
        if (ts === null) return false;
        if (ts < now) return false;
        return r.reservation_state === 'CONFIRM' || r.reservation_state === 'ON_SERVING';
      }

      return true;
    });

    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    return filtered
      .slice()
      .sort((a, b) => {
        const ta = toTime(a?.reservation_time);
        const tb = toTime(b?.reservation_time);

        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;

        return order === 'asc' ? ta - tb : tb - ta;
      });
  }, [items, filterMode, sortOrder]);

  const hasDisplayedItems = useMemo(
    () => Array.isArray(displayedItems) && displayedItems.length > 0,
    [displayedItems]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await ApiService.getReservationHistory();
        const data = res?.data || [];
        if (alive) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (alive) {
          setError(e?.message || 'Không thể tải lịch sử đặt bàn');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const canCancel = (r) => {
    if (!r) return false;
    if (r.reservation_state !== 'CONFIRM') return false;
    const t = new Date(r.reservation_time);
    if (Number.isNaN(t.getTime())) return false;
    return t.getTime() > Date.now();
  };

  const onCancelReservation = async (reservation) => {
    if (!reservation?.reservation_id) return;
    if (!canCancel(reservation)) {
      toastError('Không thể hủy đặt bàn này (có thể đã quá giờ hoặc trạng thái không cho phép)');
      return;
    }

    const accepted = await showConfirm({
      title: 'Hủy đặt bàn',
      message: 'Bạn có chắc chắn muốn hủy đặt bàn này?',
      confirmText: 'Hủy đặt bàn',
      cancelText: 'Đóng',
      type: 'danger',
    });

    if (!accepted) return;

    try {
      setCancellingId(reservation.reservation_id);
      await ApiService.cancelReservation(reservation.reservation_id);
      success('Đã hủy đặt bàn');
      setItems((prev) =>
        (Array.isArray(prev) ? prev : []).map((r) =>
          r.reservation_id === reservation.reservation_id
            ? { ...r, reservation_state: 'CANCELED' }
            : r
        )
      );
    } catch (e) {
      toastError(e?.message || 'Không thể hủy đặt bàn');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="setting-content-card">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog {...confirmState} />

      <div className="form-header">
        <span className="form-title">Lịch sử đặt bàn</span>
      </div>

      {!loading && !error && (
        <div className="reservation-history__filters">
          <DropdownSelect
            label="Bộ lọc"
            value={filterMode}
            onChange={(next) => setFilterMode(String(next))}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'upcoming', label: 'Sắp tới' },
              { value: 'canceled', label: 'Đã hủy' },
            ]}
          />

          <DropdownSelect
            label="Thứ tự thời gian"
            value={sortOrder}
            onChange={(next) => setSortOrder(String(next))}
            options={[
              { value: 'desc', label: 'Mới nhất → Cũ nhất' },
              { value: 'asc', label: 'Cũ nhất → Mới nhất' },
            ]}
          />
        </div>
      )}

      {loading && <div className="reservation-history__hint">Đang tải dữ liệu...</div>}

      {!loading && error && (
        <div className="reservation-history__error">{error}</div>
      )}

      {!loading && !error && !hasDisplayedItems && (
        <div className="reservation-history__hint">
          {Array.isArray(items) && items.length > 0
            ? 'Không có lịch đặt bàn phù hợp với bộ lọc.'
            : 'Bạn chưa có lịch sử đặt bàn.'}
        </div>
      )}

      {!loading && !error && hasDisplayedItems && (
        <div className="reservation-history__list">
          {displayedItems.map((r) => (
            <div
              key={r.reservation_id}
              className={
                canCancel(r)
                  ? 'reservation-history__item'
                  : 'reservation-history__item reservation-history__item--locked'
              }
            >
              <div className="reservation-history__row">
                <span className="reservation-history__label">Thời gian</span>
                <span className="reservation-history__value">{formatDateTime(r.reservation_time)}</span>
              </div>

              <div className="reservation-history__row">
                <span className="reservation-history__label">Vị trí bàn</span>
                <span className="reservation-history__value">{r.table_id}</span>
              </div>

              <div className="reservation-history__row">
                <span className="reservation-history__label">Số khách</span>
                <span className="reservation-history__value">{r.number_of_guests}</span>
              </div>

              <div className="reservation-history__row">
                <span className="reservation-history__label">Trạng thái</span>
                <span className="reservation-history__value">{mapStateLabel(r.reservation_state)}</span>
              </div>

              {r.note ? (
                <div className="reservation-history__row">
                  <span className="reservation-history__label">Ghi chú</span>
                  <span className="reservation-history__value reservation-history__note">{r.note}</span>
                </div>
              ) : null}

              {canCancel(r) && (
                <div className="reservation-history__actions">
                  <button
                    type="button"
                    className="reservation-history__cancel-btn"
                    disabled={cancellingId === r.reservation_id}
                    onClick={() => onCancelReservation(r)}
                  >
                    {cancellingId === r.reservation_id ? 'Đang hủy...' : 'Hủy đặt bàn'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;
