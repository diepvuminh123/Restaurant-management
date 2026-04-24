import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReservationForm from '../../component/ReservationForm/ReservationForm';
import BookingScreenHeader from './BookingScreenHeader';
import { useToastContext } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/apiService';
import { useTranslation } from 'react-i18next';
import './BookingScreen.css';

const getDisabledReasonLabel = (reason, t) => {
  const m = {
    OCCUPIED: t('booking.tables.disabledReasons.occupied'),
    RESERVED: t('booking.tables.disabledReasons.reserved'),
    CAPACITY: t('booking.tables.disabledReasons.capacity'),
    TIME_CONFLICT: t('booking.tables.disabledReasons.timeConflict'),
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
  const { t } = useTranslation();

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
          toast.error(err?.message || t('booking.tables.loadError'));
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
      toast.warning(t('booking.tables.selectRequired'));
      return;
    }
    const tableId = Number(selectedTable.table_id);
    if (!Number.isFinite(tableId)) {
      toast.error(t('booking.tables.invalidTable'));
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
      toast.error(err?.message || t('booking.submitFailed'));
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
              <h3 className="inline-map-panel__title">{t('booking.tables.title')}</h3>
              <p className="inline-map-panel__sub">
                {hasParams
                  ? t('booking.tables.subtitleReady')
                  : t('booking.tables.subtitleEmpty')}
              </p>

              {!hasParams && (
                <div className="inline-map-panel__placeholder">
                  <span className="inline-map-panel__icon">🪑</span>
                  <p>{t('booking.tables.noParams')}</p>
                </div>
              )}

              {hasParams && loadingTables && (
                <div className="inline-map-panel__status">{t('booking.tables.loading')}</div>
              )}

              {hasParams && !loadingTables && tables.length === 0 && (
                <div className="inline-map-panel__status">{t('booking.tables.empty')}</div>
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
                          : (getDisabledReasonLabel(table.disabled_reason, t) || t('booking.tables.unavailable'))
                      }
                    >
                      <span className="booking-table-box__id">{table.id}</span>
                      <span className="booking-table-box__seats">{t('booking.tables.seatCount', { count: table.seats })}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedTable && (
                <div className="inline-map-panel__selection">
                  {t('booking.tables.selectedSummary', { id: selectedTable.id, seats: selectedTable.seats })}
                </div>
              )}

              <div className="inline-map-panel__legend">
                <span><span className="bdot available" /> {t('booking.tables.legend.available')}</span>
                <span><span className="bdot selected" /> {t('booking.tables.legend.selected')}</span>
                <span><span className="bdot booked" /> {t('booking.tables.legend.booked')}</span>
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