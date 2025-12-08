import React, { useEffect, useState } from "react";
import "./ManageSections.css";
import ApiService from "../../services/apiService";

export default function MenuManagementSection() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionOrder, setNewSectionOrder] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySectionId, setNewCategorySectionId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------- LOAD SECTIONS + CATEGORY BAN ĐẦU --------------------
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getMenuSections();
      setSections(res?.data || []);

      if (res?.data?.length > 0) {
        const firstID = res.data[0].id;
        setSelectedSectionId(firstID);
        loadCategories(firstID);
      }
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách section.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (sectionId) => {
    try {
      setLoading(true);
      const res = await ApiService.getMenuCategories(sectionId);
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
      setError("Không tải được category.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- ADD SECTION --------------------
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      setLoading(true);
      await ApiService.createMenuSections(newSectionName, newSectionOrder || null);
      setNewSectionName("");
      setNewSectionOrder("");
      loadSections(); // reload lại list
    } catch (err) {
      console.log(err);
      setError("Tạo section thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- DELETE SECTION --------------------
  const handleDeleteSection = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá section này?")) return;

    try {
      setLoading(true);
      await ApiService.deleteMenuSections(id); // method POST
      loadSections();
    } catch (err) {
      console.error(err);
      setError("Xoá section thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- ADD CATEGORY --------------------
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setLoading(true);
      await ApiService.createMenuCategory(newCategoryName, newCategorySectionId);
      setNewCategoryName("");
      loadCategories(selectedSectionId);
    } catch (err) {
      console.error(err);
      setError("Tạo category thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- DELETE CATEGORY --------------------
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Xoá category này?")) return;

    try {
      setLoading(true);
      await ApiService.deleteMenuCategory(id);
      loadCategories(selectedSectionId);
    } catch (err) {
      console.error(err);
      setError("Xoá category thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- UI --------------------
  return (
    <div className="manage-sections">
      <h2>Quản lý Sections & Categories</h2>

      {error && <div className="err-box">{error}</div>}
      {loading && <div className="loading">Đang xử lý...</div>}

      <div className="columns">
        {/* ---------------- SECTION PANEL ---------------- */}
        <div className="panel">
          <h3>Section</h3>

          <form className="form" onSubmit={handleAddSection}>
            <input
              type="text"
              placeholder="Tên section..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Thứ tự hiển thị (optional)"
              value={newSectionOrder}
              onChange={(e) => setNewSectionOrder(e.target.value)}
            />

            <button type="submit" className="btn add">
              + Thêm Section
            </button>
          </form>

          <ul className="list">
            {sections.map((sec) => (
              <li
                key={sec.id}
                className={
                  selectedSectionId === sec.id ? "active item" : "item"
                }
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  loadCategories(sec.id);
                  setNewCategorySectionId(sec.id);
                }}
              >
                <span style ={{color: "black"}} >{sec.name}</span>
                <button
                  className="btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSection(sec.id);
                  }}
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------- CATEGORY PANEL ---------------- */}
        <div className="panel">
          <h3>Category</h3>

          <form className="form" onSubmit={handleAddCategory}>
            <input
              type="text"
              placeholder="Tên category..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <select
              value={newCategorySectionId}
              onChange={(e) => setNewCategorySectionId(e.target.value)}
            >
              <option value="">-- Chọn section --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <button type="submit" className="btn add">
              + Thêm Category
            </button>
          </form>

          <ul className="list">
            {categories.map((cat) => (
              <li key={cat.id} className="item">
                <span>{cat.name}</span>
                <button
                  className="btn delete"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  Xoá
                </button>
              </li>
            ))}

            {categories.length === 0 && (
              <li className="empty">Không có category trong section này.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
