# Cart System - Implementation Summary

## 📋 Tổng quan

Đã hoàn thiện hệ thống giỏ hàng (Cart) cho ứng dụng Restaurant Management với các tính năng:
- ✅ Lưu trữ giỏ hàng trên server (PostgreSQL)
- ✅ Hỗ trợ cả user đã đăng nhập và guest
- ✅ Tự động đồng bộ giữa sessions
- ✅ API RESTful đầy đủ
- ✅ Frontend đã refactor để sử dụng API
- ✅ Xóa bỏ sessionStorage cart (server-side cart)

## 🗂️ Cấu trúc Files

### Backend
```
backend/src/
├── models/
│   └── Cart.js                 # Cart model với database queries
├── services/
│   └── cartService.js          # Business logic layer
├── controllers/
│   └── cartController.js       # Request/response handlers
├── routes/
│   └── cartRoutes.js           # API endpoints
├── validations/
│   └── cartValidation.js       # Input validation rules
└── app.js                      # ✅ Updated: Import cart routes

backend/database/
├── Cart.sql                    # Cart schema (with comments)
├── Cart_clean.sql              # ✅ Clean version (no comments)
├── order_flow_schema_clean.sql # ✅ Clean version
└── CART_API.md                 # ✅ API Documentation
```

### Frontend
```
frontend/src/
├── hooks/
│   └── useCart.js              # ✅ NEW: Custom hook cho cart
├── services/
│   └── apiService.js           # ✅ Updated: Thêm Cart API methods
├── screen/
│   └── MenuScreen/
│       └── MenuScreen.jsx      # ✅ Refactored: Sử dụng useCart hook
└── App.jsx                     # ✅ Updated: Xóa cart sessionStorage logic
```

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Lấy giỏ hàng hiện tại |
| POST | `/api/cart/items` | Thêm món vào giỏ |
| PUT | `/api/cart/items/:id` | Cập nhật item (quantity/note) |
| DELETE | `/api/cart/items/:id` | Xóa item khỏi giỏ |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ hàng |
| POST | `/api/cart/migrate` | Migrate guest cart → user cart |
| GET | `/api/cart/validate` | Validate giỏ trước checkout |

Chi tiết xem: [CART_API.md](backend/database/CART_API.md)

## 🔄 Luồng hoạt động

### 1. Guest User (Chưa đăng nhập)
```
User browse menu → Add to cart → Cart lưu với session_id
→ User đăng nhập → Backend tự động migrate cart sang user_id
```

### 2. Logged-in User
```
User đăng nhập → Browse menu → Add to cart → Cart lưu với user_id
→ Cart được sync across sessions/devices
```

### 3. Checkout Flow
```
Cart → Validate → Create Order → Cart status = 'CHECKED_OUT'
→ Order created với snapshot của cart items
```

## 💻 Frontend Usage

### Sử dụng useCart Hook

```jsx
import { useCart } from '../hooks/useCart';

function MyComponent() {
  const {
    cartItems,           // Array of cart items
    cartTotalCount,      // Total quantity
    cartTotalAmount,     // Total price
    addToCart,           // Function to add item
    updateQuantity,      // Function to update quantity
    removeFromCart,      // Function to remove item
    clearCart,           // Function to clear cart
    validateCart,        // Function to validate
    loading,             // Loading state
    error                // Error message
  } = useCart();

  // Thêm món vào giỏ
  const handleAdd = async (menuItem) => {
    await addToCart(menuItem, quantity, note);
  };

  // Cập nhật số lượng
  const handleUpdate = async (menuItemId, change) => {
    await updateQuantity(menuItemId, change);
  };

  return (
    <div>
      {cartItems.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity}
        </div>
      ))}
      <p>Total: {cartTotalAmount}₫</p>
    </div>
  );
}
```

## 🗄️ Database Setup

### 1. Chạy Schema Files (Theo thứ tự)

```bash
cd backend/database

# Option 1: Files có comments (cho psql command line)
psql -U postgres -d restaurant_db -f auth_schema.sql
psql -U postgres -d restaurant_db -f menu_schema.sql
psql -U postgres -d restaurant_db -f Cart.sql
psql -U postgres -d restaurant_db -f order_flow_schema.sql

# Option 2: Clean files (cho DB clients có issues với comments)
psql -U postgres -d restaurant_db -f auth_schema_clean.sql
psql -U postgres -d restaurant_db -f menu_schema_clean.sql
psql -U postgres -d restaurant_db -f Cart_clean.sql
psql -U postgres -d restaurant_db -f order_flow_schema_clean.sql
```

