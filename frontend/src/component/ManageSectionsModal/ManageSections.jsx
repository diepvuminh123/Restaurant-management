import React, { useEffect, useState } from "react";
import "./ManageSections.css";
import ApiService from "../../services/apiService";

export default function MenuManagementSection({ onClose }) {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [newSectionName, setNewSectionName] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySectionId, setNewCategorySectionId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State cho drag & drop
  const [draggedIndex, setDraggedIndex] = useState(null);

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
      // Tính sort_order mới = max hiện tại + 1
      const maxOrder = sections.length > 0 
        ? Math.max(...sections.map(s => s.sort_order || 0)) 
        : 0;
      
      await ApiService.createMenuSections(newSectionName, maxOrder + 1);
      setNewSectionName("");
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

  // -------------------- DRAG & DROP SECTIONS --------------------
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedItem = newSections[draggedIndex];
    
    // Remove dragged item
    newSections.splice(draggedIndex, 1);
    // Insert at new position
    newSections.splice(index, 0, draggedItem);
    
    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    // Update sort_order cho tất cả sections
    try {
      setLoading(true);
      
      // Gọi API để update sort_order
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await ApiService.updateMenuSectionOrder(section.id, i + 1);
      }
      
      setError("");
      loadSections(); // Reload để đồng bộ với server
    } catch (err) {
      console.error(err);
      setError("Cập nhật thứ tự thất bại.");
      loadSections(); // Reload lại nếu lỗi
    } finally {
      setLoading(false);
      setDraggedIndex(null);
    }
  };

  // -------------------- UI --------------------
  return (
    <div className="manage-sections-overlay" onClick={onClose}>
      <div className="manage-sections" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="manage-sections-header">
          <h2>Quản lý Sections & Categories</h2>
          <button className="manage-sections-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="manage-sections-body">
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

                <button type="submit" className="btn add">
                  + Thêm Section
                </button>
              </form>

              <div className="drag-hint">
                💡 Kéo và thả để sắp xếp lại thứ tự
              </div>

              <ul className="list">
                {sections.map((sec, index) => (
                  <li
                    key={sec.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={
                      selectedSectionId === sec.id ? "active item" : "item"
                    }
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      loadCategories(sec.id);
                      setNewCategorySectionId(sec.id);
                    }}
                  >
                    <div className="drag-handle">⋮⋮</div>
                    <div className="item-info">
                      <div className="item-name">{sec.name}</div>
                      <div className="item-desc">Thứ tự: {sec.sort_order || 0}</div>
                    </div>
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

                <button type="submit" className="btn add">
                  + Thêm Category
                </button>
              </form>

              <ul className="list">
                {categories.map((cat) => (
                  <li key={cat.id} className="item">
                    <span className="item-name">{cat.name}</span>
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
      </div>
    </div>
  );
}
