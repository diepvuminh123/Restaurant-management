import React, { useState } from 'react';
import { IoClose, IoCloudUploadOutline } from 'react-icons/io5';
import './EditMenuItemModal.css';

const EditMenuItemModal = ({ item, userRole, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item.name || '',
    description_short: item.description_short || '',
    price: item.price || 0,
    sale_price: item.sale_price || '',
    available: item.available,
    is_popular: item.is_popular || false,
    is_soldout: item.is_soldout || false,
    is_new: item.is_new || false,
    prep_time: item.prep_time || 20,
    notes: item.notes || '',


    
  });

  const [selectedStatus, setSelectedStatus] = useState(
    item.is_popular ? 'popular' : item.available ? 'new' : 'out_of_stock'
  );

  const isEmployee = userRole === 'employee';
  const isAdmin = userRole === 'admin';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStatusChange = (status) => {
    
    
    setSelectedStatus(status);
    
    // Cập nhật form data
    if (status === 'popular') {
      setFormData(prev => ({ ...prev, is_popular: true, available: true, is_soldout:false, is_new: false }));
    } else if (status === 'out_of_stock') {
      setFormData(prev => ({ ...prev, available: false, is_soldout: true, is_popular: false, is_new: false }));
    } else {
      setFormData(prev => ({ ...prev, is_new: true, available: true, is_soldout: false, is_popular: false }));
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Chuẩn hóa dữ liệu trước khi gửi
  const normalizedData = {
    ...formData,
    name: formData.name.trim(), 
    sale_price: formData.sale_price === '' ? null : Number(formData.sale_price), 
    prep_time: formData.prep_time === '' ? null : Number(formData.prep_time), 
    notes: formData.notes.trim() || null, 
  };

  // Employee chỉ được cập nhật available và is_popular
  if (isEmployee) {
    onSave({
      available: normalizedData.available,
      is_popular: normalizedData.is_popular
    });
  } else {
    // Admin có full quyền
    onSave(normalizedData);
  }
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chỉnh sửa trạng thái món ăn</h2>
          <button className="modal-close" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Ảnh - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <div className="image-upload">
                <div className="image-preview">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <div className="no-image" />
                  )}
                </div>
                <button type="button" className="btn-upload">
                  <IoCloudUploadOutline /> Thay ảnh
                </button>
              </div>
            </div>
          )}

          {/* Tên món - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <label>Tên món</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên món"
                required
              />
            </div>
          )}

          {/* Mô tả - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description_short"
                value={formData.description_short}
                onChange={handleChange}
                placeholder="Nhập mô tả món ăn"
                rows={3}
              />
            </div>
          )}

          {/* Giá - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <label>Giá</label>
              <div className="price-input">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="95.000"
                  required
                />
                <span className="currency">đ</span>
              </div>
            </div>
          )}

          {/* Trạng thái - Admin và Employee */}
          <div className="form-group">
            <label>Trạng thái</label>
            <div className="status-buttons">
              <button
                type="button"
                className={`status-btn ${selectedStatus === 'popular' ? 'status-btn--active status-btn--popular' : ''}`}
                onClick={() => handleStatusChange('popular')}
              >
                Món phổ biến
              </button>
              <button
                type="button"
                className={`status-btn ${selectedStatus === 'new' ? 'status-btn--active status-btn--new' : ''}`}
                onClick={() => handleStatusChange('new')}
              >
                Món mới
              </button>
              <button
                type="button"
                className={`status-btn ${selectedStatus === 'out_of_stock' ? 'status-btn--active status-btn--out' : ''}`}
                onClick={() => handleStatusChange('out_of_stock')}
              >
                Đang hết món
              </button>
            </div>
          </div>

          {/* Thời gian chế biến - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <label>Thời gian chế biến</label>
              <div className="time-input">
                <input
                  type="number"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleChange}
                  placeholder="20"
                />
                <span className="unit">phút</span>
              </div>
            </div>
          )}

          {/* Ghi chú bếp - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <label>Ghi chú bếp</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ví dụ: Hết nguyên liệu, dự kiến nhập lại 18:00"
                rows={2}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItemModal;
