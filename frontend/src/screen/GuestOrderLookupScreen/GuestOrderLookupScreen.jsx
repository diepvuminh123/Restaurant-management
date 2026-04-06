import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import ApiService from "../../services/apiService";
import "./GuestOrderLookupScreen.css";
import BackButton from "../../component/BackButton/BackButton";

const STATUS_LABEL_MAP = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng để lấy",
  COMPLETED: "Đã hoàn tất",
  CANCELED: "Đã hủy",
};

const STATUS_BADGE_MAP = {
  PENDING: "status-pending",
  CONFIRMED: "status-confirmed",
  PREPARING: "status-preparing",
  READY: "status-ready",
  COMPLETED: "status-completed",
  CANCELED: "status-canceled",
};

const NOTE_PAYMENT_TAG_REGEX = /^\[PAYMENT_METHOD:[^\]]+\]\s*/;

const formatCurrency = (amount) => Number(amount || 0).toLocaleString("vi-VN");

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const GuestOrderLookupScreen = () => {
  const [searchParams] = useSearchParams();

  // Đọc giá trị từ URL để khách vừa đặt xong có thể tra cứu ngay.
  const [filters, setFilters] = useState({
    order_code: searchParams.get("order_code") || "",
    customer_phone: searchParams.get("customer_phone") || "",
    customer_email: searchParams.get("customer_email") || "",
  });

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const onFieldChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const onSearch = async (event) => {
    event.preventDefault();
    setHasSearched(true);
    setErrorText("");

    const payload = {
      order_code: filters.order_code.trim(),
      customer_phone: filters.customer_phone.trim(),
      customer_email: filters.customer_email.trim(),
      limit: 10,
    };

    // Bắt lỗi ở client trước để phản hồi nhanh hơn cho khách.
    if (
      !payload.order_code &&
      !payload.customer_phone &&
      !payload.customer_email
    ) {
      setOrders([]);
      setSelectedOrderId(null);
      setErrorText(
        "Vui lòng nhập mã đơn hàng hoặc số điện thoại hoặc email để tra cứu.",
      );
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.lookupGuestOrders(payload);
      const nextOrders = response.data || [];

      setOrders(nextOrders);
      setSelectedOrderId(nextOrders.length > 0 ? nextOrders[0].id : null);
    } catch (error) {
      setOrders([]);
      setSelectedOrderId(null);
      setErrorText(
        error.message || "Không thể tra cứu đơn hàng, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto lookup nếu có sẵn query param từ màn checkout.
    if (
      filters.order_code ||
      filters.customer_phone ||
      filters.customer_email
    ) {
      const formLikeEvent = { preventDefault: () => {} };
      onSearch(formLikeEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="guest-order-lookup">
      <div className="back-btn-container">
        <BackButton />
      </div>

      <div className="guest-order-lookup__hero">
        <h1>Theo dõi đơn mang về</h1>
        <p>
          Không cần đăng nhập. Nhập một trong các thông tin bên dưới để xem
          trạng thái đơn của bạn.
        </p>
      </div>

      <form className="lookup-form" onSubmit={onSearch}>
        <div className="lookup-form__row">
          <label htmlFor="lookup-order-code">Mã đơn hàng</label>
          <input
            id="lookup-order-code"
            type="text"
            value={filters.order_code}
            onChange={(e) => onFieldChange("order_code", e.target.value)}
            placeholder="Ví dụ: ORD-20260406-000123"
          />
        </div>

        <div className="lookup-form__row lookup-form__row--split">
          <div>
            <label htmlFor="lookup-phone">Số điện thoại</label>
            <input
              id="lookup-phone"
              type="text"
              value={filters.customer_phone}
              onChange={(e) => onFieldChange("customer_phone", e.target.value)}
              placeholder="Ví dụ: 0912345678"
            />
          </div>

          <div>
            <label htmlFor="lookup-email">Email</label>
            <input
              id="lookup-email"
              type="email"
              value={filters.customer_email}
              onChange={(e) => onFieldChange("customer_email", e.target.value)}
              placeholder="Ví dụ: customer@email.com"
            />
          </div>
        </div>

        <button
          type="submit"
          className="lookup-form__submit"
          disabled={loading}
        >
          <IoSearchOutline />
          {loading ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
        </button>
      </form>

      {errorText && <p className="lookup-error">{errorText}</p>}

      {hasSearched && !loading && orders.length === 0 && !errorText && (
        <p className="lookup-empty">
          Không tìm thấy đơn phù hợp với thông tin đã nhập.
        </p>
      )}

      {orders.length > 0 && (
        <div className="lookup-result-layout">
          <section className="lookup-order-list">
            <h2>Đơn đã tìm thấy</h2>
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`lookup-order-card ${selectedOrderId === order.id ? "lookup-order-card--active" : ""}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="lookup-order-card__line">
                  <strong>{order.order_code}</strong>
                  <span
                    className={`lookup-status ${STATUS_BADGE_MAP[order.status] || "status-pending"}`}
                  >
                    {STATUS_LABEL_MAP[order.status] || order.status}
                  </span>
                </div>
                <p>Khách: {order.customer_name}</p>
                <p>Nhận món: {formatDateTime(order.pickup_time)}</p>
              </button>
            ))}
          </section>

          <section className="lookup-order-detail">
            {selectedOrder && (
              <>
                <h2>Chi tiết đơn</h2>

                <div className="detail-grid">
                  <span>Mã đơn:</span>
                  <strong>{selectedOrder.order_code}</strong>

                  <span>Trạng thái:</span>
                  <strong>
                    {STATUS_LABEL_MAP[selectedOrder.status] ||
                      selectedOrder.status}
                  </strong>

                  <span>Thời gian nhận:</span>
                  <strong>{formatDateTime(selectedOrder.pickup_time)}</strong>

                  <span>Tổng tiền:</span>
                  <strong>{formatCurrency(selectedOrder.final_amount)}đ</strong>

                  <span>Tiền cọc:</span>
                  <strong>
                    {formatCurrency(selectedOrder.deposit_amount)}đ
                  </strong>
                </div>

                <div className="detail-items">
                  <h3>Món trong đơn</h3>
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
                  <div className="detail-note">
                    <h3>Ghi chú</h3>
                    <p>
                      {selectedOrder.note.replace(NOTE_PAYMENT_TAG_REGEX, "") ||
                        "(Không có ghi chú)"}
                    </p>
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

export default GuestOrderLookupScreen;
