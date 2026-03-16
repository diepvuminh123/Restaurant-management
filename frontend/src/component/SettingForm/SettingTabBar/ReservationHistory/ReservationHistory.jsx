import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../../../../services/apiService';
import './ReservationHistory.css';

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

  const hasItems = useMemo(() => Array.isArray(items) && items.length > 0, [items]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await ApiService.getReservationHistory();
        const data = res?.data || [];
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Không thể tải lịch sử đặt bàn');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="setting-content-card">
      <div className="form-header">
        <span className="form-title">Lịch sử đặt bàn</span>
      </div>

      {loading && <div className="reservation-history__hint">Đang tải dữ liệu...</div>}

      {!loading && error && (
        <div className="reservation-history__error">{error}</div>
      )}

      {!loading && !error && !hasItems && (
        <div className="reservation-history__hint">Bạn chưa có lịch sử đặt bàn.</div>
      )}

      {!loading && !error && hasItems && (
        <div className="reservation-history__list">
          {items.map((r) => (
            <div key={r.reservation_id} className="reservation-history__item">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;
