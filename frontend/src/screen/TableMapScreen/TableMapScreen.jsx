import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CiCalendar } from "react-icons/ci";
import { FiClock } from "react-icons/fi"; 
import { IoPeopleSharp } from "react-icons/io5";
import { useToastContext } from '../../context/ToastContext';
import './TableMapScreen.css';
import tablesData from './tablesData';

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
  } = location.state || {};

  const guestCount = useMemo(() => {
    const raw = numOfGuess ?? numOfGuest ?? guests ?? numGuests ?? 0;
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }, [guests, numGuests, numOfGuess, numOfGuest]);

  const [selectedTable, setSelectedTable] = useState(null);

  const handleConfirm = () => {
    if (!selectedTable) {
      toast.warning('Bạn chưa chọn bàn.');
      return;
    }
    navigate('/reservation-success', {
      state: {
        selectedTable,
        dayReservation,
        timeReservation,
        guestCount,
      },
    });
  };

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
          {tablesData.map((table) => (
            <button
              type="button"
              key={table.id}
              className={`table-box ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
              onClick={() => setSelectedTable((prev) => (prev?.id === table.id ? null : table))}
              disabled={table.status !== 'available'}
              aria-pressed={selectedTable?.id === table.id}
              aria-label={`Bàn ${table.id}, ${table.seats} ghế, ${table.status === 'available' ? 'có sẵn' : 'đã đặt'}`}
            >
              <span className="id">{table.id}</span>
              <span className="seats">{table.seats} ghế</span>
            </button>
          ))}
        </div>

        {/* 3. Hiển thị thông báo khi chọn bàn */}
        {selectedTable ? (
          <output className="selection-notice" aria-live="polite">
            {selectedTable.id} • {selectedTable.seats} ghế • Phù hợp cho {guestCount} người
          </output>
        ) : (
          <div className="selection-hint">Chọn một bàn để tiếp tục</div>
        )}

        {/* 4. Legend (Ghi chú màu) */}
        <div className="legend" aria-label="Ghi chú trạng thái bàn">
          <span><span className="dot available" /> Available</span>
          <span><span className="dot selected" /> Selected</span>
          <span><span className="dot booked" /> Booked</span>
        </div>
      </div>

      <button className="confirm-btn" onClick={handleConfirm} disabled={!selectedTable}>
        Xác nhận bàn
      </button>
      <p className="footer-note">Giữ bàn trong 10 phút</p>
    </div>
  );
};

export default TableMapScreen;