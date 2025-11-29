import React from "react";
import "./DishCard.css";
import { Star } from "lucide-react";

export default function DishCard({ dish, onAdd }) {
  // Map database fields to component
  const {
    name,
    description_short,
    price,
    sale_price,
    rating_avg,
    is_popular,
    image_cover
  } = dish;

  return (
    <div className="dish-card">
      <div className="dish-thumb">
        {image_cover ? (
          <img src={image_cover} alt={name} className="dish-thumb__image" />
        ) : (
          <div className="dish-thumb__placeholder" />
        )}
        {is_popular && <span className="dish-badge">Phổ biến</span>}
      </div>

      <div className="dish-body">
        <h4>{name}</h4>
        <p>{description_short || 'Món ăn ngon, được yêu thích'}</p>

        <div className="dish-rating">
          <Star color="#ebef0b" fill="#ebef0b" /> 
          {rating_avg ? Number(rating_avg).toFixed(1) : '0.0'}
        </div>

        <div className="dish-price">
          {sale_price && (
            <span className="dish-price__original">
              {Number(price).toLocaleString("vi-VN")}đ
            </span>
          )}
          <span className={sale_price ? "dish-price__sale" : ""}>
            {Number(sale_price || price).toLocaleString("vi-VN")}đ
          </span>
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
