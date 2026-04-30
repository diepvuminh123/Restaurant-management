import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./MenuScreen.css";

import Header from "../../component/Menu/Header/Header";
import FilterBar from "../../component/Menu/FilterBar/FilterBar";
import Sidebar from "../../component/Menu/Sidebar/Sidebar";
import DishCard from "../../component/Menu/DishCard/DishCard";
import ApiService from "../../services/apiService";
import Loading from "../../component/Loading/Loading";
import CartPopUp from "../../component/Menu/CartPopUp/CartPopUp";
import ReviewModal from "../../component/Menu/ReviewModal/ReviewModal";
import { useCart } from "../../hooks/useCart";
const PAGE_SIZE = 12;

export default function MenuScreen({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(""); 
  const [statusFilter, setStatusFilter] = useState(""); 
  const [selectedCats, setSelectedCats] = useState([]);
  const [price, setPrice] = useState(500000);
  const [page, setPage] = useState(1);

  // Use Cart Hook instead of sessionStorage
  const {
    cartItems,
    cartTotalCount,
    cartTotalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    loading: cartLoading
  } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reviewDish, setReviewDish] = useState(null);

  // State cho API data
  const [menuItems, setMenuItems] = useState([]);
  const [sections, setSections] = useState([]); // State cho sections
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const menuRequestIdRef = useRef(0);

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
            setActiveTab((prev) => prev || response.data[0].id);
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
    if (!sectionId) {
      setMenuItems([]);
      setTotalPages(0);
      return;
    }

    let isCancelled = false;
    const currentRequestId = ++menuRequestIdRef.current;

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
        
        if (isCancelled || currentRequestId !== menuRequestIdRef.current) {
          return;
        }

        if (response.success) {
          setMenuItems(response.items || []);
          setTotalPages(response.pagination?.total_pages || 0);
        } else {
          setError(response.message || t('menuScreen.loadError'));
        }
      } catch (err) {
        if (isCancelled || currentRequestId !== menuRequestIdRef.current) {
          return;
        }

        setError(err.message || t('menuScreen.generalError'));
        console.error('Error fetching menu items:', err);
        setMenuItems([]);
      } finally {
        if (!isCancelled && currentRequestId === menuRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchMenuItems();

    return () => {
      isCancelled = true;
    };
  }, [sectionId, selectedCats, price, search, sort, statusFilter, page, t]);

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
  

  // Thêm món vào giỏ hàng sử dụng API
  const handleAddToCart = async (dish) => {
    await addToCart(dish, 1, null);
  };

  // Khi người dùng nhấn vô "Thêm" thì giỏ hàng sẽ tự cập nhật ngầm
  const handleAddOnly = (dish) => {
    handleAddToCart(dish);
  };
  
  // Khi click "Đặt mang về" - Chuyển thẳng đến trang thanh toán với món đó
  const handleOpenCartModal = async (dish) => {
    if (dish) {
      // Thêm món vào giỏ hàng trước
      await addToCart(dish, 1, null);
      
      // Chuyển đến checkout với thông tin đã điền sẵn
      navigate('/checkout', {
        state: {
          customerInfo: {
            name: user?.fullName || user?.username || '',
            email: user?.email || '',
            phone: user?.phone || ''
          }
        }
      });
    }
  };

  // Cập nhật số lượng món trong giỏ hàng
  const handleUpdateQuantity = async (id, change) => {
    await updateQuantity(id, change);
  };

  const handleOpenReviews = (dish) => {
    setReviewDish(dish);
  };

  const handleCloseReviews = () => {
    setReviewDish(null);
  };

  const handleRequestReviewLogin = () => {
    setReviewDish(null);
    navigate('/login', {
      state: {
        redirectTo: '/menu',
      },
    });
  };

  // Xóa món khỏi giỏ hàng
  const handleRemoveItem = async (id) => {
    await removeFromCart(id);
  };

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
        trackingPath="/order-lookup"
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
        {reviewDish && (
          <ReviewModal
            dish={reviewDish}
            user={user}
            onClose={handleCloseReviews}
            onRequestLogin={handleRequestReviewLogin}
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
              {t('menuScreen.all')}
            </button>
            <button
              className={`status-filter-btn ${statusFilter === "popular" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("popular")}
            >
              {t('menuScreen.popular')}
            </button>
            <button
              className={`status-filter-btn ${statusFilter === "new" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("new")}
            >
              {t('menuScreen.new')}
            </button>
            <button
              className={`status-filter-btn ${statusFilter === "soldout" ? "active" : ""}`}
              onClick={() => handleStatusFilterChange("soldout")}
            >
              {t('menuScreen.outOfStock')}
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
              <p>{t('common.error')}: {error}</p>
              <button onClick={() => window.location.reload()}>{t('menuScreen.retry')}</button>
            </div>
          )}

          {!loading && !error && menuItems.length === 0 && (
            <div className="menu-empty">
              <p>{t('menuScreen.noResults')}</p>
            </div>
          )}

          {!loading && !error && menuItems.length > 0 && (
            <>
              <div className="dish-grid">
                {menuItems.map((d) => (
                  <DishCard
                    key={d.id}
                    dish={d}
                    onAddOnly={handleAddOnly}
                    onOpenCart={handleOpenCartModal}
                    onOpenReviews={handleOpenReviews}
                  />
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

MenuScreen.propTypes = {
  user: PropTypes.object,
};
