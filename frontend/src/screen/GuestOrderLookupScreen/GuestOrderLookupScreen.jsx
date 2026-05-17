import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  IoSearchOutline,
  IoCloseOutline,
  IoCopyOutline,
  IoCardOutline,
  IoBusiness,
  IoLogoUsd,
  IoChatbubbleEllipsesOutline,
  IoInformationCircleOutline 
} from "react-icons/io5";
import ApiService from "../../services/apiService";
import useOrderSSE from "../../hooks/useOrderSSE";
import "./GuestOrderLookupScreen.css";
import BackButton from "../../component/BackButton/BackButton";
import { useTranslation } from 'react-i18next';
import zaloQR from "../../picture/zalo.jpg";

const getStatusLabelMap = (t) => ({
  PENDING: t('orderLookup.status.pending'),
  CONFIRMED: t('orderLookup.status.confirmed'),
  PREPARING: t('orderLookup.status.preparing'),
  READY: t('orderLookup.status.ready'),
  COMPLETED: t('orderLookup.status.completed'),
  CANCELED: t('orderLookup.status.canceled'),
});

const STATUS_BADGE_MAP = {
  PENDING: "status-pending",
  CONFIRMED: "status-confirmed",
  PREPARING: "status-preparing",
  READY: "status-ready",
  COMPLETED: "status-completed",
  CANCELED: "status-canceled",
};

const NOTE_PAYMENT_TAG_REGEX = /^\[PAYMENT_METHOD:[^\]]+\]\s*/;

const formatCurrency = (amount, locale) => Number(amount || 0).toLocaleString(locale);

