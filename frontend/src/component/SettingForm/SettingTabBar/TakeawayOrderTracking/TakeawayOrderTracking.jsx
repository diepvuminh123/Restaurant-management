import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoReceiptOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoRestaurantOutline,
} from 'react-icons/io5';
import ApiService from '../../../../services/apiService';
import ConfirmDialog from '../../../ConfirmDialog/ConfirmDialog';
import { useConfirm } from '../../../../hooks/useConfirm';
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

const PAYMENT_STATUS_LABEL_MAP = {
  UNPAID: 'Chưa cọc',
  DEPOSIT_PAID: 'Đã cọc',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn cọc',
};

const PAYMENT_STATUS_BADGE_MAP = {
  UNPAID: 'payment-unpaid',
  DEPOSIT_PAID: 'payment-deposit-paid',
  PAID: 'payment-paid',
  REFUNDED: 'payment-refunded',
};

const PROGRESS_STEPS = [
  { key: 'RECEIVED', label: 'Nhận đơn', Icon: IoCheckmarkCircleOutline },
  { key: 'PREPARING', label: 'Chế biến', Icon: IoRestaurantOutline },
  { key: 'READY', label: 'Sẵn sàng lấy', Icon: IoCubeOutline },
  { key: 'COMPLETED', label: 'Hoàn tất', Icon: IoCheckmarkCircleOutline },
];

const STATUS_TO_PROGRESS_INDEX = {
  PENDING: 0,
  CONFIRMED: 0,
  PREPARING: 1,
  READY: 2,
  COMPLETED: 3,
};

const POLLING_INTERVAL_MS = 20000;

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

const getTakeawayStatusContent = (order) => {
  if (!order) {
    return {
      title: 'Trạng thái đơn hàng',
      message: 'Không có dữ liệu trạng thái đơn hàng.',
    };
  }

  const pickupTimeText = formatDateTime(order.pickup_time);
  const canceledReason = (order.canceled_reason || '').trim();
  const normalizedCanceledReason = canceledReason.toLowerCase();

  switch (order.status) {
    case 'PENDING':
      return {
        title: `Thời gian dự kiến đến lấy: ${pickupTimeText}`,
        message:
          order.payment_status === 'UNPAID'
            ? 'Đơn hàng đang chờ xác nhận và xác nhận cọc từ nhà hàng.'
            : 'Đơn hàng đang chờ nhà hàng xác nhận.',
      };
    case 'CONFIRMED':
      return {
        title: `Thời gian dự kiến đến lấy: ${pickupTimeText}`,
        message: 'Nhà hàng đã xác nhận đơn. Bếp sẽ bắt đầu chuẩn bị theo lịch nhận món của bạn.',
      };
    case 'PREPARING':
      return {
        title: `Thời gian dự kiến đến lấy: ${pickupTimeText}`,
        message: 'Nhà hàng đang chuẩn bị món ăn của bạn.',
      };
    case 'READY':
      return {
        title: `Đơn đã sẵn sàng để lấy từ ${pickupTimeText}`,
        message: 'Bạn có thể đến nhà hàng để nhận món.',
      };
    case 'COMPLETED':
      return {
        title: 'Đơn hàng đã hoàn tất',
        message: 'Đơn hàng đã được hoàn tất. Cảm ơn bạn đã đặt món tại nhà hàng.',
      };
    case 'CANCELED': {
      let message = 'Đơn hàng đã bị hủy test01.';
      console.log(normalizedCanceledReason, "normalizedCanceledReason")

      if (normalizedCanceledReason.includes('khách hủy')) {
        message = 'Bạn đã hủy đơn hàng này.';
      } else if (
        // normalizedCanceledReason.includes('quá hạn') ||
        // normalizedCanceledReason.includes('thanh toán cọc')
        normalizedCanceledReason.includes('Tự động hủy do quá hạn thanh toán cọc')
      ) {
        message = 'Đơn hàng đã bị hủy do quá thời gian cọc.';
      } else if (order.canceled_by) {
        message = 'Đơn hàng đã được hủy theo yêu cầu.';
      }

      if (canceledReason) {
        message = `${message} Lý do: ${canceledReason}.`;
      }

      return {
        title: 'Đơn hàng đã bị hủy',
        message,
      };
    }
    default:
      return {
        title: 'Trạng thái đơn hàng',
        message: 'Trạng thái đơn hàng đã được cập nhật.',
      };
  }
};

const buildStatusChangeMessage = (order, previousStatus) => {
  const orderCode = order.order_code || `#${order.id}`;
  const previousLabel = STATUS_LABEL_MAP[previousStatus] || previousStatus;
  const nextLabel = STATUS_LABEL_MAP[order.status] || order.status;
  return `Đơn ${orderCode} đã chuyển trạng thái từ "${previousLabel}" sang "${nextLabel}".`;
};

