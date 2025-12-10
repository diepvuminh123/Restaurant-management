import React, { useState, useMemo, useEffect } from "react";
import "./MenuScreen.css";

import Header from "../../component/Menu/Header/Header";
import FilterBar from "../../component/Menu/FilterBar/FilterBar";
import Sidebar from "../../component/Menu/Sidebar/Sidebar";
import DishCard from "../../component/Menu/DishCard/DishCard";
import ApiService from "../../services/apiService";
import Loading from "../../component/Loading/Loading";
import CartPopUp from "../../component/Menu/CardPopUp/CardPopUp";
const PAGE_SIZE = 12;

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState(1); 
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(""); 
  const [statusFilter, setStatusFilter] = useState(""); // Trạng thái: popular, new, soldout, hoặc ""
  const [selectedCats, setSelectedCats] = useState([]);
  const [price, setPrice] = useState(500000);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(0);

  //Cart Pop Up
  const [cartItems, setcartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State cho API data
  const [menuItems, setMenuItems] = useState([]);
  const [sections, setSections] = useState([]); // State cho sections
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const sectionId = activeTab; 

  // Fetch sections từ API khi component mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoadingSections(true);
        const response = await ApiService.getMenuSections();
              
        if (response.success && response.data) {
          setSections(response.data);
          // Set activeTab là section đầu tiên
          if (response.data.length > 0) {
            setActiveTab(response.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchSections();
  }, []); // Chỉ chạy 1 lần

  // Fetch menu items từ API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          section_id: sectionId,
          page: page,
          limit: PAGE_SIZE,
        };

        // Thêm category filter nếu có
        if (selectedCats.length > 0) {
          filters.category_id = selectedCats.join(',');
        }

        // Thêm price filter
        if (price) {
          filters.price_max = price;
        }

        // Thêm search
        if (search.trim()) {
          filters.search = search.trim();
        }

        // Xử lý sort - chuyển từ sort key sang sort_by và sort_order
        if (sort) {
          switch (sort) {
            case 'popular':
              filters.sort_by = 'is_popular';
              filters.sort_order = 'DESC';
              break;
            case 'rating':
              filters.sort_by = 'rating_avg';
              filters.sort_order = 'DESC';
              break;
            case 'newest':
              filters.sort_by = 'is_new';
              filters.sort_order = 'DESC';
              break;
            case 'priceAsc':
              filters.sort_by = 'price';
              filters.sort_order = 'ASC';
              break;
            case 'priceDesc':
              filters.sort_by = 'price';
              filters.sort_order = 'DESC';
              break;
            default:
              break;
          }
        }

        // Xử lý status filter
        if (statusFilter) {
          switch (statusFilter) {
            case 'popular':
              filters.is_popular = true;
              break;
            case 'new':
              filters.is_new = true;
              break;
            case 'soldout':
              filters.is_soldout = true;
              break;
            default:
              // Không filter gì (all)
              break;
          }
        }

        const response = await ApiService.getMenuItems(filters);
        
        if (response.success) {
          setMenuItems(response.items || []);
          setTotalPages(response.pagination?.total_pages || 0);
        } else {
          setError(response.message || 'Không thể tải menu');
        }
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi tải menu');
        console.error('Error fetching menu items:', err);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (sectionId) {
      fetchMenuItems();
    }
  }, [sectionId, selectedCats, price, search, sort, statusFilter, page]);

  const toggleCat = (c) => {
    setPage(1);
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleSortChange = (newSort) => {
    setPage(1);
    setSort((prev) => (prev === newSort ? "" : newSort));
  };

  const handleStatusFilterChange = (newStatus) => {
    setPage(1);
    setStatusFilter((prev) => (prev === newStatus ? "" : newStatus));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedCats([]);
    // setSearch("");
  };

  // Lấy tên section hiện tại
  const getTabTitle = () => {
    const currentSection = sections.find(s => s.id === activeTab);
    return currentSection ? currentSection.name : "Menu";
  };
  

  //Khi thêm một món hàng vô Card mua hàng
  const handleAddToCart = (dish) => {
    setcartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === dish.id);
            const itemPrice = Number(dish.sale_price || dish.price);
            
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        id: dish.id,
                        name: dish.name,
                        price: itemPrice, 
                        imageUrl: dish.images && dish.images.length > 0 ? dish.images[0] : null,
                        quantity: 1,
                    }
                ]
            }
        });
    };
  // Khi người dùng nhấn vô "Thêm" thì giỏ hàng sẽ tự cập nhật ngầm, nhưng không pop up liền
  const handleAddOnly = (dish) => {
        handleAddToCart(dish);
  };
  //Giả sử người dùng chỉ chọn một món, thì họ nhấn "Đặt mang về". Lúc này ngay lập tức pop up giỏ hàng
  const handleOpenCartModal = (dish) => {
        if (dish) {
           handleAddToCart(dish); 
        }
        
        setIsCartOpen(true); 
    };

  const handleCloseCart = () => setIsCartOpen(false);
  
  //Quản lý update đơn hàng (Thêm, điều chỉnh số lượng)
  const handleUpdateQuantity = (id, change) => {
    setcartItems(prevItems => 
    prevItems
      .map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity + change } 
          : item
      )
      .filter(item => item.quantity > 0)
  );
}

  const handleRemoveItem = (id) => {
    setcartItems(prevItems => prevItems.filter(item => item.id !== id));
  }

const cartTotalCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  return (
    <div className="menu-page">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchValue={search}
        onSearchChange={setSearch}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        sections={sections}
        loadingSections={loadingSections}
      />

      <div className="menu-content">
        <Sidebar
          selected={selectedCats}
          onToggle={toggleCat}
          price={price}
          onPrice={setPrice}
          sectionId={sectionId}
        />
        {isCartOpen && (
          <CartPopUp 
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          />
        )}
        <main className="menu-main">
          <FilterBar sortKey={sort} onSortChange={handleSortChange} />

          {/* Status Filter Buttons */}
          <div className="status-filter-bar">
            <button
              className={`status-filter-btn ${statusFilter === "" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("")}
            >
              Tất cả
            </button>
            <button
              className={`status-filter-btn ${statusFilter === "popular" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("popular")}
            >
              Phổ biến
            </button>
            <button
              className={`status-filter-btn ${statusFilter === "new" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("new")}
            >
              Món mới
            </button>
            <button
              className={`status-filter-btn ${statusFilter === "soldout" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("soldout")}
            >
              Đang hết hàng
            </button>
          </div>

          <h2>{getTabTitle()}</h2>

          {loading && (
            <div className="menu-loading">
              <Loading />
            </div>
          )}

          {error && (
            <div className="menu-error">
              <p>Lỗi:  {error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          )}

          {!loading && !error && menuItems.length === 0 && (
            <div className="menu-empty">
              <p>Không tìm thấy món ăn phù hợp</p>
            </div>
          )}

          {!loading && !error && menuItems.length > 0 && (
            <>
              <div className="dish-grid">
                {menuItems.map((d) => (
                  <DishCard key={d.id} dish={d} onAddOnly={handleAddOnly} onOpenCart={handleOpenCartModal} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    ←
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={page === i + 1 ? "active" : ""}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
