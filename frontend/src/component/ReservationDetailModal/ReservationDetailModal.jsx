import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { IoCheckmarkOutline, IoCloseOutline, IoPlayOutline } from 'react-icons/io5';
import './ReservationDetailModal.css';

const RESERVATION_STATUS_LABELS = {
  CONFIRM: 'Đã xác nhận',
  ON_SERVING: 'Đang phục vụ',
  COMPLETED: 'Hoàn tất',
  CANCELED: 'Đã hủy',
};

const formatDisplayDate = (isoString) => {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('vi-VN');
};

const formatDisplayTime = (isoString) => {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const normalizeSlotId = (isoDateTime) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return null;
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = date.getMinutes() < 30 ? '00' : '30';
  return `${hour}:${minute}`;
};

const getSlotLabel = (isoDateTime, timeSlots) => {
  const slotId = normalizeSlotId(isoDateTime);
  if (!slotId) return null;
  const slot = (timeSlots || []).find((s) => String(s?.id) === slotId);
  return slot?.label || null;
};

const extractTagValue = (text, tag) => {
  if (!text) return '';
  const source = String(text);
  // Accept common tag formats: "TAG: value" or "TAG : value" separated by pipes.
  const regex = new RegExp(String.raw`${tag}\s*:\s*([^|]+)`, 'i');
  const match = regex.exec(source);
  return match ? String(match[1]).trim() : '';
};

const parseRestaurantNote = (restaurantNote) => {
  const note = String(restaurantNote || '');
  const customerName = extractTagValue(note, 'KH');
  const phone = extractTagValue(note, 'SDT');
  const email = extractTagValue(note, 'Email');
  const customerNote = extractTagValue(note, 'Ghi chú');

  return {
    customerName,
    phone,
    email,
    customerNote,
  };
};

const formatCreatedBy = ({ user_id, session_id }) => {
  if (user_id) return `Khách (user_id: ${user_id})`;
  const session = String(session_id || '').trim();
  if (!session) return '--';

  const staffMatch = /^staff:(\d+):/i.exec(session);
  if (staffMatch) return `Nhân viên (id: ${staffMatch[1]})`;
  return session;
};

