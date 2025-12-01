import React, { useState, useMemo, useEffect } from "react";
import "./MenuScreen.css";

import Header from "../../component/Menu/Header/Header";
import FilterBar from "../../component/Menu/FilterBar/FilterBar";
import Sidebar from "../../component/Menu/Sidebar/Sidebar";
import DishCard from "../../component/Menu/DishCard/DishCard";
import ApiService from "../../services/apiService";
import Loading from "../../component/Loading/Loading";

const PAGE_SIZE = 12;

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState(1); 
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(""); 
  const [selectedCats, setSelectedCats] = useState([]);
  const [price, setPrice] = useState(500000);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(0);

  // State cho API data
  const [menuItems, setMenuItems] = useState([]);
  const [sections, setSections] = useState([]); // State cho sections
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState(null);

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
  }, []); // Chỉ chạy 1 lần khi mount

  // Fetch menu items từ API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          section_id: sectionId,
        };

        // Thêm category filter nếu có
        if (selectedCats.length > 0) {
          filters.category_id = selectedCats.join(',');
        }

        // Thêm price filter
        filters.max_price = price;

        // Thêm search
        if (search.trim()) {
          filters.search = search.trim();
        }

        //sort

        const response = await ApiService.getMenuItems(filters);
        
        if (response.success) {
          setMenuItems(response.items || []);
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
  }, [sectionId, selectedCats, price, search]);

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

  // Sort dữ liệu ở Frontend
  const data = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];

    const sortedItems = [...menuItems];

    switch (sort) {
      case 'popular':
        // Món phổ biến lên đầu
        sortedItems.sort((a, b) => {
          if (a.is_popular && !b.is_popular) return -1;
          if (!a.is_popular && b.is_popular) return 1;
          return 0;
        });
        break;

      case 'rating':
        // Đánh giá cao nhất
        sortedItems.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        break;

      case 'newest':
        // Mới nhất (giả sử id cao hơn = mới hơn)
        sortedItems.sort((a, b) => b.id - a.id);
        break;

      case 'priceAsc':
        // Giá thấp đến cao (ưu tiên sale_price nếu có)
        sortedItems.sort((a, b) => {
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceA - priceB;
        });
        break;

      case 'priceDesc':
        // Giá cao đến thấp (ưu tiên sale_price nếu có)
        sortedItems.sort((a, b) => {
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceB - priceA;
        });
        break;

      default:
        // Không sort - giữ nguyên thứ tự từ API
        break;
    }

    return sortedItems;
  }, [menuItems, sort]);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const current = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [page, data]);

  return (
    <div className="menu-page">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchValue={search}
        onSearchChange={setSearch}
        cartCount={cart}
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

        <main className="menu-main">
          <FilterBar sortKey={sort} onSortChange={handleSortChange} />

          <h2>{getTabTitle()}</h2>

          {loading && (
            <div className="menu-loading">
              <Loading />
            </div>
          )}

          {error && (
            <div className="menu-error">
              <p>❌ {error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          )}

          {!loading && !error && current.length === 0 && (
            <div className="menu-empty">
              <p>Không tìm thấy món ăn phù hợp</p>
            </div>
          )}

          {!loading && !error && current.length > 0 && (
            <>
              <div className="dish-grid">
                {current.map((d) => (
                  <DishCard key={d.id} dish={d} onAdd={() => setCart(cart + 1)} />
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
