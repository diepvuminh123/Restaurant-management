import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsCalendar3 } from 'react-icons/bs';
import { IoBagHandleOutline } from 'react-icons/io5';
import { LuUtensilsCrossed } from 'react-icons/lu';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import './EmployeeHome.css';

const quickActions = [
  {
    title: 'Đặt bàn cho khách',
    description: 'Tạo reservation mới, kiểm tra bàn trống và xử lý yêu cầu tại quầy.',
    to: '/employee/bookings',
    actionLabel: 'Mở đặt bàn',
    icon: <BsCalendar3 />,
  },
  {
    title: 'Tạo đơn mang đi',
    description: 'Lên đơn takeaway nhanh cho khách, cập nhật trạng thái và xác nhận cọc.',
    to: '/employee/takeaway',
    actionLabel: 'Mở đặt món',
    icon: <IoBagHandleOutline />,
  },
  {
    title: 'Cập nhật trạng thái món',
    description: 'Bật/tắt món đang phục vụ để bộ phận vận hành đồng bộ với khách hàng.',
    to: '/employee/menu',
    actionLabel: 'Mở thực đơn',
    icon: <LuUtensilsCrossed />,
  },
];

const toDateInputValue = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isSameDay = (value, targetDate) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  );
};

const formatTime = (value) => {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const reservationStateLabel = {
  CONFIRM: 'Đã xác nhận',
  ON_SERVING: 'Đang đón khách',
  COMPLETED: 'Đã hoàn tất',
  CANCELED: 'Đã hủy',
};

const takeawayStateLabel = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  COMPLETED: 'Đã xong',
  CANCELED: 'Đã hủy',
};

const FEED_PAGE_SIZE = 5;
const UPCOMING_WINDOW_MINUTES = 180;
const RECENT_GRACE_MINUTES = 30;

const normalizeState = (value) => String(value || '').trim().toUpperCase();

const isUpcomingWithinWindow = (value, now) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const diffMinutes = (date.getTime() - now.getTime()) / (1000 * 60);
  return diffMinutes >= -RECENT_GRACE_MINUTES && diffMinutes <= UPCOMING_WINDOW_MINUTES;
};

const isActiveReservation = (item) => !['COMPLETED', 'CANCELED', 'ON_SERVING'].includes(normalizeState(item?.reservation_state));

const isActiveTakeawayOrder = (item) => !['COMPLETED', 'CANCELED'].includes(normalizeState(item?.status));

