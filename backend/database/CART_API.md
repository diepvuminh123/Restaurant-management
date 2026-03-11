# Cart API Documentation

## Overview
Cart API cho phép quản lý giỏ hàng của người dùng hoặc khách (guest). Hệ thống tự động phân biệt giữa user đã đăng nhập (qua `user_id` trong session) và guest (qua `session_id`).

## Endpoints

### 1. GET /api/cart
Lấy giỏ hàng hiện tại của user/guest

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

### 2. POST /api/cart/items
Thêm món vào giỏ hàng

**Request Body:**
```json
{
  "menu_item_id": 10,
  "quantity": 1,
  "note": "Không hành"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã thêm món vào giỏ hàng",
  "data": { /* cart with items */ }
}
```

### 3. PUT /api/cart/items/:id
Cập nhật item trong giỏ hàng

**Request Body:**
```json
{
  "quantity": 3,
  "note": "Ít đá"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã cập nhật giỏ hàng",
  "data": { /* cart with items */ }
}
```

### 4. DELETE /api/cart/items/:id
Xóa item khỏi giỏ hàng

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa món khỏi giỏ hàng",
  "data": { /* cart with items */ }
}
```

### 5. DELETE /api/cart
Xóa toàn bộ giỏ hàng

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa toàn bộ giỏ hàng",
  "data": { /* empty cart */ }
}
```

### 6. POST /api/cart/migrate
Chuyển giỏ hàng từ guest sang user khi đăng nhập

**Request Body:**
```json
{
  "guest_session_id": "abc123xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chuyển giỏ hàng sang tài khoản",
  "data": { /* merged cart */ }
}
```

### 7. GET /api/cart/validate
Kiểm tra giỏ hàng trước khi checkout

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "cart": { /* cart with items */ }
  }
}
```

## Frontend Integration

### Using ApiService

```javascript
import ApiService from './services/apiService';

// Lấy giỏ hàng
const cart = await ApiService.getCart();

// Thêm món vào giỏ
await ApiService.addItemToCart(menuItemId, quantity, note);

// Cập nhật số lượng
await ApiService.updateCartItem(cartItemId, { quantity: 3 });

// Xóa món
await ApiService.removeItemFromCart(cartItemId);

// Xóa toàn bộ giỏ
await ApiService.clearCart();

// Validate trước checkout
const validation = await ApiService.validateCart();
if (!validation.data.valid) {
  console.error(validation.data.errors);
}
```

## Migration Notes

### From sessionStorage to API

**Before (sessionStorage):**
```javascript
const cartItems = JSON.parse(sessionStorage.getItem('cartItems') || '[]');
```

**After (API):**
```javascript
const response = await ApiService.getCart();
const cartItems = response.data.items;
```

### Key Differences

1. **Data Format Change:**
   - Old: Simple array with `{id, name, price, quantity, imageUrl}`
   - New: Structured cart object with detailed item info from database

2. **Item ID:**
   - Old: `item.id` was the menu_item_id
   - New: `item.id` is cart_item_id, `item.menu_item_id` is the menu item

3. **Auto-sync:**
   - Cart is now server-side, automatically synced across sessions
   - No need to manually persist to sessionStorage

## Database Schema

### carts table
- `id` - Cart ID
- `user_id` - User ID (nullable for guests)
- `session_id` - Session ID for guests
- `status` - ACTIVE / CHECKED_OUT / CANCELED

### cart_items table
- `id` - Cart item ID
- `cart_id` - Reference to cart
- `menu_item_id` - Reference to menu item
- `quantity` - Item quantity
- `note` - Special instructions

## Error Handling

```javascript
try {
  await ApiService.addItemToCart(menuItemId, quantity);
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

## Testing

Use the provided test scripts or Postman collection to test all endpoints.

```bash
# Get cart
curl http://localhost:5001/api/cart -b cookies.txt

# Add item
curl -X POST http://localhost:5001/api/cart/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"menu_item_id": 1, "quantity": 2}'
```
