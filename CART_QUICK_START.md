# Quick Start - Cart API Testing

## 🚀 Setup ngay lập tức

### 1. Import Database Schema
```powershell
cd backend\database

# Sử dụng clean versions (không có comment)
psql -U postgres -d restaurant_db -f Cart_clean.sql
psql -U postgres -d restaurant_db -f order_flow_schema_clean.sql
```

### 2. Start Backend
```powershell
cd backend
npm start
```
Server chạy tại: `http://localhost:5001`

### 3. Start Frontend  
```powershell
cd frontend
npm run dev
```
Frontend chạy tại: `http://localhost:3001`

## ✅ Test Cart ngay

### Scenario 1: Guest User
1. Mở browser: `http://localhost:3001/menu`
2. Click "Thêm" vào một món
3. Click icon giỏ hàng ở header
4. Kiểm tra cart popup hiện ra với món vừa thêm
5. Tăng/giảm số lượng
6. Xóa món

### Scenario 2: User đăng nhập
1. Đăng nhập vào account
2. Thêm món vào cart
3. Đăng xuất
4. Đăng nhập lại → **Cart vẫn còn!** ✅

### Scenario 3: Cart Migration
1. Browse menu khi chưa login (guest)
2. Thêm vài món vào cart
3. Đăng nhập  
4. Cart của guest được chuyển sang account ✅

## 🔍 Debug với Browser DevTools

### Network Tab
```
GET    /api/cart              → Lấy giỏ hàng
POST   /api/cart/items        → Thêm món
PUT    /api/cart/items/1      → Cập nhật
DELETE /api/cart/items/1      → Xóa món
GET    /api/cart/validate     → Validate
```

### Console
```javascript
// Check cart data
console.log(cartItems);

// Check API response
// Should see: { success: true, data: { cart_id, items, ... } }
```

## 🐛 Common Issues

### Issue: Cart không load
**Solution:**
```sql
-- Check database
SELECT * FROM carts WHERE status = 'ACTIVE';
SELECT * FROM cart_items;
```

### Issue: CORS error  
**Solution:** Kiểm tra backend `.env`:
```env
CORS_ORIGIN=http://localhost:3001
```

### Issue: Session không work
**Solution:** Restart backend và clear browser cookies

## 📊 Verify Data

### SQL Queries
```sql
-- Xem tất cả carts
SELECT * FROM carts;

-- Xem cart items với details
SELECT 
  ci.*,
  mi.name,
  mi.price,
  mi.sale_price
FROM cart_items ci
JOIN menu_items mi ON ci.menu_item_id = mi.id;

-- Tính tổng tiền cart
SELECT 
  c.id,
  SUM(ci.quantity * COALESCE(mi.sale_price, mi.price)) as total
FROM carts c
JOIN cart_items ci ON c.id = ci.cart_id
JOIN menu_items mi ON ci.menu_item_id = mi.id
WHERE c.status = 'ACTIVE'
GROUP BY c.id;
```

## 🎯 Quick API Test với cURL

```bash
# 1. Get cart (tạo session)
curl http://localhost:5001/api/cart -c cookies.txt -b cookies.txt

# 2. Add item (menu_item_id = 1)
curl -X POST http://localhost:5001/api/cart/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"menu_item_id": 1, "quantity": 2, "note": "Không hành"}'

# 3. Get cart again (should have 1 item)
curl http://localhost:5001/api/cart -b cookies.txt

# 4. Validate cart
curl http://localhost:5001/api/cart/validate -b cookies.txt
```

## ✨ Expected Results

### GET /api/cart Response:
```json
{
  "success": true,
  "data": {
    "cart_id": 1,
    "user_id": null,
    "session_id": "abc123...",
    "status": "ACTIVE",
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "note": "Không hành",
        "name": "Phở Bò Đặc Biệt",
        "price": 85000,
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

## 📞 Need Help?

- Check [CART_IMPLEMENTATION.md](CART_IMPLEMENTATION.md) for full details
- Check [backend/database/CART_API.md](backend/database/CART_API.md) for API docs
- Check backend console logs for errors
- Check browser DevTools → Network & Console tabs

---

**Happy Testing! 🎉**
