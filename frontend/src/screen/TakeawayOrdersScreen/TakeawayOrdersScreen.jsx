import React, { useEffect, useMemo, useState } from 'react';
import { IoSearchOutline, IoCalendarClearOutline } from 'react-icons/io5';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmDialog from '../../component/ConfirmDialog/ConfirmDialog';
import './TakeawayOrdersScreen.css';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chưa xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PREPARING', label: 'Đang chuẩn bị' },
  { value: 'READY', label: 'Sẵn sàng để lấy' },
  { value: 'COMPLETED', label: 'Đã hoàn tất' },
  { value: 'CANCELED', label: 'Đã hủy' },
];

const STATUS_BADGE_MAP = {
  PENDING: 'tag-pending',
  CONFIRMED: 'tag-confirmed',
  PREPARING: 'tag-preparing',
  READY: 'tag-ready',
  COMPLETED: 'tag-completed',
  CANCELED: 'tag-canceled',
};

const STATUS_LABEL_MAP = {
  PENDING: 'Chưa xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng để lấy',
  COMPLETED: 'Đã hoàn tất',
  CANCELED: 'Đã hủy',
};

const NOTE_PAYMENT_TAG_REGEX = /^\[PAYMENT_METHOD:[^\]]+\]\s*/;

const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN');

