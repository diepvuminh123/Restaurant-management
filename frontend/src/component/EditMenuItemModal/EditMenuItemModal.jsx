import React, { useState, useRef, useEffect } from "react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import "./EditMenuItemModal.css";
import ApiService from "../../services/apiService";
import { useToastContext } from "../../context/ToastContext";

const EditMenuItemModal = ({
  item,
  userRole,
  sections,
  onClose,
  onSave,
}) => {
  const safeItem = item || {};
  const toast = useToastContext();
  console.log("sections in modal:", sections);

  // Xác định section_id hợp lệ: ưu tiên section của item, nếu không có thì lấy section đầu tiên
  const getValidSectionId = () => {
    if (safeItem.section_id && sections && sections.length > 0) {
      // Kiểm tra xem section_id của item có còn tồn tại không
      const sectionExists = sections.some(sec => sec.id === safeItem.section_id);
      if (sectionExists) {
        return safeItem.section_id;
      }
    }
    // Nếu không có hoặc section đã bị xóa, lấy section đầu tiên
    return sections && sections.length > 0 ? sections[0].id : 1;
  };

  const [formData, setFormData] = useState({
    name: safeItem.name || "",
    description_short: safeItem.description_short || "",
    price: safeItem.price || 0,
    sale_price: safeItem.sale_price ?? "",
    available: safeItem.available ?? true,
    is_popular: safeItem.is_popular ?? false,
    is_soldout: safeItem.is_soldout || false,
    is_new: safeItem.is_new || false,
    prep_time: safeItem.prep_time || 20,
    notes: safeItem.notes || "",
    section_id: getValidSectionId(),
    category_ids: safeItem.category_ids || [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    safeItem.images && safeItem.images[0] ? safeItem.images[0] : ""
  );
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!formData.section_id) return;

        const res = await ApiService.getMenuCategories(formData.section_id);
        console.log("Fetched categories:", res);
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, [formData.section_id]);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    if (safeItem.is_soldout || safeItem.available === false)
      return "out_of_stock";
    if (safeItem.is_popular) return "popular";
    if (safeItem.is_new) return "new";
    return "new";
  });

  const isEmployee = userRole === "employee";
  const isAdmin = userRole === "admin";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => {
      const exists = prev.category_ids.includes(categoryId);
      return {
        ...prev,
        category_ids: exists
          ? prev.category_ids.filter((id) => id !== categoryId)
          : [...prev.category_ids, categoryId],
      };
    });
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleStatusChange = (status) => {
    // Nếu click vào trạng thái đang active thì bỏ chọn (reset về giá trị false)
    if (selectedStatus === status) {
      setSelectedStatus(null);
      setFormData((prev) => ({
        ...prev,
        is_popular: false,
        available: true,
        is_soldout: false,
        is_new: false,
      }));
      return;
    }

    setSelectedStatus(status);

    // Cập nhật form data theo trạng thái được chọn
    if (status === "popular") {
      setFormData((prev) => ({
        ...prev,
        is_popular: true,
        available: true,
        is_soldout: false,
        is_new: false,
      }));
    } else if (status === "out_of_stock") {
      setFormData((prev) => ({
        ...prev,
        available: false,
        is_soldout: true,
        is_popular: false,
        is_new: false,
      }));
    } else if (status === "new") {
      setFormData((prev) => ({
        ...prev,
        is_new: true,
        available: true,
        is_soldout: false,
        is_popular: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn hóa dữ liệu trước khi gửi
      const normalizedData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description_short || null,
        sale_price:
          formData.sale_price === "" ? null : Number(formData.sale_price),
        prep_time:
          formData.prep_time === "" ? null : Number(formData.prep_time),
        notes: formData.notes.trim() || null,
      };

      // Employee chỉ chỉnh trạng thái món ăn
      if (isEmployee) {
        await onSave({
          available: normalizedData.available,
          is_popular: normalizedData.is_popular,
          is_soldout: normalizedData.is_soldout,
          is_new: normalizedData.is_new,
        });
        onClose();
        return;
      }

      // Admin: Lưu món ăn trước
      const response = await onSave(normalizedData);
      
      // Sau đó upload ảnh nếu có
      if (isAdmin && imageFile && response && response.data) {
        const itemId = safeItem.id || response.data.id;
        
        if (itemId) {
          try {
            await ApiService.uploadMenuImage(itemId, imageFile);
          } catch (uploadErr) {
            console.error("Lỗi upload ảnh:", uploadErr);
            toast.warning("Món đã được lưu nhưng upload ảnh thất bại: " + uploadErr.message);
          }
        }
      }
      
      // Đóng modal sau khi hoàn tất
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Có lỗi xảy ra khi lưu món ăn");
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
                  {imagePreview ? (
                    <img src={imagePreview} alt={safeItem.name} />
                  ) : (
                    <div className="no-image" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  className="btn-upload"
                  onClick={handleClickUpload}
                >
                  <IoCloudUploadOutline /> Thay ảnh
                </button>
              </div>
            </div>
          )}

          {/* Tên món - Chỉ admin */}
          {isAdmin && (
            <div className="form-group">
              <label>
                Tên món <span className="required"></span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder=""
                required
              />
            </div>
          )}
          {isAdmin && (
            <div className="form-group">
              <label>Section</label>
              <select
                name="section_id"
                value={formData.section_id} 
                onChange={handleChange}
              >
                {sections && sections.length > 0 ? (
                  sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))
                ) : (
                  <option value={1}>Mặc định</option>
                )}
              </select>
            </div>
          )}
          {isAdmin && (
            <div className="form-group">
              <label>Loại món</label>
              <div className="category-list">
                {categories && categories.length > 0 ? (
                  (
                  categories.map((cat) => (
                    <label key={cat.id} className="category-item">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  )))
                ) : (
                  <p style={{ fontSize: 12, color: "#888" }}>
                    Không có danh mục á.
                  </p>
                )}
              </div>
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
                  max="500000"
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
                className={`status-btn ${
                  selectedStatus === "popular"
                    ? "status-btn--active status-btn--popular"
                    : ""
                }`}
                onClick={() => handleStatusChange("popular")}
              >
                Món phổ biến
              </button>
              <button
                type="button"
                className={`status-btn ${
                  selectedStatus === "new"
                    ? "status-btn--active status-btn--new"
                    : ""
                }`}
                onClick={() => handleStatusChange("new")}
              >
                Món mới
              </button>
              <button
                type="button"
                className={`status-btn ${
                  selectedStatus === "out_of_stock"
                    ? "status-btn--active status-btn--out"
                    : ""
                }`}
                onClick={() => handleStatusChange("out_of_stock")}
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
