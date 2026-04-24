import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CiCalendar } from "react-icons/ci";
import { FiClock } from "react-icons/fi"; 
import { IoPeopleSharp } from "react-icons/io5";
import { useToastContext } from '../../context/ToastContext';
import ApiService from '../../services/apiService';
import { useTranslation } from 'react-i18next';
import './TableMapScreen.css';

const getDisabledReasonLabel = (reason, t) => {
  switch (reason) {
    case 'OCCUPIED':
      return t('tableMap.disabledReasons.occupied');
    case 'RESERVED':
      return t('tableMap.disabledReasons.reserved');
    case 'CAPACITY':
      return t('tableMap.disabledReasons.capacity');
    case 'TIME_CONFLICT':
      return t('tableMap.disabledReasons.timeConflict');
    default:
      return null;
  }
};

const mapApiTablesToUiTables = (apiTables) =>
  (apiTables || []).map((row) => {
    const tableNumber = Number(row.table_id);
    const label = Number.isFinite(tableNumber)
      ? `B${String(tableNumber).padStart(2, '0')}`
      : String(row.table_id);

    return {
      ...row,
      table_id: row.table_id,
      id: label,
      seats: row.capacity,
      status: row.selectable ? 'available' : 'booked',
    };
  });

const keepPreviousSelection = (prev, mapped) => {
  if (!prev) return null;
  const prevTableId = prev.table_id;
  if (prevTableId === null || prevTableId === undefined) return null;

  const stillExists = (mapped || []).find((t) => t.table_id === prevTableId);
  if (!stillExists?.selectable) return null;
  return stillExists;
};

const TableMapScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToastContext();
  const { t } = useTranslation();
  const { 
    dayReservation = "Chưa chọn", 
    timeReservation = "Chưa chọn", 
    numOfGuess = 0,
    numOfGuest,
    guests,
    numGuests,
    customerName,
    customerPhone,
    customerEmail,
    reservationNote,
  } = location.state || {};

  const guestCount = useMemo(() => {
    const raw = numOfGuess ?? numOfGuest ?? guests ?? numGuests ?? 0;
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }, [guests, numGuests, numOfGuess, numOfGuest]);

  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hasValidInputs = Boolean(dayReservation && timeReservation && guestCount > 0);

    if (!hasValidInputs || dayReservation === 'Chưa chọn' || timeReservation === 'Chưa chọn') {
      setTables([]);
      setSelectedTable(null);
      return;
    }

    let cancelled = false;
    const fetchTables = async () => {
      setLoadingTables(true);
      try {
        const response = await ApiService.getTablesAvailability({
          date: dayReservation,
          time: timeReservation,
          guests: guestCount,
        });

        const apiTables = response?.data?.tables || [];
        const mapped = mapApiTablesToUiTables(apiTables);

        if (cancelled) return;

        setTables(mapped);
        setSelectedTable((prev) => keepPreviousSelection(prev, mapped));
      } catch (err) {
        if (!cancelled) {
          setTables([]);
          setSelectedTable(null);
          toast.error(err?.message || t('tableMap.loadError'));
        }
      } finally {
        if (!cancelled) setLoadingTables(false);
      }
    };

    fetchTables();
    return () => {
      cancelled = true;
    };
  }, [dayReservation, guestCount, timeReservation, toast]);

  const handleConfirm = async () => {
    if (!selectedTable) {
      toast.warning(t('tableMap.selectRequired'));
      return;
    }

    const reservation_time = `${dayReservation}T${timeReservation}:00`;
    const table_id = Number(selectedTable.table_id);
    if (!Number.isFinite(table_id)) {
      toast.error(t('tableMap.invalidTable'));
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.createReservation({
        reservation_time,
        number_of_guests: guestCount,
        table_id,
        note: reservationNote,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
      });

      navigate('/reservation-success', {
        state: {
          selectedTable,
          dayReservation,
          timeReservation,
          guestCount,
        },
      });
    } catch (err) {
      toast.error(err?.message || t('tableMap.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  let selectionBlock = <div className="selection-hint">{t('tableMap.selectionHint')}</div>;
  if (loadingTables) {
    selectionBlock = <div className="selection-hint">{t('tableMap.loading')}</div>;
  } else if (selectedTable) {
    selectionBlock = (
      <output className="selection-notice" aria-live="polite">
        {t('tableMap.selectedNotice', { id: selectedTable.id, seats: selectedTable.seats, guestCount })}
      </output>
    );
  }

  return (
    <div className="table-map-container">
      {/* 1. Thông tin đặt bàn */}
      <div className="reservation-card">
        <div className="reservation-card__header">
          <h3>{t('tableMap.reservationInfoTitle')}</h3>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              <CiCalendar className="icon" />
            </span>
            <div>
              <p className="label">{t('tableMap.labels.date')}</p>
              <p className="value">{dayReservation}</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              <FiClock className="icon" />
            </span>
            <div>
              <p className="label">{t('tableMap.labels.time')}</p>
              <p className="value">{timeReservation}</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              <IoPeopleSharp className="icon" />
            </span>
            <div>
              <p className="label">{t('tableMap.labels.guests')}</p>
              <p className="value">{guestCount}</p>
            </div>
          </div>
        </div>
        <div className="reservation-instructions">
        <p className="instruction">{t('tableMap.instruction')}</p>
        <button
            type="button"
            className="back-to-reservation"
            onClick={() => navigate(-1)}
          >
            {t('tableMap.backToReservation')}
          </button>
        </div>
      </div>

      {/* 2. Sơ đồ nhà hàng */}
      <div className="map-card">
        <h3>{t('tableMap.title')}</h3>

        <div className="table-grid">
          {tables.map((table) => (
            <button
              type="button"
              key={table.table_id ?? table.id}
              className={`table-box ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
              onClick={() => setSelectedTable((prev) => (prev?.id === table.id ? null : table))}
              disabled={table.status !== 'available'}
              aria-pressed={selectedTable?.id === table.id}
              aria-label={t('tableMap.tableAriaLabel', {
                id: table.id,
                seats: table.seats,
                status: table.status === 'available' ? t('tableMap.available') : (getDisabledReasonLabel(table.disabled_reason, t) || t('tableMap.unavailable')),
              })}
            >
              <span className="id">{table.id}</span>
              <span className="seats">{t('tableMap.seatCount', { count: table.seats })}</span>
            </button>
          ))}
        </div>

        {/* 3. Hiển thị thông báo khi chọn bàn */}
        {selectionBlock}

        {/* 4. Legend (Ghi chú màu) */}
        <div className="legend" aria-label={t('tableMap.legendAriaLabel')}>
          <span><span className="dot available" /> {t('tableMap.legend.available')}</span>
          <span><span className="dot selected" /> {t('tableMap.legend.selected')}</span>
          <span><span className="dot booked" /> {t('tableMap.legend.booked')}</span>
        </div>
      </div>

      <button className="confirm-btn" onClick={handleConfirm} disabled={!selectedTable || submitting}>
        {submitting ? t('tableMap.submitting') : t('tableMap.confirm')}
      </button>
      <p className="footer-note">{t('tableMap.footerNote')}</p>
    </div>
  );
};

export default TableMapScreen;