import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import ApiService from "../../../services/apiService";

export default function Sidebar({
  selected,
  onToggle,
  price,
  onPrice,
  sectionId = 1,
}) {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ price_min: 0, price_max: 500000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy danh mục từ API categories thay vì facets đã bị xóa
        const response = await ApiService.getMenuCategories(sectionId);
        
        if (response.success && response.data) {
          setCategories(response.data || []);
          
          // Giữ nguyên price range mặc định vì không còn facets API
          setPriceRange({ price_min: 0, price_max: 500000 });
          onPrice(500000);
          
        } else {
          setCategories([]);
          setPriceRange({ price_min: 0, price_max: 500000 });
        }
      } catch (err) {
        setError(err.message);
        setCategories([]);
        setPriceRange({ price_min: 0, price_max: 500000 });
      } finally {
        setLoading(false);
      }
    };

    if (sectionId) {
      fetchCategories();
    }
    
  }, [sectionId]); 

  const handlePriceInput = (e) => {
    const value = parseInt(e.target.value) || 0;
    
    const limitedValue = Math.min(Math.max(value, priceRange.price_min), priceRange.price_max);
    onPrice(limitedValue);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        <div className="sidebar-title">Loại món</div>

        {loading && <p className="sidebar-loading">Đang tải...</p>}
        
        {error && <p className="sidebar-error">Lỗi: {error}</p>}

        {!loading && !error && categories.length === 0 && (
          <p className="sidebar-empty">Không có danh mục</p>
        )}

        {!loading && !error && categories.map((category) => (
          <label key={category.id} className="sidebar-item">
            <input
              type="checkbox"
              checked={selected.includes(category.id)}
              onChange={() => onToggle(category.id)}
            />
            {category.name}
          </label>
        ))}

        <div className="sidebar-title mt">Khoảng giá</div>

        <div className="price-display">
          Tối đa: <strong>{price.toLocaleString("vi-VN")}đ</strong>
        </div>

        {/* Input số để nhập giá trực tiếp */}
        <input
          type="number"
          min={priceRange.price_min}
          max={priceRange.price_max}
          value={price}
          onChange={handlePriceInput}
          placeholder="Nhập giá tối đa"
          className="sidebar-price-input"
        />

        {/* Range slider */}
        <input
          type="range"
          min={priceRange.price_min}
          max={priceRange.price_max}
          value={price}
          onChange={(e) => onPrice(Number(e.target.value))}
          className="sidebar-range"
        />

        <div className="sidebar-range-labels">
          <span>{priceRange.price_min.toLocaleString("vi-VN")}đ</span>
          <span>{priceRange.price_max.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </aside>
  );
}
