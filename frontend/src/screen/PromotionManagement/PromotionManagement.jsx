import React, { useState, useEffect } from 'react';
import { IoAdd, IoCreateOutline, IoTrashOutline, IoSearchOutline } from 'react-icons/io5';
import ApiService from '../../services/apiService';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import ToastContainer from '../../component/Toast/ToastContainer';
import ConfirmDialog from '../../component/ConfirmDialog/ConfirmDialog';
import './PromotionManagement.css';

const PromotionManagement = () => {
  const { toasts, removeToast, error, success } = useToast();
  const { confirmState, showConfirm } = useConfirm();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromoId, setCurrentPromoId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_order_value: 0,
    max_discount_amount: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    is_active: true
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      // Create a specific admin request later if needed, but for now use basic request structure
      // Wait, let's add an explicit endpoint call or use ApiService.request directly
      const result = await ApiService.request(`/promotions?search=${search}`);
      if (result.success) {
        setPromotions(result.data);
      }
    } catch (err) {
      error(err.message || 'Lỗi khi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [search]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: '',
      min_order_value: 0,
      max_discount_amount: '',
      start_date: '',
      end_date: '',
      usage_limit: '',
      is_active: true
    });
    setIsEditing(false);
    setCurrentPromoId(null);
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setIsEditing(true);
      setCurrentPromoId(promo.id);
      setFormData({
        code: promo.code,
        description: promo.description || '',
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_order_value: promo.min_order_value,
        max_discount_amount: promo.max_discount_amount || '',
        start_date: new Date(promo.start_date).toISOString().slice(0, 16),
        end_date: new Date(promo.end_date).toISOString().slice(0, 16),
        usage_limit: promo.usage_limit || '',
        is_active: promo.is_active
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discount_value: Number(formData.discount_value),
        min_order_value: Number(formData.min_order_value) || 0,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };

      if (isEditing) {
        await ApiService.request(`/promotions/${currentPromoId}`, {
          method: 'PUT',
          body: payload
        });
        success('Cập nhật khuyến mãi thành công');
      } else {
        await ApiService.request('/promotions', {
          method: 'POST',
          body: payload
        });
        success('Tạo khuyến mãi thành công');
      }
      handleCloseModal();
      fetchPromotions();
    } catch (err) {
      error(err.message || 'Có lỗi xảy ra khi lưu khuyến mãi');
    }
  };

  const handleDelete = async (promo) => {
    if (promo.used_count > 0) {
      error('Không thể xóa mã đã có người sử dụng. Bạn có thể vô hiệu hóa mã này.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Xóa khuyến mãi',
      message: `Bạn có chắc chắn muốn xóa mã "${promo.code}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      try {
        await ApiService.request(`/promotions/${promo.id}`, { method: 'DELETE' });
        success('Xóa khuyến mãi thành công');
        fetchPromotions();
      } catch (err) {
        error(err.message || 'Lỗi khi xóa khuyến mãi');
      }
    }
  };

  return (
    <div className="promotion-management">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog {...confirmState} />
      
      <div className="pm-header">
        <h1>Quản lý Mã Khuyến Mãi</h1>
        <button className="btn-add-promo" onClick={() => handleOpenModal()}>
          <IoAdd size={20} /> Tạo mã mới
        </button>
      </div>

      <div className="pm-controls">
        <div className="search-box">
          <IoSearchOutline size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm mã khuyến mãi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Đang tải...</div>
        ) : (
          <table className="pm-table">
            <thead>
              <tr>
                <th>Mã giảm giá</th>
                <th>Loại giảm</th>
                <th>Giá trị giảm</th>
                <th>Hạn sử dụng</th>
                <th>Lượt dùng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">Không có mã khuyến mãi nào</td>
                </tr>
              ) : (
                promotions.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <strong>{promo.code}</strong>
                      <div className="promo-min-order">Đơn tối thiểu: {Number(promo.min_order_value).toLocaleString('vi-VN')}đ</div>
                    </td>
                    <td>
                      <span className={`type-badge ${promo.discount_type.toLowerCase()}`}>
                        {promo.discount_type === 'PERCENTAGE' ? '%' : 'VNĐ'}
                      </span>
                    </td>
                    <td>
                      {promo.discount_type === 'PERCENTAGE' 
                        ? `${promo.discount_value}%` 
                        : `${Number(promo.discount_value).toLocaleString('vi-VN')}đ`}
                      {promo.discount_type === 'PERCENTAGE' && promo.max_discount_amount && (
                        <div className="promo-max-discount">Tối đa: {Number(promo.max_discount_amount).toLocaleString('vi-VN')}đ</div>
                      )}
                    </td>
                    <td>
                      <div className="promo-dates">
                        <div>Bắt đầu: {new Date(promo.start_date).toLocaleString('vi-VN')}</div>
                        <div>Kết thúc: {new Date(promo.end_date).toLocaleString('vi-VN')}</div>
                      </div>
                    </td>
                    <td>
                      {promo.used_count} / {promo.usage_limit || '∞'}
                    </td>
                    <td>
                      <span className={`status-badge ${promo.is_active ? 'active' : 'inactive'}`}>
                        {promo.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-icon edit" onClick={() => handleOpenModal(promo)} title="Chỉnh sửa">
                        <IoCreateOutline size={18} />
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(promo)} 
                        title="Xóa"
                        disabled={promo.used_count > 0}
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Chỉnh sửa Khuyến mãi' : 'Tạo Khuyến mãi mới'}</h2>
            <form onSubmit={handleSubmit} className="promo-form">
              <div className="form-group full-width">
                <label>Mã khuyến mãi *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}
                  placeholder="VD: WELCOME10"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group full-width">
                <label>Mô tả (hiển thị cho khách hàng)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="VD: Giảm 10% cho khách hàng mới"
                />
              </div>

              <div className="form-group">
                <label>Loại giảm giá *</label>
                <select name="discount_type" value={formData.discount_type} onChange={handleInputChange}>
                  <option value="PERCENTAGE">Phần trăm (%)</option>
                  <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Giá trị giảm *</label>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step={formData.discount_type === 'PERCENTAGE' ? '0.1' : '1000'}
                />
              </div>

              <div className="form-group">
                <label>Giá trị đơn tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  name="min_order_value"
                  value={formData.min_order_value}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              {formData.discount_type === 'PERCENTAGE' && (
                <div className="form-group">
                  <label>Mức giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    name="max_discount_amount"
                    value={formData.max_discount_amount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Không giới hạn"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc *</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giới hạn số lượt dùng</label>
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="form-group checkbox-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Mã đang hoạt động
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn-submit">
                  {isEditing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
