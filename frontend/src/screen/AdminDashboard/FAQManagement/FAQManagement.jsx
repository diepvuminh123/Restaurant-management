import React, { useState, useEffect } from 'react';
import './FAQManagement.css';
import ApiService from '../../../services/apiService';
import { useToastContext } from '../../../context/ToastContext';
import Loading from '../../../component/Loading/Loading';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_active: true,
    sort_order: 0
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAllFaqs();
      setFaqs(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách FAQ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setCurrentFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active,
        sort_order: faq.sort_order
      });
    } else {
      setCurrentFaq(null);
      setFormData({
        question: '',
        answer: '',
        is_active: true,
        sort_order: faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) + 1 : 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentFaq(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentFaq) {
        await ApiService.updateFaq(currentFaq.id, formData);
        toast.success('Cập nhật FAQ thành công');
      } else {
        await ApiService.createFaq(formData);
        toast.success('Thêm FAQ thành công');
      }
      handleCloseModal();
      fetchFaqs();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) {
      try {
        await ApiService.deleteFaq(id);
        toast.success('Xóa FAQ thành công');
        fetchFaqs();
      } catch (error) {
        toast.error('Lỗi khi xóa FAQ');
      }
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await ApiService.updateFaq(faq.id, { is_active: !faq.is_active });
      toast.success(`Đã ${!faq.is_active ? 'hiện' : 'ẩn'} FAQ`);
      fetchFaqs();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="faq-management">
      <div className="faq-header">
        <h2>Quản lý FAQ (Câu hỏi thường gặp)</h2>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          + Thêm FAQ mới
        </button>
      </div>

      <div className="faq-table-container">
        <table className="faq-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thứ tự</th>
              <th>Câu hỏi</th>
              <th>Câu trả lời</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {faqs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">Chưa có dữ liệu FAQ</td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id}>
                  <td>{faq.id}</td>
                  <td>{faq.sort_order}</td>
                  <td className="faq-text-cell">{faq.question}</td>
                  <td className="faq-text-cell">{faq.answer}</td>
                  <td>
                    <span 
                      className={`status-badge ${faq.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(faq)}
                      title="Nhấn để thay đổi"
                    >
                      {faq.is_active ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="action-cells">
                    <button className="btn-edit" onClick={() => handleOpenModal(faq)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(faq.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="faq-modal-overlay">
          <div className="faq-modal">
            <h3>{currentFaq ? 'Cập nhật FAQ' : 'Thêm FAQ mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Câu hỏi:</label>
                <input 
                  type="text" 
                  name="question" 
                  value={formData.question} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Nhập câu hỏi..."
                />
              </div>
              <div className="form-group">
                <label>Câu trả lời:</label>
                <textarea 
                  name="answer" 
                  value={formData.answer} 
                  onChange={handleInputChange} 
                  required 
                  rows="4"
                  placeholder="Nhập câu trả lời..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thứ tự hiển thị:</label>
                  <input 
                    type="number" 
                    name="sort_order" 
                    value={formData.sort_order} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={formData.is_active} 
                      onChange={handleInputChange} 
                    />
                    Hiển thị trên trang chủ
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQManagement;