const formatDateTime = (value, locale) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const GuestOrderLookupScreen = () => {
  const { t, i18n } = useTranslation();
  const statusLabelMap = getStatusLabelMap(t);
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const [searchParams] = useSearchParams();
  const PAGE_LIMIT = 10;

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalPaymentMethod, setModalPaymentMethod] = useState('zalopay');
  const [copiedField, setCopiedField] = useState('');
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState({
    limit: PAGE_LIMIT,
    offset: 0,
    total: 0,
    hasNext: false,
  });

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // SSE Real-time updates
  useOrderSSE({
    onStatusUpdate: (data) => {
      // Cập nhật đơn hàng trong danh sách nếu khớp ID
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === data.id ? { ...order, ...data } : order)
      );
    }
  });

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const onFieldChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const performLookup = async (nextOffset = 0) => {
    setHasSearched(true);
    setErrorText("");

    const payload = {
      order_code: filters.order_code.trim(),
      customer_phone: filters.customer_phone.trim(),
      customer_email: filters.customer_email.trim(),
      limit: PAGE_LIMIT,
      offset: nextOffset,
    };

    // Bắt lỗi ở client trước để phản hồi nhanh hơn cho khách.
    if (
      !payload.order_code &&
      !payload.customer_phone &&
      !payload.customer_email
    ) {
      setOrders([]);
      setSelectedOrderId(null);
      setPagination((prev) => ({
        ...prev,
        offset: 0,
        total: 0,
        hasNext: false,
      }));
      setOffset(0);
      setErrorText(
        t('orderLookup.validation.required'),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.lookupGuestOrders(payload);
      const nextOrders = response.data || [];
      const nextPagination = response.pagination || {
        limit: PAGE_LIMIT,
        offset: nextOffset,
        total: nextOrders.length,
        hasNext: false,
      };

      setOrders(nextOrders);
      setOffset(nextPagination.offset || 0);
      setPagination(nextPagination);
      setSelectedOrderId(nextOrders.length > 0 ? nextOrders[0].id : null);
    } catch (error) {
      setOrders([]);
      setSelectedOrderId(null);
      setPagination((prev) => ({
        ...prev,
        offset: 0,
        total: 0,
        hasNext: false,
      }));
      setOffset(0);
      setErrorText(
        error.message || t('orderLookup.lookupFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async (event) => {
    event.preventDefault();
    await performLookup(0);
  };

  const onNextPage = async () => {
    if (loading || !pagination.hasNext) {
      return;
    }

    await performLookup(offset + PAGE_LIMIT);
  };

  const onPrevPage = async () => {
    if (loading || offset <= 0) {
      return;
    }

    await performLookup(Math.max(0, offset - PAGE_LIMIT));
  };

  useEffect(() => {
    // Auto lookup nếu có sẵn query param từ màn checkout.
    if (
      filters.order_code ||
      filters.customer_phone ||
      filters.customer_email
    ) {
      performLookup(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="guest-order-lookup">
      <div className="back-btn-container">
        <BackButton />
      </div>

      <div className="guest-order-lookup__hero">
        <h1>{t('orderLookup.hero.title')}</h1>
        <p>
          {t('orderLookup.hero.subtitle')}
        </p>
      </div>

      <form className="lookup-form" onSubmit={onSearch}>
        <div className="lookup-form__row">
          <label htmlFor="lookup-order-code">{t('orderLookup.form.orderCode')}</label>
          <input
            id="lookup-order-code"
            type="text"
            value={filters.order_code}
            onChange={(e) => onFieldChange("order_code", e.target.value)}
            placeholder={t('orderLookup.form.orderCodePlaceholder')}
          />
        </div>

        <div className="lookup-form__row lookup-form__row--split">
          <div>
            <label htmlFor="lookup-phone">{t('orderLookup.form.phone')}</label>
            <input
              id="lookup-phone"
              type="text"
              value={filters.customer_phone}
              onChange={(e) => onFieldChange("customer_phone", e.target.value)}
              placeholder={t('orderLookup.form.phonePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="lookup-email">{t('orderLookup.form.email')}</label>
            <input
              id="lookup-email"
              type="email"
              value={filters.customer_email}
              onChange={(e) => onFieldChange("customer_email", e.target.value)}
              placeholder={t('orderLookup.form.emailPlaceholder')}
            />
          </div>
        </div>

        <button
          type="submit"
          className="lookup-form__submit"
          disabled={loading}
        >
          <IoSearchOutline />
          {loading ? t('orderLookup.form.searching') : t('orderLookup.form.submit')}
        </button>
      </form>

      {errorText && <p className="lookup-error">{errorText}</p>}

      {hasSearched && !loading && orders.length === 0 && !errorText && (
        <p className="lookup-empty">
          {t('orderLookup.empty')}
        </p>
      )}

      {orders.length > 0 && (
        <div className="lookup-result-layout">
          <section className="lookup-order-list">
            <h2>{t('orderLookup.resultsTitle')}</h2>
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
                    {statusLabelMap[order.status] || order.status}
                  </span>
                </div>
                <p>{t('orderLookup.labels.customer')}: {order.customer_name}</p>
                <p>{t('orderLookup.labels.pickupTime')}: {formatDateTime(order.pickup_time, locale)}</p>
              </button>
            ))}
          </section>

          <section className="lookup-order-detail">
            {selectedOrder && (
              <>
                <h2>{t('orderLookup.detailTitle')}</h2>

                <div className="detail-grid">
                  <span>{t('orderLookup.labels.orderCode')}:</span>
                  <strong>{selectedOrder.order_code}</strong>

                  <span>{t('orderLookup.labels.status')}:</span>
                  <strong>
                    {statusLabelMap[selectedOrder.status] ||
                      selectedOrder.status}
                  </strong>

                  <span>{t('orderLookup.labels.pickupTime')}:</span>
                  <strong>{formatDateTime(selectedOrder.pickup_time, locale)}</strong>

                  <span>{t('orderLookup.labels.totalAmount')}:</span>
                  <strong>{formatCurrency(selectedOrder.final_amount, locale)}đ</strong>

                  <span>{t('orderLookup.labels.depositAmount')}:</span>
                  <strong>
                    {formatCurrency(selectedOrder.deposit_amount, locale)}đ
                  </strong>

                  <span>{locale === 'en' ? 'Deposit Status:' : 'Trạng thái cọc:'}</span>
                  <strong className={`payment-status-badge ${selectedOrder.payment_status === 'DEPOSIT_PAID' || selectedOrder.payment_status === 'PAID' ? 'is-paid' : 'is-unpaid'}`}>
                    {selectedOrder.payment_status === 'UNPAID' && (locale === 'en' ? 'Unpaid' : 'Chưa cọc')}
                    {selectedOrder.payment_status === 'DEPOSIT_PAID' && (locale === 'en' ? 'Deposit Paid' : 'Đã cọc')}
                    {selectedOrder.payment_status === 'PAID' && (locale === 'en' ? 'Fully Paid' : 'Đã thanh toán')}
                    {selectedOrder.payment_status === 'REFUNDED' && (locale === 'en' ? 'Refunded' : 'Đã hoàn cọc')}
                  </strong>
                </div>

                {selectedOrder.payment_status === 'UNPAID' && selectedOrder.status !== 'CANCELED' && (
                  <div className="lookup-deposit-box">
                    <h4>
                      {locale === 'en' ? 'Deposit Payment Required' : 'Yêu cầu thanh toán cọc'}
                    </h4>
                    <p>
                      {locale === 'en' 
                        ? `This order requires a 50% deposit (${formatCurrency(selectedOrder.deposit_amount, locale)}đ). After transferring, please send a screenshot of the transaction via Messenger for confirmation.`
                        : `Đơn hàng này yêu cầu cọc trước 50% giá trị (${formatCurrency(selectedOrder.deposit_amount, locale)}đ). Sau khi chuyển khoản, vui lòng gửi ảnh bill qua Messenger để nhà hàng xác nhận.`}
                    </p>
                    <button
                      type="button"
                      className="btn-pay-deposit"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      {locale === 'en' ? 'Proceed with Deposit' : 'Tiến hành cọc'}
                    </button>
                  </div>
                )}

                <div className="detail-items">
                  <h3>{t('orderLookup.itemsTitle')}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>{t('orderLookup.table.item')}</th>
                        <th>{t('orderLookup.table.quantity')}</th>
                        <th>{t('orderLookup.table.unitPrice')}</th>
                        <th>{t('orderLookup.table.lineTotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.item_name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unit_price, locale)}đ</td>
                          <td>{formatCurrency(item.line_total, locale)}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedOrder.note && (
                  <div className="detail-note">
                    <h3>{t('orderLookup.noteTitle')}</h3>
                    <p>
                      {selectedOrder.note.replace(NOTE_PAYMENT_TAG_REGEX, "") ||
                        t('orderLookup.emptyNote')}
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {showPaymentModal && selectedOrder && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>{locale === 'en' ? 'Deposit Payment 50%' : 'Thanh toán cọc 50%'}</h3>
              <button type="button" className="payment-modal-close" onClick={() => setShowPaymentModal(false)}>
                <IoCloseOutline />
              </button>
            </div>
            
            <div className="payment-modal-body">
              <div className="payment-modal-summary">
                <div className="modal-summary-row">
                  <span>{locale === 'en' ? 'Order Code:' : 'Mã đơn hàng:'}</span>
                  <strong>{selectedOrder.order_code || `#${selectedOrder.id}`}</strong>
                </div>
                <div className="modal-summary-row">
                  <span>{locale === 'en' ? 'Total Amount:' : 'Tổng tiền đơn:'}</span>
                  <span>{formatCurrency(selectedOrder.final_amount, locale)}đ</span>
                </div>
                <div className="modal-summary-row highlight">
                  <span>{locale === 'en' ? 'Deposit Required (50%):' : 'Số tiền cần cọc (50%):'}</span>
                  <strong className="modal-deposit-amount">{formatCurrency(selectedOrder.deposit_amount, locale)}đ</strong>
                </div>
              </div>

              <div className="modal-payment-methods">
                <h4>{locale === 'en' ? 'Select Payment Method' : 'Chọn phương thức thanh toán'}</h4>
                <div className="modal-payment-options">
                  <button
                    type="button"
                    className={`modal-payment-option ${modalPaymentMethod === 'zalopay' ? 'active' : ''}`}
                    onClick={() => setModalPaymentMethod('zalopay')}
                  >
                    <IoCardOutline />
                    <span>ZaloPay</span>
                  </button>
                  <button
                    type="button"
                    className={`modal-payment-option ${modalPaymentMethod === 'acb' ? 'active' : ''}`}
                    onClick={() => setModalPaymentMethod('acb')}
                  >
                    <IoBusiness />
                    <span>Ngân hàng ACB</span>
                  </button>
                  <button
                    type="button"
                    className={`modal-payment-option ${modalPaymentMethod === 'vietcombank' ? 'active' : ''}`}
                    onClick={() => setModalPaymentMethod('vietcombank')}
                  >
                    <IoLogoUsd />
                    <span>Vietcombank</span>
                  </button>
                </div>
              </div>

              <div className="modal-payment-details">
                <div className="modal-payment-info-box">
                  {modalPaymentMethod === 'zalopay' && (
                    <>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Wallet:' : 'Ví điện tử:'}</span>
                        <strong>ZaloPay</strong>
                      </div>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Phone Number:' : 'Số điện thoại:'}</span>
                        <div className="copyable-value">
                          <strong>0915728661</strong>
                          <button 
                            type="button"
                            className="btn-copy" 
                            onClick={() => handleCopy('0915728661', 'phone')}
                          >
                            <IoCopyOutline /> {copiedField === 'phone' ? (locale === 'en' ? 'Copied' : 'Đã chép') : (locale === 'en' ? 'Copy' : 'Sao chép')}
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Account Holder:' : 'Chủ tài khoản:'}</span>
                        <strong>DIEP VU MINH</strong>
                      </div>
                    </>
                  )}

                  {modalPaymentMethod === 'acb' && (
                    <>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Bank:' : 'Ngân hàng:'}</span>
                        <strong>ACB (Ngân hàng TMCP Á Châu)</strong>
                      </div>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Account Number:' : 'Số tài khoản:'}</span>
                        <div className="copyable-value">
                          <strong>10427847</strong>
                          <button 
                            type="button"
                            className="btn-copy" 
                            onClick={() => handleCopy('10427847', 'account')}
                          >
                            <IoCopyOutline /> {copiedField === 'account' ? (locale === 'en' ? 'Copied' : 'Đã chép') : (locale === 'en' ? 'Copy' : 'Sao chép')}
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Account Holder:' : 'Chủ tài khoản:'}</span>
                        <strong>DIEP VU MINH</strong>
                      </div>
                    </>
                  )}

                  {modalPaymentMethod === 'vietcombank' && (
                    <>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Bank:' : 'Ngân hàng:'}</span>
                        <strong>Vietcombank (Ngoại thương VN)</strong>
                      </div>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Account Number:' : 'Số tài khoản:'}</span>
                        <div className="copyable-value">
                          <strong>10182749372</strong>
                          <button 
                            type="button"
                            className="btn-copy" 
                            onClick={() => handleCopy('10182749372', 'account')}
                          >
                            <IoCopyOutline /> {copiedField === 'account' ? (locale === 'en' ? 'Copied' : 'Đã chép') : (locale === 'en' ? 'Copy' : 'Sao chép')}
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>{locale === 'en' ? 'Account Holder:' : 'Chủ tài khoản:'}</span>
                        <strong>DIEP VU MINH</strong>
                      </div>
                    </>
                  )}

                  <div className="info-row">
                    <span>{locale === 'en' ? 'Deposit Amount:' : 'Số tiền cọc:'}</span>
                    <div className="copyable-value">
                      <strong>{formatCurrency(selectedOrder.deposit_amount, locale)}đ</strong>
                      <button 
                        type="button"
                        className="btn-copy" 
                        onClick={() => handleCopy(selectedOrder.deposit_amount.toString(), 'amount')}
                      >
                        <IoCopyOutline /> {copiedField === 'amount' ? (locale === 'en' ? 'Copied' : 'Đã chép') : (locale === 'en' ? 'Copy' : 'Sao chép')}
                      </button>
                    </div>
                  </div>

                  <div className="info-row">
                    <span>{locale === 'en' ? 'Transfer Note:' : 'Nội dung CK:'}</span>
                    <div className="copyable-value">
                      <strong>{`${selectedOrder.order_code || `#${selectedOrder.id}`} ${selectedOrder.customer_phone || ''}`.trim()}</strong>
                      <button 
                        type="button"
                        className="btn-copy" 
                        onClick={() => handleCopy(`${selectedOrder.order_code || `#${selectedOrder.id}`} ${selectedOrder.customer_phone || ''}`.trim(), 'content')}
                      >
                        <IoCopyOutline /> {copiedField === 'content' ? (locale === 'en' ? 'Copied' : 'Đã chép') : (locale === 'en' ? 'Copy' : 'Sao chép')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-qr-container">
                  <div className="modal-qr-placeholder">
                    <img src={zaloQR} alt="QR Code" />
                  </div>
                  <p className="qr-guide-text">{locale === 'en' ? 'Scan QR Code for fast payment' : 'Quét mã QR để chuyển khoản nhanh chóng'}</p>
                </div>
              </div>

              <div className="modal-payment-instructions">
                <IoInformationCircleOutline />
                <p>
                  {locale === 'en'
                    ? "After successful transfer, please screenshot the transaction and send it via Messenger for the restaurant to confirm your deposit as soon as possible."
                    : "Sau khi chuyển khoản thành công, vui lòng chụp màn hình giao dịch và gửi qua Messenger để nhà hàng đối chiếu và xác nhận trạng thái cọc sớm nhất."}
                </p>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button 
                type="button" 
                className="modal-messenger-btn"
                onClick={() => {
                  window.open('https://m.me/yourpage', '_blank');
                }}
              >
                <IoChatbubbleEllipsesOutline />
                <span>{locale === 'en' ? 'Send bill via Messenger' : 'Gửi bill qua Messenger'}</span>
              </button>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                {locale === 'en' ? 'Close' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {hasSearched && !loading && (orders.length > 0 || pagination.total > 0) && (
        <div className="lookup-pagination">
          <button
            type="button"
            className="lookup-pagination__btn"
            onClick={onPrevPage}
            disabled={offset <= 0 || loading}
          >
            {t('orderLookup.pagination.prev')}
          </button>

          <span className="lookup-pagination__meta">
            {t('orderLookup.pagination.showing', {
              start: pagination.total === 0 ? 0 : offset + 1,
              end: Math.min(offset + orders.length, pagination.total),
              total: pagination.total,
            })}
          </span>

          <button
            type="button"
            className="lookup-pagination__btn"
            onClick={onNextPage}
            disabled={!pagination.hasNext || loading}
          >
            {t('orderLookup.pagination.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestOrderLookupScreen;
