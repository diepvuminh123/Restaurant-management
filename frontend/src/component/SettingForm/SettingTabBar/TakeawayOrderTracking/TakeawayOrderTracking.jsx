import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../../../../services/apiService';
import './TakeawayOrderTracking.css';

const STATUS_LABEL_MAP = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng để lấy',
  COMPLETED: 'Đã hoàn tất',
  CANCELED: 'Đã hủy',
};

const STATUS_BADGE_MAP = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  READY: 'status-ready',
  COMPLETED: 'status-completed',
  CANCELED: 'status-canceled',
};

const NOTE_PAYMENT_TAG_REGEX = /^\[PAYMENT_METHOD:[^\]]+\]\s*/;

const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN');

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PREPARING', label: 'Đang chuẩn bị' },
  { value: 'READY', label: 'Sẵn sàng để lấy' },
  { value: 'COMPLETED', label: 'Đã hoàn tất' },
  { value: 'CANCELED', label: 'Đã hủy' },
];

const TakeawayOrderTracking = () => {
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setErrorText('');

      try {
        const response = await ApiService.getMyTakeawayOrders({
          status: statusFilter,
          page,
          limit: 10,
        });

        if (!alive) return;
        const nextOrders = Array.isArray(response?.data) ? response.data : [];
        const nextPagination = response?.pagination || {
          page,
          limit: 10,
          total: nextOrders.length,
          total_pages: 1,
        };

        setOrders(nextOrders);
        setPagination(nextPagination);
        setSelectedOrderId(nextOrders.length > 0 ? nextOrders[0].id : null);
      } catch (error) {
        if (!alive) return;
        setOrders([]);
        setSelectedOrderId(null);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 1,
        });
        setErrorText(error.message || 'Không thể tải danh sách đơn mang về');
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
  }, [statusFilter, page]);

  const onFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const canGoPrev = page > 1;
  const canGoNext = page < (pagination.total_pages || 1);

  return (
    <div className="takeaway-tracking">
      <div className="takeaway-tracking__hero">
        <h2>Theo dõi đơn mang về</h2>
        <p>Xem nhanh trạng thái các đơn đã đặt bằng tài khoản của bạn.</p>
      </div>

      <div className="takeaway-tracking__filters">
        <label htmlFor="takeaway-status-filter">Lọc theo trạng thái</label>
        <select
          id="takeaway-status-filter"
          value={statusFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          disabled={loading}
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {errorText && <p className="takeaway-tracking__error">{errorText}</p>}

      {!loading && !errorText && orders.length === 0 && (
        <p className="takeaway-tracking__empty">Không có đơn mang về phù hợp với bộ lọc hiện tại.</p>
      )}

      {loading && <p className="takeaway-tracking__loading">Đang tải đơn mang về...</p>}

      {!loading && orders.length > 0 && (
        <div className="takeaway-tracking__layout">
          <section className="takeaway-tracking__list">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`takeaway-tracking__card ${selectedOrderId === order.id ? 'takeaway-tracking__card--active' : ''}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="takeaway-tracking__card-line">
                  <strong>{order.order_code}</strong>
                  <span className={`takeaway-tracking__status ${STATUS_BADGE_MAP[order.status] || 'status-pending'}`}>
                    {STATUS_LABEL_MAP[order.status] || order.status}
                  </span>
                </div>
                <p>Thời gian nhận: {formatDateTime(order.pickup_time)}</p>
                <p>Tổng: {formatCurrency(order.final_amount)}đ</p>
              </button>
            ))}

            <div className="takeaway-tracking__pagination">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev || loading}
              >
                Trang trước
              </button>
              <span>
                Trang {pagination.page || page}/{pagination.total_pages || 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!canGoNext || loading}
              >
                Trang sau
              </button>
            </div>
          </section>

          <section className="takeaway-tracking__detail">
            {selectedOrder && (
              <>
                <h3>Chi tiết đơn</h3>

                <div className="takeaway-tracking__detail-grid">
                  <span>Mã đơn:</span>
                  <strong>{selectedOrder.order_code}</strong>

                  <span>Trạng thái:</span>
                  <strong>{STATUS_LABEL_MAP[selectedOrder.status] || selectedOrder.status}</strong>

                  <span>Nhận món lúc:</span>
                  <strong>{formatDateTime(selectedOrder.pickup_time)}</strong>

                  <span>Tiền cọc:</span>
                  <strong>{formatCurrency(selectedOrder.deposit_amount)}đ</strong>

                  <span>Tổng tiền:</span>
                  <strong>{formatCurrency(selectedOrder.final_amount)}đ</strong>
                </div>

                <div className="takeaway-tracking__items">
                  <h4>Món trong đơn</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Món</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.item_name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unit_price)}đ</td>
                          <td>{formatCurrency(item.line_total)}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedOrder.note && (
                  <div className="takeaway-tracking__note">
                    <h4>Ghi chú</h4>
                    <p>{selectedOrder.note.replace(NOTE_PAYMENT_TAG_REGEX, '') || '(Không có ghi chú)'}</p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default TakeawayOrderTracking;
