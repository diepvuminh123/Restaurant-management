import React from "react";
import "./FilterBar.css";

// lucide icons giống ảnh
import {
  Flame,
  Star,
  Clock3,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from "lucide-react";

const FILTERS = [
  { key: "popular", label: "Phổ biến", Icon: Flame },
  { key: "rating", label: "Đánh giá cao", Icon: Star },
  { key: "newest", label: "Mới nhất", Icon: Clock3 },
  { key: "priceAsc", label: "Giá thấp đến cao", Icon: ArrowDownNarrowWide },
  { key: "priceDesc", label: "Giá cao đến thấp", Icon: ArrowUpNarrowWide },
];

export default function FilterBar({ sortKey, onSortChange }) {
  return (
    <div className="filterbar">
      {FILTERS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`filter-chip ${sortKey === key ? "active" : ""}`}
          onClick={() => onSortChange(key)}
        >
          <Icon className="chip-icon" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}