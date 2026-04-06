import React, { useMemo, useState } from 'react';
import ApiService from '../../../../services/apiService';
import { useToastContext } from '../../../../context/ToastContext';
import './ChangePasswordForm.css';

const DEFAULT_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const ChangePasswordForm = () => {
  const toast = useToastContext();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return false;
    }

    if (formData.newPassword.length < 6) {
      return false;
    }

    return formData.newPassword === formData.confirmPassword;
  }, [formData]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp');
      return;
    }

    try {
      setIsSubmitting(true);
      await ApiService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Đổi mật khẩu thành công');
      setFormData(DEFAULT_FORM);
    } catch (error) {
      toast.error(error.message || 'Không thể đổi mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-form-card">
      <div className="change-password-header">
        <span className="change-password-title">Đặt lại mật khẩu</span>
      </div>

      <form onSubmit={onSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
          <p className="password-hint">Mật khẩu mới cần tối thiểu 6 ký tự.</p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="save-btn" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
