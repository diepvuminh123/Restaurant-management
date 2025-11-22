import React from "react";
import "./Sidebar.css";

const CATEGORIES = [
  "Phở",
  "Cơm",
  "Bún",
  "Món Nướng",
  "Món Chiên",
  "Món Chay",
  "Đồ Uống",
  "Tráng Miệng",
];

export default function Sidebar({
  selected,
  onToggle,
  price,
  onPrice,
  max = 500000,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        <div className="sidebar-title">Loại món</div>

        {CATEGORIES.map((c) => (
          <label key={c} className="sidebar-item">
            <input
              type="checkbox"
              checked={selected.includes(c)}
              onChange={() => onToggle(c)}
            />
            {c}
          </label>
        ))}

        <div className="sidebar-title mt">Khoảng giá</div>

        <div className="price-display">
          Tối đa: <strong>{price.toLocaleString("vi-VN")}đ</strong>
        </div>

        <input
          type="range"
          min={0}
          max={max}
          value={price}
          onChange={(e) => onPrice(Number(e.target.value))}
          className="sidebar-range"
        />

        <div className="sidebar-range-labels">
          <span>0đ</span>
          <span>{max.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </aside>
  );
}
