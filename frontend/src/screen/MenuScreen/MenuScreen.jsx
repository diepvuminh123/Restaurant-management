import React, { useState, useMemo } from "react";
import "./MenuScreen.css";

import Header from "../../component/Menu/Header/Header";
import FilterBar from "../../component/Menu/FilterBar/FilterBar";
import Sidebar from "../../component/Menu/Sidebar/Sidebar";
import DishCard from "../../component/Menu/DishCard/DishCard";

const PAGE_SIZE = 12;

// Dữ liệu món ăn theo từng tab
const ALL_DISHES = {
  main: [
    { id: 1, name: "Phở Bò Đặc Biệt", desc: "Phở bò truyền thống với nước dùng ninh từ xương, thịt bò tươi ngon", rating: 4.9, price: 85000, category: "Phở", badge: "Phổ biến" },
    { id: 2, name: "Cơm Tấm Sườn Bì Chả", desc: "Cơm tấm với sườn nướng thơm lừng, bì và chả trứng hấp dẫn", rating: 4.8, price: 65000, category: "Cơm", badge: null },
    { id: 3, name: "Gỏi Cuốn Tôm Thịt", desc: "Gỏi cuốn tươi với tôm thịt, chấm nước mắm chua ngọt", rating: 4.7, price: 45000, category: "Món Khai Vị", badge: null },
    { id: 4, name: "Bún Chả Hà Nội", desc: "Bún chả với thịt nướng than hoa, nước mắm chua ngọt đậm đà", rating: 4.8, price: 70000, category: "Bún", badge: "Phổ biến" },
    { id: 5, name: "Bánh Mì Thịt Nướng", desc: "Bánh mì giòn với thịt nướng, pate, rau thơm đầy đủ", rating: 4.6, price: 30000, category: "Món Nhanh", badge: null },
    { id: 6, name: "Hủ Tiếu Nam Vang", desc: "Hủ tiếu với tôm, thịt, gan, nước dùng ngọt thanh", rating: 4.7, price: 65000, category: "Món Nước", badge: null },
    { id: 7, name: "Cơm Gà Xối Mọi", desc: "Cơm gà với thịt gà xé sợi, nước mắm gừng đặc trưng", rating: 4.5, price: 60000, category: "Cơm", badge: null },
    { id: 8, name: "Bún Bò Huế", desc: "Bún bò với nước dùng cay nồng, chả cua, giò heo", rating: 4.9, price: 75000, category: "Bún", badge: "Phổ biến" },
    { id: 9, name: "Mì Xào Hải Sản", desc: "Mì xào với tôm, mực, nghêu tươi ngon", rating: 4.6, price: 80000, category: "Món Xào", badge: null },
    { id: 10, name: "Cơm Chiên Dương Châu", desc: "Cơm chiên với tôm, xúc xích, trứng, rau củ", rating: 4.5, price: 55000, category: "Cơm", badge: null },
  ],
  drink: [
    { id: 101, name: "Trà Sữa Truyền Thống", desc: "Trà sữa pha theo công thức truyền thống, thơm ngon", rating: 4.8, price: 35000, category: "Trà Sữa", badge: "Phổ biến" },
    { id: 102, name: "Cà Phê Sữa Đá", desc: "Cà phê phin truyền thống, đậm đà hương vị Việt", rating: 4.9, price: 25000, category: "Cà Phê", badge: "Phổ biến" },
    { id: 103, name: "Sinh Tố Bơ", desc: "Sinh tố bơ sánh mịn, bổ dưỡng", rating: 4.7, price: 40000, category: "Sinh Tố", badge: null },
    { id: 104, name: "Nước Ép Cam", desc: "Nước cam tươi 100%, giàu vitamin C", rating: 4.6, price: 35000, category: "Nước Ép", badge: null },
    { id: 105, name: "Trà Đào Cam Sả", desc: "Trá đào kết hợp cam sả, thanh mát", rating: 4.8, price: 45000, category: "Trà Trái Cây", badge: null },
    { id: 106, name: "Soda Chanh Dây", desc: "Soda chanh dây sảng khoái, giải nhiệt", rating: 4.5, price: 30000, category: "Soda", badge: null },
    { id: 107, name: "Trà Sữa Matcha", desc: "Trà sữa matcha Nhật Bản, thơm ngon độc đáo", rating: 4.7, price: 45000, category: "Trà Sữa", badge: null },
    { id: 108, name: "Cà Phê Đen Đá", desc: "Cà phê đen nguyên chất, thức tỉnh tinh thần", rating: 4.8, price: 20000, category: "Cà Phê", badge: null },
  ],
  dessert: [
    { id: 201, name: "Chè Khúc Bạch", desc: "Chè khúc bạch mát lạnh, thanh mát", rating: 4.7, price: 30000, category: "Chè", badge: null },
    { id: 202, name: "Bánh Flan Caramel", desc: "Bánh flan mềm mịn, caramel đắng nhẹ", rating: 4.8, price: 25000, category: "Bánh", badge: "Phổ biến" },
    { id: 203, name: "Kem Tươi Trái Cây", desc: "Kem tươi với nhiều loại trái cây tươi ngon", rating: 4.9, price: 45000, category: "Kem", badge: "Phổ biến" },
    { id: 204, name: "Sữa Chua Nếp Cẩm", desc: "Sữa chua kết hợp nếp cẩm bổ dưỡng", rating: 4.6, price: 35000, category: "Sữa Chua", badge: null },
    { id: 205, name: "Chè Thái Thập Cẩm", desc: "Chè Thái với nhiều loại thạch, trái cây", rating: 4.7, price: 40000, category: "Chè", badge: null },
    { id: 206, name: "Bánh Tiramisu", desc: "Bánh Tiramisu Ý, vị cà phê đậm đà", rating: 4.8, price: 55000, category: "Bánh", badge: null },
    { id: 207, name: "Chè Bưởi", desc: "Chè bưởi với múi bưởi tươi, nước cốt dừa", rating: 4.5, price: 35000, category: "Chè", badge: null },
    { id: 208, name: "Bánh Mousse Socola", desc: "Bánh mousse socola mịn màng, tan chảy", rating: 4.9, price: 60000, category: "Bánh", badge: null },
  ],
  combo: [
    { id: 301, name: "Combo Gia Đình", desc: "Phở bò 4 tô + 2 phần gỏi cuốn + 4 ly nước", rating: 4.9, price: 350000, category: "Combo 4 Người", badge: "Phổ biến" },
    { id: 302, name: "Combo Couple", desc: "2 suất cơm tấm + 2 ly trà sữa + 1 phần chè", rating: 4.8, price: 180000, category: "Combo 2 Người", badge: "Phổ biến" },
    { id: 303, name: "Combo Sáng", desc: "Bánh mì + cà phê sữa đá", rating: 4.7, price: 50000, category: "Combo Sáng", badge: null },
    { id: 304, name: "Combo Tiệc Nhỏ", desc: "6 phần cơm tấm + 6 ly nước + 3 phần tráng miệng", rating: 4.9, price: 500000, category: "Combo Nhóm", badge: null },
    { id: 305, name: "Combo Trưa Văn Phòng", desc: "Cơm/Phở/Bún (chọn 1) + Nước + Tráng miệng", rating: 4.6, price: 95000, category: "Combo 1 Người", badge: null },
    { id: 306, name: "Combo Bạn Bè", desc: "4 phần món chính + 4 ly nước + 2 phần gỏi", rating: 4.8, price: 320000, category: "Combo 4 Người", badge: null },
  ],
  veggie: [
    { id: 401, name: "Phở Chay Nấm", desc: "Phở chay với nấm đùi gà, nước dùng từ rau củ", rating: 4.7, price: 65000, category: "Món Chay", badge: null },
    { id: 402, name: "Cơm Chiên Chay", desc: "Cơm chiên với rau củ, đậu hũ, nấm", rating: 4.6, price: 55000, category: "Món Chay", badge: null },
    { id: 403, name: "Bún Riêu Chay", desc: "Bún riêu chay từ cà chua, đậu hũ", rating: 4.8, price: 60000, category: "Món Chay", badge: "Phổ biến" },
    { id: 404, name: "Gỏi Cuốn Chay", desc: "Gỏi cuốn với rau sống, đậu hũ, bún", rating: 4.5, price: 40000, category: "Món Chay", badge: null },
    { id: 405, name: "Mì Xào Chay", desc: "Mì xào với rau củ, nấm tươi ngon", rating: 4.7, price: 65000, category: "Món Chay", badge: null },
    { id: 406, name: "Canh Chua Chay", desc: "Canh chua với rau củ, nấm, đậu hũ", rating: 4.6, price: 50000, category: "Món Chay", badge: null },
    { id: 407, name: "Đậu Hũ Sốt Cà", desc: "Đậu hũ chiên giòn sốt cà chua", rating: 4.8, price: 55000, category: "Món Chay", badge: "Phổ biến" },
    { id: 408, name: "Rau Củ Xào Chay", desc: "Rau củ xào với nấm, đậu phụ thơm ngon", rating: 4.5, price: 50000, category: "Món Chay", badge: null },
  ],
};

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState("main");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(""); // Mặc định không sort
  const [selectedCats, setSelectedCats] = useState([]);
  const [price, setPrice] = useState(500000);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(0);

  const toggleCat = (c) => {
    setPage(1);
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  // Toggle sort - click lại để bỏ chọn
  const handleSortChange = (newSort) => {
    setPage(1);
    setSort((prev) => (prev === newSort ? "" : newSort));
  };

  // Reset filter khi chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    // setSelectedCats([]);
    // setSearch("");
  };

  // Lấy tiêu đề tab hiện tại
  const getTabTitle = () => {
    const titles = {
      main: "Món Chính",
      drink: "Đồ Uống",
      dessert: "Món Tráng Miệng",
      combo: "Combo",
      veggie: "Món Chay",
    };
    return titles[activeTab] || "Món Chính";
  };

  const data = useMemo(() => {
    // Lấy dữ liệu theo tab đang active
    let arr = [...(ALL_DISHES[activeTab] || [])];

    // Filter theo category
    if (selectedCats.length)
      arr = arr.filter((d) => selectedCats.includes(d.category));

    // Filter theo giá
    arr = arr.filter((d) => d.price <= price);

    // Filter theo search
    if (search.trim())
      arr = arr.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );

    // Sắp xếp theo sort key (chỉ khi có sort được chọn)
    if (sort) {
      switch (sort) {
        case "popular":
          // Món có badge "Phổ biến" lên đầu, sau đó sắp xếp theo rating
          arr.sort((a, b) => {
            if (a.badge === "Phổ biến" && b.badge !== "Phổ biến") return -1;
            if (a.badge !== "Phổ biến" && b.badge === "Phổ biến") return 1;
            return b.rating - a.rating;
          });
          break;
        
        case "rating":
          // sắp theo thì cao xuống thấp
          arr.sort((a, b) => b.rating - a.rating);
          break;
        
        case "newest":
          arr.sort((a, b) => b.id - a.id);
          break;
        
        case "priceAsc":
          arr.sort((a, b) => a.price - b.price);
          break;
        
        case "priceDesc":
          arr.sort((a, b) => b.price - a.price);
          break;
        
        default:
          break;
      }
    }

    return arr;
  }, [activeTab, selectedCats, price, search, sort]);

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
      />

      <div className="menu-content">
        <Sidebar
          selected={selectedCats}
          onToggle={toggleCat}
          price={price}
          onPrice={setPrice}
        />

        <main className="menu-main">
          <FilterBar sortKey={sort} onSortChange={handleSortChange} />

          <h2>{getTabTitle()}</h2>

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
        </main>
      </div>
    </div>
  );
}
