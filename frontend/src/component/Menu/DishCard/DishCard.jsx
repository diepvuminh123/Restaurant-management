import React from "react";
import "./DishCard.css";
import { Star } from "lucide-react";

export default function DishCard({ dish, onAdd }) {
  return (
    <div className="dish-card">
      <div className="dish-thumb">
        <div className="dish-thumb__placeholder" />
        {dish.badge && <span className="dish-badge">{dish.badge}</span>}
      </div>

      <div className="dish-body">
        <h4>{dish.name}</h4>
        <p>{dish.desc}</p>

        <div className="dish-rating"><Star color="#ebef0b" fill="#ebef0b" /> {dish.rating}</div>

        <div className="dish-price">
          {dish.price.toLocaleString("vi-VN")}đ
        </div>

        <div className="dish-actions">
          <button className="btn-outline" onClick={() => onAdd(dish)}>
            + Thêm
          </button>
          <button className="btn-solid">Đặt mang về</button>
        </div>
      </div>
    </div>
  );
}
