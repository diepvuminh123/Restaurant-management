import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CiCalendar } from "react-icons/ci";
import { FiClock } from "react-icons/fi"; 
import { IoPeopleSharp } from "react-icons/io5";
import { useToastContext } from '../../context/ToastContext';
import ApiService from '../../services/apiService';
import './TableMapScreen.css';

const getDisabledReasonLabel = (reason) => {
  switch (reason) {
    case 'OCCUPIED':
      return 'Đang có khách';
    case 'RESERVED':
      return 'Đã được giữ';
    case 'CAPACITY':
      return 'Không đủ chỗ';
    case 'TIME_CONFLICT':
      return 'Trùng thời gian';
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
          toast.error(err?.message || 'Không thể tải danh sách bàn');
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
      toast.warning('Bạn chưa chọn bàn.');
      return;
    }

    const reservation_time = `${dayReservation}T${timeReservation}:00`;
    const table_id = Number(selectedTable.table_id);
    if (!Number.isFinite(table_id)) {
      toast.error('Không xác định được bàn');
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
      toast.error(err?.message || 'Đặt bàn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  let selectionBlock = <div className="selection-hint">Chọn một bàn để tiếp tục</div>;
  if (loadingTables) {
    selectionBlock = <div className="selection-hint">Đang tải danh sách bàn...</div>;
  } else if (selectedTable) {
    selectionBlock = (
      <output className="selection-notice" aria-live="polite">
        {selectedTable.id} • {selectedTable.seats} ghế • Phù hợp cho {guestCount} người
      </output>
    );
  }

  return (
    <div className="table-map-container">
      {/* 1. Thông tin đặt bàn */}
      <div className="reservation-card">
        <div className="reservation-card__header">
          <h3>Thông tin đặt bàn</h3>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              <CiCalendar className="icon" />
            </span>
            <div>
              <p className="label">Ngày</p>
              <p className="value">{dayReservation}</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              <FiClock className="icon" />
            </span>
            <div>
              <p className="label">Thời gian</p>
              <p className="value">{timeReservation}</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              <IoPeopleSharp className="icon" />
            </span>
            <div>
              <p className="label">Số khách</p>
              <p className="value">{guestCount}</p>
            </div>
          </div>
        </div>
        <div className="reservation-instructions">
        <p className="instruction">Chọn bàn khả dụng bên dưới</p>
        <button
            type="button"
            className="back-to-reservation"
            onClick={() => navigate(-1)}
          >
            Quay lại thông tin đặt chỗ
          </button>
        </div>
      </div>

      {/* 2. Sơ đồ nhà hàng */}
      <div className="map-card">
        <h3>Sơ đồ nhà hàng</h3>

        <div className="table-grid">
          {tables.map((table) => (
            <button
              type="button"
              key={table.table_id ?? table.id}
              className={`table-box ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
              onClick={() => setSelectedTable((prev) => (prev?.id === table.id ? null : table))}
              disabled={table.status !== 'available'}
              aria-pressed={selectedTable?.id === table.id}
              aria-label={`Bàn ${table.id}, ${table.seats} ghế, ${table.status === 'available' ? 'có sẵn' : (getDisabledReasonLabel(table.disabled_reason) || 'không khả dụng')}`}
            >
              <span className="id">{table.id}</span>
              <span className="seats">{table.seats} ghế</span>
            </button>
          ))}
        </div>

        {/* 3. Hiển thị thông báo khi chọn bàn */}
        {selectionBlock}

        {/* 4. Legend (Ghi chú màu) */}
        <div className="legend" aria-label="Ghi chú trạng thái bàn">
          <span><span className="dot available" /> Available</span>
          <span><span className="dot selected" /> Selected</span>
          <span><span className="dot booked" /> Booked</span>
        </div>
      </div>

      <button className="confirm-btn" onClick={handleConfirm} disabled={!selectedTable || submitting}>
        {submitting ? 'Đang đặt bàn...' : 'Xác nhận bàn'}
      </button>
      <p className="footer-note">Giữ bàn trong 10 phút</p>
    </div>
  );
};

export default TableMapScreen;