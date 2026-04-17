import React, { useState, useEffect } from "react";
import { IoArrowBack, IoSearchOutline } from "react-icons/io5";
import { MdEdit, MdDeleteOutline  } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import ApiService from "../../services/apiService";
import EditMenuItemModal from "../../component/EditMenuItemModal/EditMenuItemModal";
import MenuManagementSection from "../../component/ManageSectionsModal/ManageSections";
import Loading from "../../component/Loading/Loading";
import ConfirmDialog from "../../component/ConfirmDialog/ConfirmDialog";
import { useConfirm } from "../../hooks/useConfirm";
import { useToastContext } from "../../context/ToastContext";
import "./MenuManagement.css";

const MenuManagement = ({ user }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSectionModal, setshowEditSectionModal] = useState(false);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const { confirmState, showConfirm } = useConfirm();
  const toast = useToastContext();

  const isEmployee = user.role === "employee";
  const isAdmin = user.role === "admin";

  const fetchMeta = async () => {
    //  Lấy sections
    try {
      const secRes = await ApiService.getMenuSections();
      if (secRes.success) {
        setSections(secRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Filter và search
  useEffect(() => {
    filterItems();
  }, [menuItems, searchQuery, activeFilter, sortBy]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMenuItems({ limit: 1000 });
      console.log("API Response:", response); // Debug
      if (response.success) {
        // Backend trả về { success: true, items: [], pagination: {} }
        setMenuItems(response.items || []);
      } else {
        console.error("API returned error:", response);
        toast.error("Lỗi: " + (response.message || "Không thể tải danh sách món"));
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error(
        "Lỗi kết nối: " +
          error.message +
          "\nVui lòng kiểm tra Backend đã chạy chưa."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSectionsUpdated = () => {
    // Refresh sections and categories when they are updated in the modal
    fetchMeta();
  };

  const filterItems = () => {
    let filtered = [...menuItems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (activeFilter === "popular") {
      filtered = filtered.filter((item) => item.is_popular);
    } else if (activeFilter === "new") {
      filtered = filtered.filter((item) => item.is_new);
    } else if (activeFilter === "out-of-stock") {
      filtered = filtered.filter((item) => !item.available);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "vi");
      } else if (sortBy === "price") {
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      }
      return 0;
    });

    setFilteredItems(filtered);
  };

  const handleFilterClick = (filter) => {
    // if (filter === "new" || filter === "out-of-stock") {
    //   toast.info("Tính năng này đang chờ BE hỗ trợ. Database chưa có trường này.");
    //   return;
    // }
    setActiveFilter(filter);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleAddNewClick = () => {
    setSelectedItem(null);
    setShowEditModal(true);
  };

  const handleClickEditSection = () => {
    // setSelectedItem(null);
    setshowEditSectionModal(true);
  };

  const handleSaveItem = async (data) => {
    try {
      let response;
      const isEditing = !!selectedItem;

      if (isEditing) {
        // SỬA
        response = await ApiService.updateMenuItem(selectedItem.id, data);
        toast.success("Cập nhật món thành công!");
      } else {
        // TẠO MỚI
        response = await ApiService.createMenuItem(data);
        toast.success("Thêm món mới thành công!");
      }

      if (response.success) {
        // Đợi một chút để backend xử lý xong, sau đó refresh
        setTimeout(() => {
          fetchMenuItems();
        }, 500);
      }
      
      // Trả về response để modal có thể sử dụng ID mới tạo
      return response;
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Lỗi: " + error.message);
      throw error;
    }
  };
  const handleDelete = async (itemId) => {
    const confirmed = await showConfirm({
      title: "Xác nhận xóa món",
      message: "Bạn có chắc chắn muốn xóa món này? Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await ApiService.deleteMenuItem(itemId);
      if (response.success) {
        toast.success("Xóa món thành công!");
        fetchMenuItems();
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Lỗi: " + error.message);
    }
  };

  // Đếm số lượng theo trạng thái
  const getStatusCount = (status) => {
    if (status === "popular") {
      return menuItems.filter((item) => item.is_popular).length;
    } else if (status === "new") {
       return menuItems.filter((item) => item.is_new).length;
    } else if (status === "out-of-stock") {
      return menuItems.filter((item) => item.is_soldout).length;
    }
    return menuItems.length;
  };

  const getStatusBadge = (item) => {
    if (item.is_soldout) {
      return (
        <span className="status-badge status-badge--out">Đang hết món</span>
      );
    }
    if (item.is_new) {
      return <span className="status-badge status-badge--new"> Món mới </span>;
    }

    if (item.is_popular) {
      return (
        <span className="status-badge status-badge--popular">Món phổ biến</span>
      );
    }
  };

  return (
    <div className="menu-management">
      <div className="menu-management__header">
        <div className="menu-management__title">
          <h1>Trạng thái món ăn</h1>
        </div>
        
        {!isEmployee && (
          <div className="menu-management__actions">
            <button className="btn-add-item" onClick={handleAddNewClick}>
              <AiOutlinePlus /> Thêm món mới
            </button>

            <button className="btn-add-item" onClick={handleClickEditSection}>
              <AiOutlinePlus /> Chỉnh sửa danh mục món ăn
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="menu-management__search">
        <IoSearchOutline className="search-icon" />
        <input
          type="text"
          placeholder="Tìm món theo tên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="menu-management__filters">
        <button
          className={`filter-btn ${
            activeFilter === "all" ? "filter-btn--active" : ""
          }`}
          onClick={() => setActiveFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={`filter-btn ${
            activeFilter === "popular" ? "filter-btn--active" : ""
          }`}
          onClick={() => handleFilterClick("popular")}
        >
          Món phổ biến
        </button>
        <button
          className={`filter-btn ${
            activeFilter === "new" ? "filter-btn--active" : ""
          }`}
          onClick={() => handleFilterClick("new")}
        >
          Món mới
        </button>
        <button
          className={`filter-btn ${
            activeFilter === "out-of-stock" ? "filter-btn--active" : ""
          }`}
          onClick={() => handleFilterClick("out-of-stock")}
        >
          Đang hết món
        </button>
      </div>

      {/* Status cards */}
      <div className="menu-management__stats">
        <div className="stat-card stat-card--popular">
          <p className="stat-card__label">Món phổ biến</p>
          <p className="stat-card__value">{getStatusCount("popular")} món</p>
        </div>
        <div className="stat-card stat-card--new">
          <p className="stat-card__label">Món mới</p>
          <p className="stat-card__value">{getStatusCount("new")} món</p>
        </div>
        <div className="stat-card stat-card--out">
          <p className="stat-card__label">Đang hết món</p>
          <p className="stat-card__value">
            {getStatusCount("out-of-stock")} món
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="menu-management__table-wrapper">
        <div className="menu-management__table-header">
          <h2>Danh sách món ăn</h2>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Tên món A-Z</option>
            <option value="price">Giá tăng dần</option>
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : filteredItems.length === 0 ? (
          <div className="no-data">
            <p>Không có món ăn nào.</p>
            <p style={{ fontSize: "14px", color: "#999" }}>
              Vui lòng kiểm tra Backend đã chạy và có dữ liệu chưa.
            </p>
          </div>
        ) : (
          <table className="menu-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên món</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Loại món </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="menu-table__image">
                      {item.images && item.images[0] ? (
                        <img src={item.images[0]} alt={item.name} />
                      ) : (
                        <div className="menu-table__no-image" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="menu-table__name">
                      <p className="name">{item.name}</p>
                      <p className="desc">{item.description_short}</p>
                    </div>
                  </td>
                  <td>
                    {item.sale_price && (
                      <span className="price-original">
                        {Number(item.price).toLocaleString("vi-VN")}đ
                      </span>
                    )}
                    <span className="price">
                      {Number(item.sale_price || item.price).toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </span>
                  </td>
                  <td>{getStatusBadge(item)}</td>
                  <td className="name">
                    {Array.isArray(item.categories)
                      ? item.categories.join(", ")
                      : ""}
                  </td>

                  <td>
                    <div className="menu-table__actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(item)}
                      >
                        <MdEdit />
                      </button>
                      <button 
                      className="btn-more"
                      onClick={() => handleDelete(item.id)}
                       >
                       <MdDeleteOutline />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditMenuItemModal
          item={selectedItem}
          userRole={user.role}
          sections={sections}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveItem}
        />
      )}

      {/* Section Management Modal */}
      {showEditSectionModal && (
        <MenuManagementSection 
          onClose={() => setshowEditSectionModal(false)}
          onSectionsUpdated={handleSectionsUpdated}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmState} />
    </div>
  );
};

export default MenuManagement;
