import React from 'react';
import './OrderItem.css';

const OrderItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const {name, price, imageUrl, quantity} = item
  
  const subtotal = item.price * quantity;
  return (
    <div className="order-item-detail">
      {/* 1. Hình ảnh và tên món */}
      <div className="item-info-group">
        <img 
          src={imageUrl || 'default-placeholder.jpg'}
          alt={name} 
          className="item-thumbnail"
        />
        <div className="item-text-group">
          
          <div className="name-and-remove-group">
            <span className="item-name-popup">{name}</span>
            {/* Nút Xóa (MỚI) */}
            <button 
                className="remove-item-button" 
                onClick={onRemove}
                title="Xóa món ăn khỏi giỏ hàng"
            >
                &times; {/* Hoặc dùng biểu tượng thùng rác 🗑️ */}
            </button>
          </div>

          <span className="item-unit-price">
            {price.toLocaleString('vi-VN')}₫
          </span>
          
          <div className="item-quantity-control-wrapper">
            {/* Khối điều khiển số lượng (+ / -) */}
            <button 
              className="quantity-button decrease" 
              onClick={onDecrease} 
              disabled={quantity <= 1} 
            >
              —
            </button>
            <span className="current-quantity">{quantity}</span>
            <button 
              className="quantity-button increase" 
              onClick={onIncrease}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tổng giá trị của món ăn này */}
      <span className="item-subtotal-price">
        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
      </span>
    </div>
  );
};

export default OrderItem;