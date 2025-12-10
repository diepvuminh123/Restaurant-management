import React from 'react';
import OrderItem from './OrderItem/OrderItem.jsx'; 
import './CardPopUp.css';

const CartPopUp = ({ cartItems, onClose, onUpdateQuantity, onRemoveItem }) => {
  
  //Tổng tiền của đơn hàng
  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  return (
    // Khi click vô background nền thì sẽ tạm đóng cái Card 
    <div className="cart-backdrop" onClick={onClose}>
      <div 
        className="cart-popup-content" 
        // Ngăn chặn sự kiện click lan truyền, để click vào nội dung không đóng Pop-up
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* === HEADER === */}
        <div className="cart-header">
          <h2>Giỏ hàng</h2>
          {/* Nút đóng Pop-up (Dấu X) */}
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {/* Dòng phân cách theo thiết kế */}
        <hr className="header-divider" /> 

        {/* === DANH SÁCH MÓN ĂN (Có thể cuộn nếu nhiều) === */}
        <div className="cart-items-list-container">
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Giỏ hàng trống.</p>
          ) : (
            cartItems.map((item) => (
              <OrderItem
                key={item.id}
                item={item}
                // Hàm tăng số lượng
                onIncrease={() => onUpdateQuantity(item.id, 1)}
                // Hàm giảm số lượng
                onDecrease={() => onUpdateQuantity(item.id, -1)}
                // HÀM XÓA - Truyền hàm xử lý xóa xuống OrderItem
                onRemove={() => onRemoveItem(item.id)}
              />
            ))
          )}
        </div>
        
        {/* === FOOTER === */}
        <div className="cart-footer">
          {/* Hàng Tạm tính */}
          <div className="subtotal-row">
            <span className="label">Tạm tính</span>
            <strong className="amount">{subTotal.toLocaleString('vi-VN')}₫</strong>
          </div>

          {/* Nút Đặt ngay */}
          <button 
            className="checkout-button" 
            disabled={cartItems.length === 0} // Vô hiệu hóa nút nếu giỏ hàng trống
          >
            Đặt ngay
          </button>
          
          {/* Chú thích nhỏ dưới nút */}
          <p className="delivery-note">
            Kiểm tra lại trước khi đặt hàng
          </p>
        </div>

      </div>
    </div>
  );
};

export default CartPopUp;