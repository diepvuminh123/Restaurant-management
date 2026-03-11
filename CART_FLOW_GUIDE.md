# 🛒 Cart System - Complete Flow Guide

> **Hướng dẫn đầy đủ về hệ thống giỏ hàng và flow đặt món**

---

## 📋 Tổng quan

Hệ thống giỏ hàng được triển khai hoàn toàn trên **server-side** với PostgreSQL, hỗ trợ:
- ✅ Guest users (session-based)
- ✅ Logged-in users (user_id-based)
- ✅ Auto migration khi guest đăng nhập
- ✅ Cart validation trước checkout
- ✅ Order creation với snapshot items

---

## 🗂️ Cấu trúc Files

### Backend
```
backend/
├── src/
│   ├── models/Cart.js              # DB queries, transactions
│   ├── services/cartService.js     # Business logic
│   ├── controllers/cartController.js  # HTTP handlers
│   ├── routes/cartRoutes.js        # API routes
│   ├── validations/cartValidation.js  # Joi schemas
│   └── app.js                      # Registered cart routes
└── database/
    ├── Cart_clean.sql              # Cart schema
    └── order_flow_schema_clean.sql # Orders schema
```

### Frontend
```
frontend/src/
├── hooks/useCart.js                # Custom cart hook
├── services/apiService.js          # API methods
├── screen/MenuScreen/MenuScreen.jsx  # Uses useCart
└── App.jsx                         # Removed sessionStorage logic
```

---

## 🚀 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/api/cart` | Optional | Lấy giỏ hàng hiện tại |
| **POST** | `/api/cart/items` | Optional | Thêm món vào giỏ |
| **PUT** | `/api/cart/items/:id` | Optional | Cập nhật item (quantity/note) |
| **DELETE** | `/api/cart/items/:id` | Optional | Xóa item khỏi giỏ |
| **DELETE** | `/api/cart` | Optional | Xóa toàn bộ giỏ |
| **POST** | `/api/cart/migrate` | Required | Migrate guest cart → user cart |
| **GET** | `/api/cart/validate` | Optional | Validate giỏ trước checkout |

### 1️⃣ GET /api/cart
**Lấy giỏ hàng hiện tại**

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_id": 1,
    "user_id": 5,
    "session_id": null,
    "status": "ACTIVE",
    "items": [
      {
        "id": 1,
        "menu_item_id": 10,
        "quantity": 2,
        "note": "Không hành",
        "name": "Phở Bò",
        "price": 85000,
        "sale_price": null,
        "images": ["/images/pho-bo.jpg"],
        "available": true
      }
    ],
    "item_count": "1",
    "total_quantity": "2",
    "total_amount": "170000.00"
  }
}
```

### 2️⃣ POST /api/cart/items
**Thêm món vào giỏ**

**Request Body:**
```json
{
  "menu_item_id": 10,
  "quantity": 1,
  "note": "Không hành"  // optional, cho phép null hoặc ""
}
```

**Validation:**
- `menu_item_id`: required, integer, min: 1
- `quantity`: optional, integer, min: 1, max: 99, default: 1
- `note`: optional, string, max: 500 chars, allow: '', null

**Response:**
```json
{
  "success": true,
  "message": "Đã thêm món vào giỏ hàng",
  "data": { /* cart with items */ }
}
```

### 3️⃣ PUT /api/cart/items/:id
**Cập nhật item trong giỏ**

**Request Body:**
```json
{
  "quantity": 3,      // optional
  "note": "Ít đá"     // optional
}
```

### 4️⃣ DELETE /api/cart/items/:id
**Xóa món khỏi giỏ**

### 5️⃣ DELETE /api/cart
**Xóa toàn bộ giỏ hàng**

### 6️⃣ POST /api/cart/migrate
**Migrate guest cart sang user cart khi login**

**Request Body:**
```json
{
  "guest_session_id": "session_12345"
}
```

### 7️⃣ GET /api/cart/validate
**Validate cart trước checkout** (kiểm tra available, price changes)

---

## 🔄 Order Flow - Luồng đặt món chi tiết

### Flow 1: Guest User (Chưa đăng nhập)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Browse Menu                                              │
│    GET /api/menus?section_id=1                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Add Item to Cart (Guest)                                 │
│    POST /api/cart/items                                     │
│    {                                                        │
│      menu_item_id: 10,                                      │
│      quantity: 2,                                           │
│      note: "Không hành"                                     │
│    }                                                        │
│                                                             │
│    → Backend tạo cart với session_id                        │
│    → Status: ACTIVE                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Update Quantity                                          │
│    PUT /api/cart/items/1                                    │
│    { quantity: 3 }                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User Login                                               │
│    POST /api/auth/login                                     │
│    → Session nhận userId                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Auto Cart Migration (Backend)                            │
│    → Cart Model migrateGuestCartToUser()                    │
│    → Merge guest cart items vào user cart                   │
│    → Nếu trùng món: cộng quantity                          │
│    → Xóa guest cart sau khi migrate                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. View Cart                                                │
│    GET /api/cart                                            │
│    → Hiển thị tất cả items đã merge                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Validate Cart (Before Checkout)                          │
│    GET /api/cart/validate                                   │
│    → Kiểm tra món còn available không                       │
│    → Kiểm tra giá có thay đổi không                        │
│    → Return warnings/errors                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Checkout - Create Order                                  │
│    POST /api/orders                                         │
│    {                                                        │
│      customer_name: "Nguyễn Văn A",                        │
│      customer_phone: "0901234567",                         │
│      delivery_address: "123 ABC",                          │
│      payment_method: "CASH"                                │
│    }                                                        │
│                                                             │
│    → Backend:                                               │
│      1. Create order với cart_id                            │
│      2. Copy cart_items → order_items (snapshot)            │
│      3. Update cart status = 'CHECKED_OUT'                  │
│      4. Order status = 'PENDING'                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Order Success                                            │
│    → Redirect to /order-success?orderId=123                 │
│    → Cart tự động clear (status CHECKED_OUT)                │
│    → User có thể order tiếp (tạo cart mới)                 │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Logged-in User

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Login                                               │
│    POST /api/auth/login                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Browse Menu & Add to Cart                                │
│    → Cart lưu với user_id                                   │
│    → Sync across devices/sessions                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Checkout → Create Order                                  │
│    → Same as Guest flow step 8-9                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend Implementation

### 1. Sử dụng useCart Hook

```jsx
import { useCart } from '../hooks/useCart';

