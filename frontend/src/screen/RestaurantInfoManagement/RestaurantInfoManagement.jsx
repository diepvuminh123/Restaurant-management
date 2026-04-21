import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import './RestaurantInfoManagement.css';

const INITIAL_FORM = {
  name: '',
  slogan: '',
  logo_url: '',
  brand_image_url: '',
  address_line: '',
  contact_phone: '',
  contact_email: '',
  opening_time: '',
  closing_time: '',
};

const toInputTime = (value) => {
  if (!value) return '';
  return String(value).slice(0, 5);
};

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN');
};

const RestaurantInfoManagement = () => {
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [meta, setMeta] = useState({ created_at: null, updated_at: null });
  const [form, setForm] = useState(INITIAL_FORM);

  const isCreateMode = useMemo(() => !restaurantId, [restaurantId]);

  const applyDataToForm = (data) => {
    if (!data) {
      setRestaurantId(null);
      setMeta({ created_at: null, updated_at: null });
      setForm(INITIAL_FORM);
      return;
    }

    setRestaurantId(data.id || null);
    setMeta({
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
    });
    setForm({
      name: data.name || '',
      slogan: data.slogan || '',
      logo_url: data.logo_url || '',
      brand_image_url: data.brand_image_url || '',
      address_line: data.address_line || '',
      contact_phone: data.contact_phone || '',
      contact_email: data.contact_email || '',
      opening_time: toInputTime(data.opening_time),
      closing_time: toInputTime(data.closing_time),
    });
  };

  const fetchRestaurantInfo = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getRestaurantInfo();
      applyDataToForm(response?.data || null);
    } catch (error) {
      applyDataToForm(null);
      toast.error(error.message || 'Không thể tải thông tin nhà hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantInfo();
  }, []);

  const onChangeField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateBeforeSubmit = () => {
    if (!form.name.trim()) {
      toast.warning('Vui lòng nhập tên nhà hàng');
      return false;
    }

    if (!form.address_line.trim()) {
      toast.warning('Vui lòng nhập địa chỉ nhà hàng');
      return false;
    }

    if (!form.opening_time || !form.closing_time) {
      toast.warning('Vui lòng nhập giờ mở cửa và giờ đóng cửa');
      return false;
    }

    if (form.opening_time >= form.closing_time) {
      toast.warning('Giờ mở cửa phải nhỏ hơn giờ đóng cửa');
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    slogan: form.slogan.trim(),
    logo_url: form.logo_url.trim(),
    brand_image_url: form.brand_image_url.trim(),
    address_line: form.address_line.trim(),
    contact_phone: form.contact_phone.trim(),
    contact_email: form.contact_email.trim(),
    opening_time: form.opening_time,
    closing_time: form.closing_time,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateBeforeSubmit()) {
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      const response = isCreateMode
        ? await ApiService.createRestaurantInfo(payload)
        : await ApiService.updateRestaurantInfo(restaurantId, payload);

      applyDataToForm(response?.data || null);
      toast.success(isCreateMode ? 'Tạo thông tin nhà hàng thành công' : 'Cập nhật thông tin nhà hàng thành công');
    } catch (error) {
      toast.error(error.message || 'Không thể lưu thông tin nhà hàng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="restaurant-info-admin">
      <header className="restaurant-info-admin__header">
        <div>
          <h1>Quản lý thông tin nhà hàng</h1>
          <p>Admin có thể chỉnh sửa thông tin hiển thị cho khách ở toàn bộ hệ thống.</p>
        </div>
        <button
          type="button"
          className="restaurant-info-admin__refresh"
          onClick={fetchRestaurantInfo}
          disabled={loading || saving}
        >
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </header>

      <form className="restaurant-info-admin__form" onSubmit={handleSubmit}>
        <div className="restaurant-info-admin__grid">
          <label>
            Tên nhà hàng *
            <input
              type="text"
              value={form.name}
              onChange={(event) => onChangeField('name', event.target.value)}
              maxLength={150}
              placeholder="Nhà hàng ABC"
              disabled={loading || saving}
              required
            />
          </label>

          <label>
            Slogan
            <input
              type="text"
              value={form.slogan}
              onChange={(event) => onChangeField('slogan', event.target.value)}
              maxLength={255}
              placeholder="Hương vị gắn kết"
              disabled={loading || saving}
            />
          </label>

          <label>
            Số điện thoại
            <input
              type="text"
              value={form.contact_phone}
              onChange={(event) => onChangeField('contact_phone', event.target.value)}
              maxLength={20}
              placeholder="0901 234 567"
              disabled={loading || saving}
            />
          </label>

          <label>
            Email liên hệ
            <input
              type="email"
              value={form.contact_email}
              onChange={(event) => onChangeField('contact_email', event.target.value)}
              maxLength={100}
              placeholder="lienhe@restaurant.vn"
              disabled={loading || saving}
            />
          </label>

          <label>
            Giờ mở cửa *
            <input
              type="time"
              value={form.opening_time}
              onChange={(event) => onChangeField('opening_time', event.target.value)}
              disabled={loading || saving}
              required
            />
          </label>

          <label>
            Giờ đóng cửa *
            <input
              type="time"
              value={form.closing_time}
              onChange={(event) => onChangeField('closing_time', event.target.value)}
              disabled={loading || saving}
              required
            />
          </label>
        </div>

        <label>
          Địa chỉ *
          <input
            type="text"
            value={form.address_line}
            onChange={(event) => onChangeField('address_line', event.target.value)}
            maxLength={255}
            placeholder="123 Đường A, Quận B, TP.HCM"
            disabled={loading || saving}
            required
          />
        </label>

        <label>
          URL logo
          <input
            type="text"
            value={form.logo_url}
            onChange={(event) => onChangeField('logo_url', event.target.value)}
            placeholder="https://..."
            disabled={loading || saving}
          />
        </label>

        <label>
          URL ảnh thương hiệu
          <input
            type="text"
            value={form.brand_image_url}
            onChange={(event) => onChangeField('brand_image_url', event.target.value)}
            placeholder="https://..."
            disabled={loading || saving}
          />
        </label>

        <div className="restaurant-info-admin__meta">
          <span>Tạo lúc: {formatDateTime(meta.created_at)}</span>
          <span>Cập nhật lần cuối: {formatDateTime(meta.updated_at)}</span>
        </div>

        <div className="restaurant-info-admin__actions">
          <button type="submit" className="restaurant-info-admin__submit" disabled={loading || saving}>
            {saving ? 'Đang lưu...' : isCreateMode ? 'Tạo thông tin nhà hàng' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default RestaurantInfoManagement;
