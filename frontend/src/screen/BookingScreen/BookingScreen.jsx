import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReservationForm from '../../component/ReservationForm/ReservationForm';
import BookingScreenHeader from './BookingScreenHeader';
import { useToastContext } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/apiService';
import './BookingScreen.css';

const getDisabledReasonLabel = (reason) => {
  const m = {
    OCCUPIED: 'Đang có khách',
    RESERVED: 'Đã được giữ',
    CAPACITY: 'Không đủ chỗ',
    TIME_CONFLICT: 'Trùng thời gian',
  };
  return m[reason] || null;
};

const mapTables = (apiTables) =>
  (apiTables || []).map((row) => {
    const num = Number(row.table_id);
    const label = Number.isFinite(num)
      ? `B${String(num).padStart(2, '0')}`
      : String(row.table_id);
    return {
      ...row,
      id: label,
      seats: row.capacity,
      status: row.selectable ? 'available' : 'booked',
    };
  });

const keepSelection = (prev, mapped) => {
  if (!prev) return null;
  const match = mapped.find((t) => t.table_id === prev.table_id);
  return match?.selectable ? match : null;
};

const BookingScreen = ({ user }) => {
  const toast = useToastContext();
  const navigate = useNavigate();

  const [formParams, setFormParams] = useState({ date: '', time: '', guests: 0 });
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { date, time, guests } = formParams;
    if (!date || !time || !guests) {
      setTables([]);
      setSelectedTable(null);
      return;
    }
    let cancelled = false;

    const fetchTables = async () => {
      setLoadingTables(true);
      try {
        const res = await ApiService.getTablesAvailability({ date, time, guests });
        const mapped = mapTables(res?.data?.tables || []);
        if (!cancelled) {
          setTables(mapped);
          setSelectedTable((prev) => keepSelection(prev, mapped));
        }
      } catch (err) {
        if (!cancelled) {
          setTables([]);
          setSelectedTable(null);
          toast.error(err?.message || 'Không thể tải danh sách bàn');
        }
      } finally {
        if (!cancelled) setLoadingTables(false);
      }
    };

    fetchTables();
    return () => { cancelled = true; };
  }, [formParams.date, formParams.time, formParams.guests, toast]);

  const handleFormContinue = async (data) => {
    if (!selectedTable) {
      toast.warning('Vui lòng chọn một bàn ở bên phải trước khi đặt.');
      return;
    }
    const tableId = Number(selectedTable.table_id);
    if (!Number.isFinite(tableId)) {
      toast.error('Không xác định được bàn, vui lòng thử lại.');
      return;
    }
    setSubmitting(true);
    try {
      await ApiService.createReservation({
        reservation_time: `${data.date}T${data.time}:00`,
        number_of_guests: Number(data.guests),
        table_id: tableId,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_email: data.customerEmail,
      });
      navigate('/reservation-success', {
        state: {
          selectedTable,
          dayReservation: data.date,
          timeReservation: data.time,
          guestCount: Number(data.guests),
        },
      });
    } catch (err) {
      toast.error(err?.message || 'Đặt bàn thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasParams = Boolean(formParams.date && formParams.time && formParams.guests);

  return (
    <>
      <BookingScreenHeader />
      <div className="BookingScreen">
        <div className="booking-split-layout">

          {/* Trái: Form đặt bàn */}
          <div className="booking-split-layout__form">
            <ReservationForm
              user={user}
              onParamsChange={setFormParams}
              onContinue={handleFormContinue}
              submitting={submitting}
            />
          </div>

          {/* Phải: Sơ đồ bàn */}
          <div className="booking-split-layout__map">
            <div className="inline-map-panel">
              <h3 className="inline-map-panel__title">Sơ đồ bàn</h3>
              <p className="inline-map-panel__sub">
                {hasParams
                  ? 'Chọn bàn phù hợp với yêu cầu của bạn'
                  : 'Điền thông tin bên trái để xem bàn trống'}
              </p>

              {!hasParams && (
                <div className="inline-map-panel__placeholder">
                  <span className="inline-map-panel__icon">🪑</span>
                  <p>Chưa có thông tin đặt bàn</p>
                </div>
              )}

              {hasParams && loadingTables && (
                <div className="inline-map-panel__status">Đang tải danh sách bàn...</div>
              )}

              {hasParams && !loadingTables && tables.length === 0 && (
                <div className="inline-map-panel__status">Không có bàn trống cho thời gian này</div>
              )}

              {hasParams && !loadingTables && tables.length > 0 && (
                <div className="booking-table-grid">
                  {tables.map((table) => (
                    <button
                      key={table.table_id ?? table.id}
                      type="button"
                      className={`booking-table-box ${table.status}${selectedTable?.id === table.id ? ' selected' : ''}`}
                      onClick={() =>
                        setSelectedTable((prev) => (prev?.id === table.id ? null : table))
                      }
                      disabled={table.status !== 'available'}
                      title={
                        table.status === 'available'
                          ? undefined
                          : (getDisabledReasonLabel(table.disabled_reason) || 'Không khả dụng')
                      }
                    >
                      <span className="booking-table-box__id">{table.id}</span>
                      <span className="booking-table-box__seats">{table.seats} ghế</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedTable && (
                <div className="inline-map-panel__selection">
                  ✓ {selectedTable.id} &middot; {selectedTable.seats} ghế đã chọn
                </div>
              )}

              <div className="inline-map-panel__legend">
                <span><span className="bdot available" /> Trống</span>
                <span><span className="bdot selected" /> Đã chọn</span>
                <span><span className="bdot booked" /> Đã đặt</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

BookingScreen.propTypes = {
  user: PropTypes.object,
};

export default BookingScreen;