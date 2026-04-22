import React, { useEffect, useMemo, useState } from 'react';
import { IoSearchOutline, IoCalendarClearOutline, IoAdd, IoRemove } from 'react-icons/io5';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import { useConfirm } from '../../hooks/useConfirm';
import { useCart } from '../../hooks/useCart';
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

const PAYMENT_OPTIONS = [
  { value: 'zalopay', label: 'ZaloPay' },
  { value: 'acb', label: 'ACB' },
  { value: 'vietcombank', label: 'Vietcombank' },
];

const NOTE_PAYMENT_TAG_REGEX = /^\[PAYMENT_METHOD:[^\]]+\]\s*/;

const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN');

const toDateInputValue = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const toTimeInputValue = (date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const getDefaultPickupInput = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 45);
  return {
    pickupDate: toDateInputValue(date),
    pickupTime: toTimeInputValue(date),
  };
};

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

const TakeawayOrdersScreen = ({ userRole }) => {
  const toast = useToastContext();
  const { confirmState, showConfirm } = useConfirm();
  const {
    cartItems,
    cartTotalAmount,
    loading: cartLoading,
    addToCart,
    updateQuantity,
    validateCart,
    refreshCart,
  } = useCart();

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [createOrderForm, setCreateOrderForm] = useState(() => {
    const defaults = getDefaultPickupInput();
    return {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      pickupDate: defaults.pickupDate,
      pickupTime: defaults.pickupTime,
      note: '',
      payment_method: 'zalopay',
    };
  });

  const isEmployee = userRole === 'employee';

  const cartQuantityMap = useMemo(() => {
    const quantityMap = new Map();
    cartItems.forEach((item) => quantityMap.set(item.id, item.quantity || 0));
    return quantityMap;
  }, [cartItems]);

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

  const loadMenuItems = async (searchTerm = '') => {
    try {
      setMenuLoading(true);
      const response = await ApiService.getMenuItems({
        search: searchTerm,
        limit: 200,
      });

      if (response.success) {
        const rawItems = response.items || [];
        const availableItems = rawItems.filter((item) => item.available !== false && !item.is_soldout);
        setMenuItems(availableItems);
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách món');
    } finally {
      setMenuLoading(false);
    }
  };

  const onCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onOpenCreateModal = async () => {
    if (!isEmployee) {
      return;
    }

    setIsCreateModalOpen(true);
    await Promise.all([refreshCart(), loadMenuItems(menuSearch)]);
  };

  const onCloseCreateModal = () => {
    if (creatingOrder) {
      return;
    }
    setIsCreateModalOpen(false);
  };

  const onSearchMenuItems = async () => {
    await loadMenuItems(menuSearch.trim());
  };

  const onIncreaseMenuItem = async (menuItem) => {
    const currentQty = cartQuantityMap.get(menuItem.id) || 0;
    if (currentQty > 0) {
      await updateQuantity(menuItem.id, 1);
      return;
    }

    await addToCart(menuItem, 1, '');
  };

  const onDecreaseMenuItem = async (menuItemId) => {
    await updateQuantity(menuItemId, -1);
  };

  const onCreateOrder = async () => {
    if (creatingOrder || cartLoading) {
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 món để tạo đơn.');
      return;
    }

    if (
      !createOrderForm.customer_name.trim() ||
      !createOrderForm.customer_phone.trim() ||
      !createOrderForm.customer_email.trim() ||
      !createOrderForm.pickupDate ||
      !createOrderForm.pickupTime
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc để tạo đơn.');
      return;
    }

    const pickupTime = new Date(`${createOrderForm.pickupDate}T${createOrderForm.pickupTime}:00`);

    if (Number.isNaN(pickupTime.getTime())) {
      toast.error('Thời gian nhận món không hợp lệ.');
      return;
    }

    if (pickupTime.getTime() <= Date.now()) {
      toast.error('Thời gian nhận món phải lớn hơn thời gian hiện tại.');
      return;
    }

    try {
      setCreatingOrder(true);

      const validationResult = await validateCart();
      if (!validationResult?.valid) {
        toast.error((validationResult?.errors || ['Giỏ hàng không hợp lệ']).join('\n'));
        return;
      }

      const response = await ApiService.createOrder({
        customer_name: createOrderForm.customer_name.trim(),
        customer_phone: createOrderForm.customer_phone.trim(),
        customer_email: createOrderForm.customer_email.trim(),
        pickup_time: pickupTime.toISOString(),
        note: createOrderForm.note.trim(),
        payment_method: createOrderForm.payment_method,
      });

      if (!response.success) {
        return;
      }

      const createdOrderId = response.data?.id;
      const resetFilters = { date: '', search: '', status: 'ALL' };
      const defaults = getDefaultPickupInput();

      setCreateOrderForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        pickupDate: defaults.pickupDate,
        pickupTime: defaults.pickupTime,
        note: '',
        payment_method: 'zalopay',
      });

      setIsCreateModalOpen(false);
      setDraftFilters(resetFilters);
      setActiveFilters(resetFilters);

      await refreshCart();
      await fetchOrders(1, resetFilters);

      if (createdOrderId) {
        setSelectedOrderId(createdOrderId);
      }

      toast.success('Tạo đơn mang đi thành công.');
    } catch (error) {
      toast.error(error.message || 'Không thể tạo đơn mang đi.');
    } finally {
      setCreatingOrder(false);
    }
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

        {isEmployee && (
          <button className="takeaway-screen__create-btn" type="button" onClick={onOpenCreateModal}>
            <IoAdd />
            Tạo đơn mang đi
          </button>
        )}
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

      {isCreateModalOpen && (
        <div className="create-order-modal-backdrop" role="presentation" onClick={onCloseCreateModal}>
          <div
            className="create-order-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Tạo đơn mang đi"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="create-order-modal__header">
              <h3>Tạo đơn mang đi</h3>
              <button type="button" onClick={onCloseCreateModal} disabled={creatingOrder}>
                ×
              </button>
            </div>

            <div className="create-order-modal__body">
              <section className="create-order-menu-panel">
                <div className="create-order-menu-header">
                  <h4>Danh sách món</h4>
                  <div className="create-order-menu-search">
                    <input
                      type="text"
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onSearchMenuItems();
                        }
                      }}
                      placeholder="Tìm món..."
                    />
                    <button type="button" onClick={onSearchMenuItems} disabled={menuLoading}>
                      Tìm
                    </button>
                  </div>
                </div>

                <div className="create-order-menu-list">
                  {menuLoading && <p className="placeholder-text">Đang tải món...</p>}

                  {!menuLoading && menuItems.length === 0 && (
                    <p className="placeholder-text">Không tìm thấy món phù hợp.</p>
                  )}

                  {!menuLoading &&
                    menuItems.map((item) => {
                      const quantity = cartQuantityMap.get(item.id) || 0;
                      const unitPrice = Number(item.sale_price || item.price || 0);

                      return (
                        <div key={item.id} className="create-order-menu-item">
                          <div>
                            <strong>{item.name}</strong>
                            <p>{formatCurrency(unitPrice)}đ</p>
                          </div>

                          <div className="create-order-quantity-controls">
                            <button
                              type="button"
                              onClick={() => onDecreaseMenuItem(item.id)}
                              disabled={cartLoading || quantity === 0}
                            >
                              <IoRemove />
                            </button>
                            <span>{quantity}</span>
                            <button
                              type="button"
                              onClick={() => onIncreaseMenuItem(item)}
                              disabled={cartLoading}
                            >
                              <IoAdd />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              <section className="create-order-form-panel">
                <div className="create-order-cart-summary">
                  <div>
                    <span>Số món trong giỏ:</span>
                    <strong>{cartItems.length}</strong>
                  </div>
                  <div>
                    <span>Tổng tiền:</span>
                    <strong>{formatCurrency(cartTotalAmount)}đ</strong>
                  </div>
                </div>

                <div className="create-order-cart-items">
                  {cartItems.length === 0 && <p>Chưa có món nào trong giỏ.</p>}
                  {cartItems.map((item) => (
                    <p key={`${item.id}-${item.cartItemId}`}>
                      {item.name} x{item.quantity}
                    </p>
                  ))}
                </div>

                <div className="create-order-form-grid">
                  <label>
                    Tên khách hàng *
                    <input
                      type="text"
                      name="customer_name"
                      value={createOrderForm.customer_name}
                      onChange={onCreateFormChange}
                      placeholder="Nguyen Van A"
                    />
                  </label>

                  <label>
                    Số điện thoại *
                    <input
                      type="tel"
                      name="customer_phone"
                      value={createOrderForm.customer_phone}
                      onChange={onCreateFormChange}
                      placeholder="0912345678"
                    />
                  </label>

                  <label>
                    Email *
                    <input
                      type="email"
                      name="customer_email"
                      value={createOrderForm.customer_email}
                      onChange={onCreateFormChange}
                      placeholder="khach@example.com"
                    />
                  </label>

                  <label>
                    Phương thức thanh toán
                    <select
                      name="payment_method"
                      value={createOrderForm.payment_method}
                      onChange={onCreateFormChange}
                    >
                      {PAYMENT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Ngày nhận món *
                    <input
                      type="date"
                      name="pickupDate"
                      value={createOrderForm.pickupDate}
                      onChange={onCreateFormChange}
                    />
                  </label>

                  <label>
                    Giờ nhận món *
                    <input
                      type="time"
                      name="pickupTime"
                      value={createOrderForm.pickupTime}
                      onChange={onCreateFormChange}
                    />
                  </label>
                </div>

                <label className="create-order-note">
                  Ghi chú
                  <textarea
                    name="note"
                    value={createOrderForm.note}
                    onChange={onCreateFormChange}
                    placeholder="Ví dụ: không cay, thêm đũa..."
                  />
                </label>
              </section>
            </div>

            <div className="create-order-modal__actions">
              <button type="button" className="btn-cancel" onClick={onCloseCreateModal} disabled={creatingOrder}>
                Đóng
              </button>
              <button
                type="button"
                className="btn-create"
                onClick={onCreateOrder}
                disabled={creatingOrder || cartLoading || cartItems.length === 0}
              >
                {creatingOrder ? 'Đang tạo đơn...' : 'Tạo đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeawayOrdersScreen;
