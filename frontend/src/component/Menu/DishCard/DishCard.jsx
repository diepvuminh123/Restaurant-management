import React from "react";
import "./DishCard.css";
import { Star } from "lucide-react";
import CartPopUp from "../CartPopUp/CartPopUp";
import OrderItem from "../CartPopUp/OrderItem/OrderItem";
export default function DishCard({ dish, onAddOnly, onOpenCart }) {
  // Map database fields to component
  const {
    name,
    description_short,
    price,
    sale_price,
    rating_avg,
    is_popular,
    is_new,
    is_soldout,
    images
  } = dish;

  // Lấy ảnh đầu tiên từ array images
  const mainImage = images && images.length > 0 ? images[0] : null;

  // Xác định badge và class dựa trên trạng thái (ưu tiên: soldout > new > popular) Vì popular để đầu nó sẽ ăn mất :> này code lại sau hơi lỏ
  let badgeText = null;
  let badgeClass = "";
  
  const handleAddClick = () => {
    onAddOnly(dish)
  }
  const handleOrderClick = () => {
    onOpenCart(dish)
  }
  if (is_soldout) {
    badgeText = "Đang hết hàng";
    badgeClass = "soldout";
  } else if (is_new) {
    badgeText = "Món mới";
    badgeClass = "new";
  } else if (is_popular) {
    badgeText = "Phổ biến";
    badgeClass = "popular";
  }

  return (
    <div className="dish-card">
      <div className="dish-thumb">
        {mainImage ? (
          <img src={mainImage} alt={name} className="dish-thumb__image" />
        ) : (
          <div className="dish-thumb__placeholder" />
        )}
        {badgeText && <span className={`dish-badge ${badgeClass}`}>{badgeText}</span>}
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
          <button 
            className="btn-outline" 
            onClick={handleAddClick}
            disabled={is_soldout}
          >
            + Thêm
          </button>
          <button 
            className="btn-solid" 
            onClick={handleOrderClick}
            disabled={is_soldout}
          >
            Đặt mang về
          </button>
        </div>
      </div>
    </div>
  );
}