const ReservationDetailModal = ({
  isOpen,
  reservationId,
  detail,
  loading,
  error,
  timeSlots,
  onClose,
  onUpdateStatus,
  updatingStatus,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isOpen) return;
    if (dialog.open) return;
    dialog.showModal();
  }, [isOpen]);

  const requestClose = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  };

  const parsed = useMemo(() => parseRestaurantNote(detail?.restaurant_note), [detail?.restaurant_note]);

  const slotLabel = useMemo(() => {
    if (!detail?.reservation_time) return null;
    return getSlotLabel(detail.reservation_time, timeSlots);
  }, [detail?.reservation_time, timeSlots]);

  const guestsValue = useMemo(() => {
    const guests = detail?.number_of_guests;
    if (guests === 0 || guests) return String(guests);
    return '--';
  }, [detail?.number_of_guests]);

  const createdAt = detail?.created_at || null;
  const currentState = String(detail?.reservation_state || '').toUpperCase();

  const nextPrimaryAction = useMemo(() => {
    if (!reservationId || loading) return null;
    if (currentState === 'CONFIRM') {
      return {
        label: 'Chuyển sang đang phục vụ',
        value: 'ON_SERVING',
        icon: IoPlayOutline,
      };
    }

    if (currentState === 'ON_SERVING') {
      return {
        label: 'Đánh dấu hoàn tất',
        value: 'COMPLETED',
        icon: IoCheckmarkOutline,
      };
    }

    return null;
  }, [currentState, loading, reservationId]);

  const canCancel = useMemo(() => {
    if (!reservationId) return false;
    if (loading) return false;
    if (currentState !== 'CONFIRM') return false;
    return typeof onUpdateStatus === 'function';
  }, [currentState, loading, onUpdateStatus, reservationId]);

  const canRunPrimaryAction = Boolean(nextPrimaryAction && typeof onUpdateStatus === 'function');

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="reservation-detail__dialog"
      aria-label="Chi tiết đặt bàn"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
    >
      <div className="reservation-detail__header">
        <div className="reservation-detail__title">Đặt bàn</div>
        <button type="button" className="reservation-detail__close" onClick={requestClose} aria-label="Đóng">
          <IoCloseOutline />
        </button>
      </div>

      <div className="reservation-detail__content">
        {loading ? <div className="reservation-detail__muted">Đang tải...</div> : null}
        {error ? <div className="reservation-detail__error">{error}</div> : null}

        {!loading && !error ? (
          <>
            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Tên khách hàng</div>
              <input className="reservation-detail__input" value={detail?.customer_name || parsed.customerName || '--'} readOnly />
            </div>

            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Số điện thoại</div>
              <input className="reservation-detail__input" value={detail?.customer_phone || parsed.phone || '--'} readOnly />
            </div>

            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Email</div>
              <input className="reservation-detail__input" value={detail?.customer_email || parsed.email || '--'} readOnly />
            </div>

            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Ngày đặt</div>
              <input className="reservation-detail__input" value={formatDisplayDate(detail?.reservation_time)} readOnly />
            </div>

            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Giờ đặt</div>
              <input
                className="reservation-detail__input"
                value={slotLabel || formatDisplayTime(detail?.reservation_time)}
                readOnly
              />
            </div>
            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Trạng thái</div>
              <div className={`reservation-detail__status reservation-detail__status--${currentState.toLowerCase() || 'unknown'}`}>
                {RESERVATION_STATUS_LABELS[currentState] || currentState || '--'}
              </div>
            </div>

            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Số người</div>
              <input
                className="reservation-detail__input"
                value={guestsValue}
                readOnly
              />
            </div>

            <div className="reservation-detail__field">
              <div className="reservation-detail__label">Ghi chú</div>
              <textarea
                className="reservation-detail__textarea"
                value={detail?.customer_note || parsed.customerNote || '--'}
                readOnly
                rows={3}
              />
            </div>

            <div className="reservation-detail__actions">
              {nextPrimaryAction ? (
                <button
                  type="button"
                  className="reservation-detail__action reservation-detail__action--primary"
                  disabled={!canRunPrimaryAction || updatingStatus}
                  onClick={() => onUpdateStatus(reservationId, nextPrimaryAction.value)}
                >
                  <nextPrimaryAction.icon />
                  <span>{updatingStatus ? 'Đang cập nhật...' : nextPrimaryAction.label}</span>
                </button>
              ) : null}

              <button
                type="button"
                className="reservation-detail__action reservation-detail__action--danger"
                disabled={!canCancel || updatingStatus}
                onClick={() => onUpdateStatus(reservationId, 'CANCELED')}
              >
                <IoCloseOutline />
                <span>{updatingStatus ? 'Đang cập nhật...' : 'Hủy đặt chỗ'}</span>
              </button>
            </div>

            <div className="reservation-detail__meta">
              <div className="reservation-detail__metaText">
                <div>
                  <span className="reservation-detail__metaLabel">Người tạo:</span>{' '}
                  <span>{formatCreatedBy(detail || {})}</span>
                </div>
                <div>
                  <span className="reservation-detail__metaLabel">Cập nhật lần cuối:</span>{' '}
                  <span>{createdAt ? new Date(createdAt).toLocaleString('vi-VN') : '--'}</span>
                </div>
                <div>
                  <span className="reservation-detail__metaLabel">Mã đặt bàn:</span>{' '}
                  <span>#{reservationId || '--'}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </dialog>
  );
};

ReservationDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  reservationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  detail: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  timeSlots: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func,
  updatingStatus: PropTypes.bool,
};

ReservationDetailModal.defaultProps = {
  reservationId: null,
  detail: null,
  loading: false,
  error: '',
  timeSlots: [],
  onUpdateStatus: null,
  updatingStatus: false,
};

export default ReservationDetailModal;