const EmployeeHome = () => {
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [todayReservations, setTodayReservations] = useState([]);
  const [todayTakeawayOrders, setTodayTakeawayOrders] = useState([]);
  const [reservationPage, setReservationPage] = useState(1);
  const [takeawayPage, setTakeawayPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const fetchTodayData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const now = new Date();
        const yyyyMmDd = toDateInputValue(today);
        const from = `${yyyyMmDd}T00:00:00.000+07:00`;
        const to = `${yyyyMmDd}T23:59:59.999+07:00`;

        const [reservationResponse, takeawayResponse] = await Promise.all([
          ApiService.getReservationsForStaff({ limit: 100, offset: 0, state: 'CONFIRM', from, to }),
          ApiService.getTakeawayOrders({ limit: 100, page: 1 }),
        ]);

        if (cancelled) return;

        const reservations = Array.isArray(reservationResponse?.data)
          ? reservationResponse.data
              .filter((item) => isActiveReservation(item))
              .filter((item) => isUpcomingWithinWindow(item.reservation_time, now))
              .sort(
              (left, right) => new Date(left.reservation_time) - new Date(right.reservation_time)
              )
          : [];

        const takeawayOrders = Array.isArray(takeawayResponse?.data)
          ? takeawayResponse.data
              .filter((item) => isSameDay(item.pickup_time, today))
              .filter((item) => isActiveTakeawayOrder(item))
              .filter((item) => isUpcomingWithinWindow(item.pickup_time, now))
              .sort((left, right) => new Date(left.pickup_time) - new Date(right.pickup_time))
              .slice(0, 20)
          : [];

        setTodayReservations(reservations);
        setTodayTakeawayOrders(takeawayOrders);
        setReservationPage(1);
        setTakeawayPage(1);
      } catch (error) {
        if (cancelled) return;
        toast.error(error.message || 'Không thể tải dữ liệu hôm nay');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTodayData();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const reservationSummary = useMemo(() => {
    if (loading) return 'Đang tải lịch đặt bàn sắp đến giờ';
    return `${todayReservations.length} lịch đặt bàn sắp xử lý`;
  }, [loading, todayReservations.length]);

  const takeawaySummary = useMemo(() => {
    if (loading) return 'Đang tải đơn takeaway sắp đến giờ';
    return `${todayTakeawayOrders.length} đơn takeaway sắp xử lý`;
  }, [loading, todayTakeawayOrders.length]);

  const reservationTotalPages = Math.max(1, Math.ceil(todayReservations.length / FEED_PAGE_SIZE));
  const takeawayTotalPages = Math.max(1, Math.ceil(todayTakeawayOrders.length / FEED_PAGE_SIZE));

  const visibleReservations = useMemo(() => {
    const start = (reservationPage - 1) * FEED_PAGE_SIZE;
    return todayReservations.slice(start, start + FEED_PAGE_SIZE);
  }, [reservationPage, todayReservations]);

  const visibleTakeawayOrders = useMemo(() => {
    const start = (takeawayPage - 1) * FEED_PAGE_SIZE;
    return todayTakeawayOrders.slice(start, start + FEED_PAGE_SIZE);
  }, [takeawayPage, todayTakeawayOrders]);

  useEffect(() => {
    setReservationPage((currentPage) => Math.min(currentPage, reservationTotalPages));
  }, [reservationTotalPages]);

  useEffect(() => {
    setTakeawayPage((currentPage) => Math.min(currentPage, takeawayTotalPages));
  }, [takeawayTotalPages]);

  let reservationFeedContent = <p className="employee-home__empty">Đang tải...</p>;

  if (!loading && todayReservations.length > 0) {
    reservationFeedContent = visibleReservations.map((item) => (
      <article key={item.reservation_id} className="employee-home__feed-item">
        <div className="employee-home__feed-time">{formatTime(item.reservation_time)}</div>
        <div className="employee-home__feed-content">
          <h3>{item.customer_name || `Reservation #${item.reservation_id}`}</h3>
          <p>
            Bàn {item.table_id} · {item.number_of_guests} khách
          </p>
        </div>
        <span className="employee-home__feed-status">
          {reservationStateLabel[item.reservation_state] || item.reservation_state}
        </span>
      </article>
    ));
  } else if (!loading) {
    reservationFeedContent = <p className="employee-home__empty">Hiện chưa có lịch đặt bàn nào sắp đến giờ.</p>;
  }

  let takeawayFeedContent = <p className="employee-home__empty">Đang tải...</p>;

  if (!loading && todayTakeawayOrders.length > 0) {
    takeawayFeedContent = visibleTakeawayOrders.map((item) => (
      <article key={item.id} className="employee-home__feed-item">
        <div className="employee-home__feed-time">{formatTime(item.pickup_time)}</div>
        <div className="employee-home__feed-content">
          <h3>{item.customer_name || item.order_code || `Order #${item.id}`}</h3>
          <p>{item.order_code || item.customer_phone || 'Takeaway order'}</p>
        </div>
        <span className="employee-home__feed-status">
          {takeawayStateLabel[item.status] || item.status}
        </span>
      </article>
    ));
  } else if (!loading) {
    takeawayFeedContent = <p className="employee-home__empty">Hiện chưa có đơn takeaway nào sắp đến giờ.</p>;
  }

  return (
    <section className="employee-home">
      <div className="employee-home__grid employee-home__grid--actions">
        {quickActions.map((item) => (
          <article key={item.to} className="employee-home__card">
            <div className="employee-home__icon">{item.icon}</div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link className="employee-home__link" to={item.to}>
              {item.actionLabel}
            </Link>
          </article>
        ))}
      </div>

      <div className="employee-home__panels">
        <section className="employee-home__panel">
          <div className="employee-home__panel-header">
            <div>
              <p className="employee-home__panel-eyebrow">Hôm nay</p>
              <h2>Đặt bàn sắp tới</h2>
            </div>
            <span className="employee-home__panel-summary">{reservationSummary}</span>
          </div>

          <div className="employee-home__feed">
            {reservationFeedContent}
          </div>

          {!loading && todayReservations.length > FEED_PAGE_SIZE ? (
            <div className="employee-home__pagination">
              <button
                type="button"
                className="employee-home__page-button"
                onClick={() => setReservationPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={reservationPage === 1}
              >
                Trước
              </button>
              <span className="employee-home__page-indicator">
                Trang {reservationPage}/{reservationTotalPages}
              </span>
              <button
                type="button"
                className="employee-home__page-button"
                onClick={() => setReservationPage((currentPage) => Math.min(reservationTotalPages, currentPage + 1))}
                disabled={reservationPage === reservationTotalPages}
              >
                Sau
              </button>
            </div>
          ) : null}
        </section>

        <section className="employee-home__panel">
          <div className="employee-home__panel-header">
            <div>
              <p className="employee-home__panel-eyebrow">Hôm nay</p>
              <h2>Takeaway sắp tới</h2>
            </div>
            <span className="employee-home__panel-summary">{takeawaySummary}</span>
          </div>

          <div className="employee-home__feed">
            {takeawayFeedContent}
          </div>

          {!loading && todayTakeawayOrders.length > FEED_PAGE_SIZE ? (
            <div className="employee-home__pagination">
              <button
                type="button"
                className="employee-home__page-button"
                onClick={() => setTakeawayPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={takeawayPage === 1}
              >
                Trước
              </button>
              <span className="employee-home__page-indicator">
                Trang {takeawayPage}/{takeawayTotalPages}
              </span>
              <button
                type="button"
                className="employee-home__page-button"
                onClick={() => setTakeawayPage((currentPage) => Math.min(takeawayTotalPages, currentPage + 1))}
                disabled={takeawayPage === takeawayTotalPages}
              >
                Sau
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
};

export default EmployeeHome;