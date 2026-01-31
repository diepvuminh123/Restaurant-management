import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import OrderItem from './OrderItem/OrderItem.jsx'; 
import RoleSelectionModal from '../../RoleSelectionModal/RoleSelectionModal.jsx';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import './CartPopUp.css';

const CartPopUp = ({ onLoginSuccess, cartItems, onClose, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  //Tổng tiền của đơn hàng
  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const getLoggedInUser = () => {
    const storedUser = sessionStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  };

  const navigateToCheckout = () => {
    onClose?.();

    navigate('/checkout', {
      state: {
        cartItems: cartItems,
        totalAmount: subTotal,
        customerInfo: {
          name: '',
          email: '',
          phone: ''
        }
      }
    });
  };

  const handleCheckout = () => {
    const user = getLoggedInUser();

    // Nếu chưa đăng nhập thì cho chọn vai trò
    if (!user) {
      setIsRoleModalOpen(true);
      return;
    }

    navigateToCheckout();
  };

  const handleSelectRole = (role) => {
    setIsRoleModalOpen(false);

    if (role === 'guest') {
      navigateToCheckout();
      return;
    }

    if (role === 'user') {
      onClose?.();
      navigate('/login', {
        state: {
          redirectTo: '/checkout',
          redirectState: {
            cartItems: cartItems,
            totalAmount: subTotal,
            customerInfo: {
              name: '',
              email: '',
              phone: ''
            }
          }
        }
      });
    }
  };

  return (
    // Khi click vô background nền thì sẽ tạm đóng cái Card 
    <div
      className={`cart-backdrop ${isRoleModalOpen ? 'role-modal-open' : ''}`}
      onClick={onClose}
    >
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
            onClick={handleCheckout}
          >
            Đặt ngay
          </button>
          
          {/* Chú thích nhỏ dưới nút */}
          <p className="delivery-note">
            Kiểm tra lại trước khi đặt hàng
          </p>
        </div>

        {isRoleModalOpen && (
          <RoleSelectionModal
            onSelectRole={handleSelectRole}
            onClose={() => setIsRoleModalOpen(false)}
          />
        )}

      </div>
    </div>
  );
};

CartPopUp.propTypes = {
  onLoginSuccess: PropTypes.func,
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
};

export default CartPopUp;