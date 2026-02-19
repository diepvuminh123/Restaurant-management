import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkCircle, IoCardOutline, IoBusiness, IoLogoUsd, IoChatbubbleEllipsesOutline, IoHappyOutline } from 'react-icons/io5';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import ToastContainer from '../../component/Toast/ToastContainer';
import ConfirmDialog from '../../component/ConfirmDialog/ConfirmDialog';
import './CheckoutScreen.css';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast, error, success } = useToast();
  const { confirmState, showConfirm, hideConfirm } = useConfirm();
  const { cartItems = [], totalAmount = 0, customerInfo: initialCustomerInfo = {} } = location.state || {};
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Chọn món, 2: Cọc, 3: Gửi bill
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('zalopay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: initialCustomerInfo.name || '',
    email: initialCustomerInfo.email || '',
    phone: initialCustomerInfo.phone || '',
    pickupTime: '',
    pickupDate: '',
    notes: ''
  });

  // Tính số tiền cọc (50% tổng đơn)
  const depositAmount = totalAmount * 0.5;

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmOrder = () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    // Chuyển sang bước thanh toán
    success('Thông tin đã được xác nhận!');
    setCurrentStep(2);
  };

  const handleConfirmDeposit = async () => {
    const confirmed = await showConfirm({
      title: 'Xác nhận thanh toán',
      message: `Bạn đã chuyển khoản ${depositAmount.toLocaleString('vi-VN')}đ (50% đơn hàng)?`,
      type: 'warning',
      confirmText: 'Đã thanh toán',
      cancelText: 'Chưa',
    });

    if (confirmed) {
      setIsProcessing(true);
      
      // Giả lập xử lý thanh toán
      setTimeout(() => {
        // setIsProcessing(false);
        setCurrentStep(3); // Chuyển sang bước gửi bill
        success('Thanh toán cọc thành công!');
      }, 1500);
    }
  };

  const handleSendBillViaMessenger = () => {
    // Mở messenger để gửi bill
    const messengerLink = 'https://m.me/yourpage'; // Thay bằng link Messenger thực tế
    window.open(messengerLink, '_blank');
  };

  const handleComplete = () => {
    // Chuyển về trang menu
    navigate('/menu');
  };

  return (
    <div className="checkout-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog {...confirmState} />
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button className="btn-back" onClick={handleBackToMenu}>
            <IoArrowBack /> Quay lại Trang chọn món
          </button>
        </div>

        {/* Title */}
        <div className="checkout-title">
          <h1>Xác nhận thanh toán cọc</h1>
          <p>Bạn cần thanh toán trước 50% giá trị đơn hàng để giữ chỗ.</p>
        </div>

        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">{currentStep > 1 ? <IoCheckmarkCircle /> : '1'}</div>
            <span className="step-label">Chọn món</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">{currentStep > 2 ? <IoCheckmarkCircle /> : '2'}</div>
            <span className="step-label">Cọc</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Gửi bill</span>
          </div>
        </div>

        <div className="checkout-content">
          {/* Step 1: Thông tin đặt món */}
          {currentStep === 1 && (
            <>
              <div className="order-info-section">
                <h2>Thông tin người đặt</h2>
                <p className="section-description">Kiểm tra và bổ sung thông tin trước khi đặt món.</p>

                <div className="customer-form">
                  <div className="form-row">
                    <label>Họ và tên <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleCustomerInfoChange}
                      placeholder="Diệp Vũ Minh"
                    />
                  </div>

                  <div className="form-row">
                    <label>Số điện thoại <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleCustomerInfoChange}
                      placeholder="0915728661"
                    />
                  </div>

                  <div className="form-row">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      placeholder="chinhtpc123@gmail.com"
                    />
                  </div>

                  <div className="form-row-group">
                    <div className="form-row half">
                      <label>Giờ đến lấy dự kiến</label>
                      <input
                        type="time"
                        name="pickupTime"
                        value={customerInfo.pickupTime}
                        onChange={handleCustomerInfoChange}
                      />
                    </div>
                    <div className="form-row half">
                      <label>Ngày</label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={customerInfo.pickupDate}
                        onChange={handleCustomerInfoChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Ghi chú đặc biệt</label>
                    <textarea
                      name="notes"
                      value={customerInfo.notes}
                      onChange={handleCustomerInfoChange}
                      placeholder="Ví dụ: Không bỏ hành, thêm ớt..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="order-summary-sidebar">
                  <h3>Đơn hàng của bạn</h3>
                  <div className="order-items-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <img src={item.images?.[0] || '/placeholder.png'} alt={item.name} />
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-quantity">Số lượng: x{item.quantity}</p>
                        </div>
                        <p className="item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    ))}
                  </div>

                  <div className="order-total">
                    <span>Tạm tính</span>
                    <span className="total-amount">{totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <button className="btn-confirm-order" onClick={handleConfirmOrder}>
                    Xác nhận đặt đơn
                  </button>
                  
                  <p className="order-note">
                    Bạn sẽ được chuyển sang bước thanh toán cọc 50% để xác nhận đơn.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Cọc - Payment */}
          {currentStep === 2 && (
            <>
              <div className="checkout-summary">
                <div className="summary-row">
                  <span>Họ tên khách:</span>
                  <span className="summary-value">{customerInfo.name}</span>
                </div>
                <div className="summary-row">
                  <span>Email:</span>
                  <span className="summary-value">{customerInfo.email}</span>
                </div>
                <div className="summary-row">
                  <span>Tổng đơn hàng:</span>
                  <span className="summary-value">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="summary-row highlight">
                  <span>Số tiền cần cọc (50%):</span>
                  <span className="summary-amount">{depositAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="payment-methods">
                <h3>Chọn phương thức thanh toán cọc</h3>
                <div className="payment-options">
                  <button
                    className={`payment-option ${selectedPaymentMethod === 'zalopay' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('zalopay')}
                  >
                    <div className="payment-icon"><IoCardOutline /></div>
                    <span>ZaloPay</span>
                  </button>
                  <button
                    className={`payment-option ${selectedPaymentMethod === 'acb' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('acb')}
                  >
                    <div className="payment-icon"><IoBusiness /></div>
                    <span>Ngân hàng ACB</span>
                  </button>
                  <button
                    className={`payment-option ${selectedPaymentMethod === 'vietcombank' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('vietcombank')}
                  >
                    <div className="payment-icon"><IoLogoUsd /></div>
                    <span>Ngân hàng Vietcombank</span>
                  </button>
                </div>
              </div>

              {/* QR Code hoặc thông tin thanh toán */}
              {selectedPaymentMethod === 'zalopay' && (
                <div className="payment-details">
                  <div className="qr-code-container">
                    <div className="qr-code-placeholder">
                      <img 
                        src="https://via.placeholder.com/200x200/4a90e2/ffffff?text=QR+Code" 
                        alt="QR Code ZaloPay" 
                      />
                    </div>
                    <p className="qr-instruction">Quét mã để thanh toán 50% đơn hàng</p>
                  </div>
                  <p className="payment-note">
                    Nội dung chuyển khoản: Mã số quý khách + số điện thoại
                  </p>
                </div>
              )}

              {selectedPaymentMethod !== 'zalopay' && (
                <div className="payment-details">
                  <div className="bank-info">
                    <h4>Gửi bill xác nhận</h4>
                    <p>Sau khi chuyển khoản, vui lòng gửi ảnh biên lai để xác nhận giao dịch.</p>
                  </div>
                </div>
              )}

              <div className="checkout-actions">
                <button 
                  className="btn-confirm-payment" 
                  onClick={handleConfirmDeposit}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                </button>
              </div>

              <p className="checkout-note">
                Lưu ý: Nhà hàng chỉ tiến hành làm món khi nhận được tiền đặt cọc
              </p>
            </>
          )}

          {/* Step 3: Gửi bill */}
          {currentStep === 3 && (
            <div className="checkout-success">
              <div className="success-icon">
                <IoCheckmarkCircle />
              </div>
              <h2> Cảm ơn bạn!</h2>
              <p className="success-message">
                Cảm ơn bạn đã hoàn tất thanh toán cọc!
                <br />
                Nhà hàng sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất.
              </p>

              <div className="bill-confirmation">
                <h3>Gửi bill xác nhận</h3>
                <p>Sau khi chuyển khoản, vui lòng gửi ảnh biên lai để xác nhận giao dịch.</p>
                <button 
                  className="btn-send-messenger"
                  onClick={handleSendBillViaMessenger}
                >
                  <IoChatbubbleEllipsesOutline style={{verticalAlign: 'middle', marginRight: '6px'}} /> Gửi bill qua Messenger
                </button>
                <button 
                  className="btn-complete"
                  onClick={handleComplete}
                >
                  Hoàn tất
                </button>
              </div>

              <p className="success-note">
                Lưu ý: Nhà hàng chỉ tiến hành làm món khi nhận được tiền đặt cọc
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