const TakeawayOrderTracking = () => {
  const { confirmState, showConfirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [actionText, setActionText] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const previousStatusesRef = useRef(new Map());
  const isFirstLoadRef = useRef(true);
  const isMountedRef = useRef(true);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const statusContent = useMemo(() => getTakeawayStatusContent(selectedOrder), [selectedOrder]);

  const currentProgressIndex =
    selectedOrder?.status && STATUS_TO_PROGRESS_INDEX[selectedOrder.status] !== undefined
      ? STATUS_TO_PROGRESS_INDEX[selectedOrder.status]
      : -1;

  const isProgressCompleted = currentProgressIndex === PROGRESS_STEPS.length - 1;
  let progressLineWidth = '0%';

  if (currentProgressIndex >= 0) {
    progressLineWidth = `${((currentProgressIndex + 0.5) / PROGRESS_STEPS.length) * 100 - 5}%`;
  }

  if (isProgressCompleted) {
    progressLineWidth = '90%';
  }

  const paymentStatusLabel = selectedOrder
    ? PAYMENT_STATUS_LABEL_MAP[selectedOrder.payment_status] || selectedOrder.payment_status || 'Chưa cập nhật'
    : '';

  const cleanedNote = selectedOrder?.note
    ? selectedOrder.note.replace(NOTE_PAYMENT_TAG_REGEX, '').trim()
    : '';

  const itemSummary = selectedOrder?.items?.length
    ? selectedOrder.items.map((item) => `${item.item_name} x${item.quantity}`).join(', ')
    : 'Không có dữ liệu món';

  useEffect(() => {
    const load = async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      setErrorText('');

      try {
        const response = await ApiService.getMyTakeawayOrders({
          status: statusFilter,
          page,
          limit: 10,
        });

        if (!isMountedRef.current) return;

        const nextOrders = Array.isArray(response?.data) ? response.data : [];
        const nextPagination = response?.pagination || {
          page,
          limit: 10,
          total: nextOrders.length,
          total_pages: 1,
        };

        if (!isFirstLoadRef.current) {
          const changedOrder = nextOrders.find((order) => {
            const previousStatus = previousStatusesRef.current.get(order.id);
            return previousStatus && previousStatus !== order.status;
          });

          if (changedOrder) {
            const previousStatus = previousStatusesRef.current.get(changedOrder.id);
            setActionText(buildStatusChangeMessage(changedOrder, previousStatus));
          }
        }

        previousStatusesRef.current = new Map(nextOrders.map((order) => [order.id, order.status]));
        isFirstLoadRef.current = false;

        setOrders(nextOrders);
        setPagination(nextPagination);
        setSelectedOrderId((currentId) => {
          if (nextOrders.length === 0) {
            return null;
          }

          if (currentId && nextOrders.some((order) => order.id === currentId)) {
            return currentId;
          }

          return nextOrders[0].id;
        });
      } catch (error) {
        if (!isMountedRef.current) return;
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
        if (isMountedRef.current && !silent) {
          setLoading(false);
        }
      }
    };

    load();
    const intervalId = window.setInterval(() => {
      load({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [statusFilter, page]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRestaurantInfo = async () => {
      try {
        const response = await ApiService.getRestaurantInfo();
        if (!alive) return;
        setRestaurantInfo(response?.data || null);
      } catch {
        if (!alive) return;
        setRestaurantInfo(null);
      }
    };

    loadRestaurantInfo();

    return () => {
      alive = false;
    };
  }, []);

  const onFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const canGoPrev = page > 1;
  const canGoNext = page < (pagination.total_pages || 1);

  const handleDepositGuide = () => {
    setActionText('Vui lòng gửi ảnh hóa đơn cọc qua Messenger để nhà hàng xác nhận trạng thái cọc.');
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const orderLabel = selectedOrder.order_code || `#${selectedOrder.id}`;

    const accepted = await showConfirm({
      title: 'Xác nhận hủy đơn',
      message: `Bạn có chắc muốn hủy đơn ${orderLabel} không?`,
      confirmText: 'Xác nhận hủy',
      cancelText: 'Giữ đơn',
      type: 'danger',
    });

    if (!accepted) return;

    try {
      setIsCancelling(true);
      setActionText('');
      const response = await ApiService.cancelMyTakeawayOrder(selectedOrder.id, 'Khách hủy từ trang cá nhân');
      const updatedOrder = response?.data;

      if (updatedOrder) {
        setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order)));
      }

      setActionText('Đơn hàng đã được hủy thành công.');
    } catch (error) {
      setActionText(error.message || 'Hiện chưa thể hủy đơn trực tiếp từ trang cá nhân. Vui lòng liên hệ nhà hàng để được hỗ trợ.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="takeaway-tracking">
      <ConfirmDialog {...confirmState} />

      <div className="takeaway-tracking__hero">
        <h2>Theo dõi đơn mang về</h2>
        <p>Chi tiết tiến độ, trạng thái cọc và thời gian nhận món của các đơn bạn đã đặt.</p>
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
      {actionText && <p className="takeaway-tracking__info">{actionText}</p>}

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
                <div className="takeaway-detail-card">
                  <h3>Mã đơn: {selectedOrder.order_code || `#${selectedOrder.id}`}</h3>

                  <div className="takeaway-detail-grid">
                    <div>
                      <span>Chi tiết món</span>
                      <strong>{itemSummary}</strong>
                    </div>
                    <div>
                      <span>Tổng tiền</span>
                      <strong>{formatCurrency(selectedOrder.final_amount)}đ</strong>
                    </div>
                    <div>
                      <span>Ghi chú món ăn</span>
                      <strong>{cleanedNote || '(Không có ghi chú)'}</strong>
                    </div>
                    <div>
                      <span>Thời gian đến lấy</span>
                      <strong>{formatDateTime(selectedOrder.pickup_time)}</strong>
                    </div>
                    <div>
                      <span>Ngày đặt</span>
                      <strong>{formatDateTime(selectedOrder.created_at)}</strong>
                    </div>
                    <div>
                      <span>Trạng thái đơn</span>
                      <strong>{STATUS_LABEL_MAP[selectedOrder.status] || selectedOrder.status}</strong>
                    </div>
                  </div>

                  <div className="takeaway-pickup-location">
                    <IoLocationOutline />
                    <div>
                      <span>Địa điểm nhận</span>
                      <strong>{restaurantInfo?.address_line || 'Vui lòng liên hệ nhà hàng để xác nhận địa điểm nhận món'}</strong>
                    </div>
                  </div>
                </div>

                <div className="takeaway-section">
                  <h4>Tiến trình đơn hàng</h4>
                  <div className="takeaway-progress-line" style={{ '--takeaway-progress-width': progressLineWidth }}>
                    {PROGRESS_STEPS.map((step, index) => {
                      const isDone = currentProgressIndex > index;
                      const isActive = currentProgressIndex === index;
                      const isPending = currentProgressIndex < index;
                      let connectorState = '';

                      if (index > 0) {
                        connectorState = currentProgressIndex >= index ? 'has-completed-connector' : 'has-pending-connector';
                      }

                      const StepIcon = step.Icon;

                      return (
                        <div key={step.key} className={`takeaway-progress-step ${connectorState}`}>
                          <div
                            className={`takeaway-progress-dot ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''} ${isPending ? 'is-pending' : ''}`}
                          >
                            <StepIcon />
                          </div>
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="takeaway-section">
                  <h4>
                    <IoReceiptOutline /> Thanh toán cọc
                  </h4>
                  <p>
                    Đơn hàng này yêu cầu cọc trước 50% giá trị ({formatCurrency(selectedOrder.deposit_amount)}đ).
                    Sau khi chuyển khoản, vui lòng gửi ảnh bill qua Messenger để nhà hàng xác nhận.
                  </p>
                  <div className="takeaway-actions-row">
                    <span
                      className={`takeaway-payment-status ${PAYMENT_STATUS_BADGE_MAP[selectedOrder.payment_status] || 'payment-unpaid'}`}
                    >
                      {paymentStatusLabel}
                    </span>
                    <button
                      type="button"
                      className="takeaway-primary-btn"
                      onClick={handleDepositGuide}
                      disabled={selectedOrder.payment_status === 'DEPOSIT_PAID' || selectedOrder.payment_status === 'PAID'}
                    >
                      Tiến hành cọc
                    </button>
                  </div>
                </div>

                <div className="takeaway-hint">
                  <IoInformationCircleOutline />
                  <p>
                    Trạng thái cọc chỉ được cập nhật sau khi nhà hàng xác nhận. Nếu bạn đã gửi bill mà chưa thấy cập nhật,
                    vui lòng nhắn lại qua Messenger.
                  </p>
                </div>

                <div className="takeaway-section takeaway-section--soft">
                  <h4>
                    <IoTimeOutline /> {statusContent.title}
                  </h4>
                  <p>{statusContent.message}</p>
                </div>

                <div className="takeaway-section">
                  <h4>
                    <IoCloseCircleOutline /> Hủy đơn hàng
                  </h4>
                  <p>
                    Bạn có thể hủy đơn nếu thay đổi kế hoạch. Nếu hủy trước 6 giờ kể từ thời gian nhận món dự kiến,
                    bạn sẽ được hoàn lại tiền cọc.
                  </p>
                  <button
                    type="button"
                    className="takeaway-danger-btn"
                    onClick={handleCancelOrder}
                    disabled={
                      isCancelling || selectedOrder.status === 'CANCELED' || selectedOrder.status === 'COMPLETED'
                    }
                  >
                    {isCancelling ? 'Đang hủy...' : 'Hủy đơn'}
                  </button>
                </div>

                {(selectedOrder.items || []).length > 0 && (
                  <div className="takeaway-items">
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