### 2. Verify Tables

```sql
\dt  -- List all tables

-- Should see:
-- carts
-- cart_items
-- (plus users, menu_items, orders, etc.)
```

## ⚙️ Environment Setup

### Backend (.env)
```env
PORT=5001
DATABASE_URL=postgresql://user:pass@localhost:5432/restaurant_db
SESSION_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3001
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## 🧪 Testing

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Flow
1. ✅ Browse menu (không login)
2. ✅ Add items to cart → Check network tab: POST /api/cart/items
3. ✅ View cart → Check: GET /api/cart
4. ✅ Update quantity → Check: PUT /api/cart/items/:id
5. ✅ Remove item → Check: DELETE /api/cart/items/:id
6. ✅ Login → Cart should persist
7. ✅ Logout & login lại → Cart vẫn còn
8. ✅ Open new browser/incognito → Cart mới cho guest

### 4. Test với cURL

```bash
# Get cart (cần cookies từ session)
curl http://localhost:5001/api/cart -b cookies.txt -c cookies.txt

# Add item
curl -X POST http://localhost:5001/api/cart/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"menu_item_id": 1, "quantity": 2}'

# Update quantity
curl -X PUT http://localhost:5001/api/cart/items/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"quantity": 3}'

# Remove item
curl -X DELETE http://localhost:5001/api/cart/items/1 -b cookies.txt

# Validate cart
curl http://localhost:5001/api/cart/validate -b cookies.txt
```

## 📝 Key Changes Summary

### Removed (SessionStorage-based cart)
- ❌ `sessionStorage.getItem(STORAGE_KEYS.CART_ITEMS)`
- ❌ `sessionStorage.setItem(STORAGE_KEYS.CART_ITEMS, ...)`
- ❌ Cart ownership check logic trong App.jsx
- ❌ Manual cart persistence trong MenuScreen

### Added (API-based cart)
- ✅ Backend: Cart Model, Service, Controller, Routes
- ✅ Frontend: `useCart()` custom hook
- ✅ API calls thay cho sessionStorage
- ✅ Server-side cart persistence
- ✅ Automatic session management

## 🐛 Troubleshooting

### Cart không load
```javascript
// Check browser console
console.log('Cart API response:', response);

// Check backend logs
// Should see: "Cart created/fetched for user/session"
```

### Items không thêm vào cart
- Kiểm tra `menu_items` table có data không  
- Kiểm tra `available = true` cho items
- Check network tab xem request có thành công không

### Session issues
- Đảm bảo `credentials: 'include'` trong fetch options
- Check CORS settings trong backend
- Xem cookies có được set không (Application tab)

## 📖 Documentation

- [CART_API.md](backend/database/CART_API.md) - Chi tiết API endpoints
- [SETUP_GUIDE.md](backend/database/SETUP_GUIDE.md) - Database setup guide

## ✅ Checklist

- [x] Database schema (Cart + Cart Items tables)
- [x] Backend API (Model, Service, Controller, Routes)
- [x] API validation (express-validator)
- [x] Frontend hook (useCart)
- [x] Refactor MenuScreen
- [x] Remove sessionStorage cart logic
- [x] API Documentation
- [x] Clean SQL files (no comments)

## 🎯 Next Steps

1. **Update CheckoutScreen** để sử dụng useCart hook
2. **Add loading states** khi cart đang sync
3. **Error handling** UI cho cart operations
4. **Cart badge animation** khi thêm items
5. **Persist note** cho special instructions
6. **Cart expiration** logic (optional)

## 🤝 Đóng góp

Nếu cần thay đổi gì, update các file sau:
- Backend logic: `backend/src/services/cartService.js`
- API endpoints: `backend/src/routes/cartRoutes.js`
- Frontend logic: `frontend/src/hooks/useCart.js`
- Database: `backend/database/Cart_clean.sql`

---

**Status:** ✅ Cart API hoàn thiện và sẵn sàng sử dụng!