const formatDateTime = (input) => {
  if (!input) return '--';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime = (input) => {
  if (!input) return '--';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TakeawayOrdersScreen = () => {
  const toast = useToastContext();
  const { confirmState, showConfirm } = useConfirm();

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0, limit: 5 });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [draftFilters, setDraftFilters] = useState({
    date: '',
    search: '',
    status: 'ALL',
  });

  const [activeFilters, setActiveFilters] = useState({
    date: '',
    search: '',
    status: 'ALL',
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('PENDING');
  const [note, setNote] = useState('');

  const selectedStatusLabel = useMemo(
    () => STATUS_LABEL_MAP[selectedOrder?.status] || selectedOrder?.status || '--',
    [selectedOrder]
  );

  const fetchOrders = async (page = 1, filters = activeFilters) => {
    try {
      setLoading(true);
      const response = await ApiService.getTakeawayOrders({
        ...filters,
        page,
        limit: pagination.limit,
      });

      if (response.success) {
        const data = response.data || [];
        setOrders(data);
        setPagination(response.pagination || { page: 1, total_pages: 1, total: 0, limit: pagination.limit });

        if (data.length === 0) {
          setSelectedOrderId(null);
          setSelectedOrder(null);
          return;
        }

        const stillExists = data.some((order) => order.id === selectedOrderId);
        if (!selectedOrderId || !stillExists) {
          setSelectedOrderId(data[0].id);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    if (!orderId) return;

    try {
      setDetailLoading(true);
      const response = await ApiService.getTakeawayOrderDetail(orderId);
      if (response.success) {
        const order = response.data;
        setSelectedOrder(order);
        setNote((order.note || '').replace(NOTE_PAYMENT_TAG_REGEX, ''));
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters.date, activeFilters.search, activeFilters.status]);

  useEffect(() => {
    if (selectedOrderId) {
      fetchOrderDetail(selectedOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId]);

  const onApplyFilters = () => {
    setActiveFilters({ ...draftFilters });
  };

  const onStatusOpen = () => {
    if (!selectedOrder) return;
    setNextStatus(selectedOrder.status || 'PENDING');
    setIsStatusModalOpen(true);
  };

  const onSaveStatus = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      await ApiService.updateTakeawayOrderStatus(selectedOrder.id, nextStatus);
      toast.success('Đã cập nhật trạng thái đơn hàng');
      setIsStatusModalOpen(false);
      await fetchOrderDetail(selectedOrder.id);
      await fetchOrders(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    } finally {
      setSaving(false);
    }
  };

  const onConfirmDeposit = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      await ApiService.confirmTakeawayOrderDeposit(selectedOrder.id);

      if (selectedOrder.status === 'PENDING') {
        await ApiService.updateTakeawayOrderStatus(selectedOrder.id, 'CONFIRMED');
      }

      toast.success('Đã đánh dấu thanh toán cọc và xác nhận đơn');
      await fetchOrderDetail(selectedOrder.id);
      await fetchOrders(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Không thể xác nhận thanh toán');
    } finally {
      setSaving(false);
    }
  };

  const onSaveNote = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      await ApiService.updateTakeawayOrderNote(selectedOrder.id, note);
      toast.success('Đã lưu ghi chú');
      await fetchOrderDetail(selectedOrder.id);
    } catch (error) {
      toast.error(error.message || 'Không thể lưu ghi chú');
    } finally {
      setSaving(false);
    }
  };

  const onCancelOrder = async () => {
    if (!selectedOrder) return;

    const accepted = await showConfirm({
      title: 'Hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      confirmText: 'Hủy đơn',
      cancelText: 'Đóng',
      type: 'danger',
    });

    if (!accepted) return;

    try {
      setSaving(true);
      await ApiService.cancelTakeawayOrder(selectedOrder.id, 'Hủy từ màn hình nhân viên');
      toast.success('Đã hủy đơn hàng');
      await fetchOrders(pagination.page);
      if (selectedOrderId) {
        await fetchOrderDetail(selectedOrderId);
      }
    } catch (error) {
      toast.error(error.message || 'Không thể hủy đơn hàng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="takeaway-screen">
      <ConfirmDialog {...confirmState} />

      <div className="takeaway-screen__header">
        <div>
          <h1>Đặt món mang đi</h1>
          <p>Khách đặt món trước và tới lấy tại quầy</p>
        </div>
      </div>

      <div className="takeaway-screen__layout">
        <section className="takeaway-list-panel">
          <h2>Danh sách đơn hàng mang đi</h2>

          <label className="field-label">Ngày đặt:</label>
          <div className="takeaway-filter-row">
            <IoCalendarClearOutline className="filter-icon" />
            <input
              type="date"
              value={draftFilters.date}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="takeaway-filter-row">
            <IoSearchOutline className="filter-icon" />
            <input
              type="text"
              value={draftFilters.search}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Tìm theo tên khách hoặc mã đơn..."
            />
          </div>

          <div className="takeaway-filter-actions">
            <select
              value={draftFilters.status}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button type="button" className="btn-filter" onClick={onApplyFilters}>
              Lọc
            </button>
          </div>

          <div className="takeaway-orders-scroll">
            {loading && <p className="placeholder-text">Đang tải danh sách đơn...</p>}

            {!loading && orders.length === 0 && (
              <p className="placeholder-text">Không có đơn hàng phù hợp.</p>
            )}

            {!loading &&
              orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`order-card ${selectedOrderId === order.id ? 'order-card--active' : ''}`}
                >
                  <div className="order-card__line order-card__line--top">
                    <strong>Mã đơn: {order.order_code}</strong>
                    <span className={`status-tag ${STATUS_BADGE_MAP[order.status] || 'tag-pending'}`}>
                      {STATUS_LABEL_MAP[order.status] || order.status}
                    </span>
                  </div>

                  <div className="order-card__line">Khách: {order.customer_name}</div>
                  <div className="order-card__line">{order.customer_phone}</div>
                  <div className="order-card__line order-card__line--sub">
                    Ngày đặt: {formatDateTime(order.created_at)}
                  </div>
                </button>
              ))}
          </div>

          <div className="takeaway-pagination">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
            >
              {'<'}
            </button>
            <span>
              {pagination.page}/{pagination.total_pages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => fetchOrders(pagination.page + 1)}
            >
              {'>'}
            </button>
          </div>
        </section>

        <section className="takeaway-detail-panel">
          <h2>Chi tiết đơn hàng</h2>

          {!selectedOrderId && <p className="placeholder-text">Chọn một đơn hàng để xem chi tiết.</p>}
          {selectedOrderId && detailLoading && <p className="placeholder-text">Đang tải chi tiết...</p>}

          {selectedOrder && !detailLoading && (
            <>
              <div className="detail-block">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <span>Tên khách hàng:</span>
                  <strong>{selectedOrder.customer_name}</strong>

                  <span>Số điện thoại:</span>
                  <strong>{selectedOrder.customer_phone}</strong>

                  <span>Thời gian hẹn lấy:</span>
                  <strong>{formatTime(selectedOrder.pickup_time)}</strong>
                </div>
              </div>

              <div className="detail-block">
                <h3>Món đã đặt</h3>
                <table className="order-item-table">
                  <thead>
                    <tr>
                      <th>Tên món</th>
                      <th>Số lượng</th>
                      <th>Giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.item_name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unit_price)}</td>
                        <td>{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-total">
                <span>Tổng cộng:</span>
                <strong>{formatCurrency(selectedOrder.final_amount)}đ</strong>
              </div>

              <div className="detail-status">
                <span>Trạng thái đơn hàng:</span>
                <span className={`status-tag ${STATUS_BADGE_MAP[selectedOrder.status] || 'tag-pending'}`}>
                  {selectedStatusLabel}
                </span>
              </div>

              <div className="detail-note-block">
                <label>Ghi chú cho bếp / trường hợp đặc biệt</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: ít đá, không cay, khách lấy sớm hơn dự kiến..."
                />
                <p>Ghi chú sẽ hiển thị cho bộ phận bếp khi chuẩn bị món.</p>
                <button type="button" className="btn-outline" onClick={onSaveNote} disabled={saving}>
                  Lưu ghi chú
                </button>
              </div>

              <button
                type="button"
                className="btn-primary"
                disabled={saving || selectedOrder.status === 'CANCELED'}
                onClick={onConfirmDeposit}
              >
                Đánh dấu đã thanh toán / xác nhận đơn
              </button>

              <button
                type="button"
                className="btn-secondary"
                disabled={saving || selectedOrder.status === 'CANCELED'}
                onClick={onStatusOpen}
              >
                Cập nhật trạng thái
              </button>

              <button
                type="button"
                className="btn-danger-link"
                disabled={saving || selectedOrder.status === 'CANCELED' || selectedOrder.status === 'COMPLETED'}
                onClick={onCancelOrder}
              >
                Hủy đơn
              </button>
            </>
          )}
        </section>
      </div>

      {isStatusModalOpen && (
        <div className="status-modal-backdrop" role="presentation" onClick={() => setIsStatusModalOpen(false)}>
          <div className="status-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal__header">
              <h3>Cập nhật trạng thái đơn hàng</h3>
              <button type="button" onClick={() => setIsStatusModalOpen(false)}>
                ×
              </button>
            </div>
            <p>Chọn trạng thái mới cho đơn hàng</p>

            <label htmlFor="order-status">Trạng thái mới</label>
            <select id="order-status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
              {STATUS_OPTIONS.filter((item) => item.value !== 'ALL').map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="status-modal__actions">
              <button type="button" className="btn-close" onClick={() => setIsStatusModalOpen(false)}>
                Đóng
              </button>
              <button type="button" className="btn-save" disabled={saving} onClick={onSaveStatus}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeawayOrdersScreen;