function MenuScreen() {
  const {
    cartItems,         // Array of transformed items
    cartTotalCount,    // Total quantity
    cartTotalAmount,   // Total price
    addToCart,         // async (menuItem, quantity, note)
    updateQuantity,    // async (cartItemId, change)
    removeFromCart,    // async (cartItemId)
    clearCart,         // async ()
    validateCart,      // async ()
    loading,           // boolean
    error              // string | null
  } = useCart();

  // Thêm món
  const handleAddToCart = async (dish) => {
    await addToCart(dish, 1, '');
  };

  // Cập nhật số lượng
  const handleUpdateQuantity = async (cartItemId, change) => {
    await updateQuantity(cartItemId, change);
  };

  // Xóa món
  const handleRemove = async (cartItemId) => {
    await removeFromCart(cartItemId);
  };

  return (
    <div>
      {cartItems.map(item => (
        <CartItem 
          key={item.cartItemId}
          item={item}
          onUpdate={handleUpdateQuantity}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}
```

### 2. Cart Item Structure (Transformed)

```javascript
{
  id: 10,                   // menu_item_id
  cartItemId: 1,            // cart_item.id (để update/delete)
  name: "Phở Bò",
  price: 85000,
  imageUrl: "/images/pho-bo.jpg",
  quantity: 2,
  note: "Không hành",
  available: true
}
```

### 3. API Service Methods

```javascript
// frontend/src/services/apiService.js

// Lấy giỏ hàng
await ApiService.getCart();

// Thêm món
await ApiService.addItemToCart(menuItemId, quantity, note);

// Cập nhật
await ApiService.updateCartItem(cartItemId, { quantity, note });

// Xóa món
await ApiService.removeItemFromCart(cartItemId);

// Xóa toàn bộ
await ApiService.clearCart();

// Migrate
await ApiService.migrateCart(guestSessionId);

// Validate
await ApiService.validateCart();
```

---

## 🗄️ Database Schema

### Table: carts
```sql
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),      -- NULL cho guest
  session_id VARCHAR(255),                   -- Session ID cho guest
  status VARCHAR(20) DEFAULT 'ACTIVE',       -- ACTIVE | CHECKED_OUT | ABANDONED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, status),                   -- 1 user chỉ có 1 ACTIVE cart
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);
```

### Table: cart_items
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cart_id, menu_item_id)             -- Không trùng món trong 1 cart
);
```

### View: v_active_carts
```sql
CREATE VIEW v_active_carts AS
SELECT c.*, COUNT(ci.id) as item_count
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
WHERE c.status = 'ACTIVE'
GROUP BY c.id;
```

---

## ⚙️ Backend Implementation

### Cart Model (Cart.js)

**Key Methods:**
```javascript
// Tạo hoặc lấy cart
await Cart.findOrCreateActiveCart(userId, sessionId);

// Lấy cart với items + menu details
await Cart.getCartWithItems(cartId);

// Thêm item (có transaction)
await Cart.addItem(cartId, menuItemId, quantity, note);

// Update quantity
await Cart.updateItemQuantity(cartItemId, cartId, quantity);

// Remove item
await Cart.removeItem(cartItemId, cartId);

// Clear cart
await Cart.clearCart(cartId);

// Migrate guest → user
await Cart.migrateGuestCartToUser(sessionId, userId);

// Calculate totals
await Cart.calculateCartTotal(cartId);
```

### Cart Service (cartService.js)

**Business Logic:**
```javascript
// Get cart với totals
await CartService.getCurrentCart(userId, sessionId);

// Add item với validation
await CartService.addItemToCart(userId, sessionId, menuItemId, quantity, note);

// Validate cart
await CartService.validateCart(userId, sessionId);
```

---

## 🧪 Testing Quick Start

### 1. Import Database Schema

```bash
cd backend/database
psql -U postgres -d restaurant_db -f Cart_clean.sql
psql -U postgres -d restaurant_db -f order_flow_schema_clean.sql
```

### 2. Start Servers

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Test Flow

1. **Open browser:** http://localhost:3001/menu
2. **Add items** (as guest) → Check Network tab: `POST /api/cart/items`
3. **View cart** → `GET /api/cart`
4. **Login** → Cart auto migrates
5. **Checkout** → Creates order, cart status → CHECKED_OUT

### 4. Check Database

```sql
-- Xem carts
SELECT * FROM v_active_carts;

-- Xem cart items
SELECT c.id, c.user_id, ci.menu_item_id, ci.quantity, mi.name
FROM carts c
JOIN cart_items ci ON c.id = ci.cart_id
JOIN menu_items mi ON ci.menu_item_id = mi.id;

-- Xem cart totals
SELECT * FROM Cart.calculateCartTotal(1);
```

---

## 🐛 Common Issues

### Issue 1: "Dữ liệu không hợp lệ" khi add to cart

**Nguyên nhân:** Validation không cho phép `note = null`

**Giải pháp:** 
```javascript
// cartValidation.js
note: Joi.string().trim().max(500).allow('', null).optional()
```

### Issue 2: Express-validator vs Joi

**Nguyên nhân:** Project dùng Joi, không phải express-validator

**Giải pháp:** Check `ISSUES_LOG.md`

---

## 📚 Related Files

- `ISSUES_LOG.md` - Log các vấn đề đã gặp và giải pháp
- `TEAM_GUIDE.md` - Hướng dẫn cho team
- `backend/database/SETUP_GUIDE.md` - Database setup

---

## ✅ Checklist

### Backend
- [x] Cart Model với transactions
- [x] Cart Service với business logic  
- [x] Cart Controller với 7 endpoints
- [x] Joi validation schemas
- [x] Routes registered trong app.js
- [x] Database schema (clean version)

### Frontend
- [x] useCart custom hook
- [x] ApiService cart methods
- [x] MenuScreen refactored
- [x] Removed sessionStorage logic

### Testing
- [ ] Test guest cart → login → migration
- [ ] Test cart validation
- [ ] Test checkout flow
- [ ] Test edge cases (sold out items, price changes)

---

## 🚀 Next Steps

1. **Refactor CheckoutScreen** để dùng `useCart` thay vì `location.state`
2. **Add loading indicators** cho cart operations
3. **Add toast notifications** cho success/error
4. **Test cart persistence** across page refreshes
5. **Implement abandoned cart cleanup** (cron job)

---

**Updated:** March 12, 2026  
**Version:** 1.0
