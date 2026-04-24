import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import ApiService from "../../services/apiService";
import "./GuestOrderLookupScreen.css";
import BackButton from "../../component/BackButton/BackButton";
import { useTranslation } from 'react-i18next';

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
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState({
    limit: PAGE_LIMIT,
    offset: 0,
    total: 0,
    hasNext: false,
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
                </div>

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
