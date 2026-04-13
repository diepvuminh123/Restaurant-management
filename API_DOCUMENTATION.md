# 📚 API Documentation - Swagger UI

> Trang quản lý và test toàn bộ API của hệ thống Restaurant Management

---

## 🚀 Truy cập API Documentation

### Local Development
```
http://localhost:5001/api-docs
```

### Production
```
https://api.restaurant.com/api-docs
```

---

## 📋 Tính năng

✅ **Xem tất cả API endpoints** - Danh sách đầy đủ APIs theo từng module  
✅ **Test APIs trực tiếp** - Gọi API ngay trên browser không cần Postman  
✅ **Xem Request/Response** - Schema, examples, validation rules  
✅ **Authentication** - Test với session cookie  
✅ **Auto-sync** - Tự động cập nhật khi code thay đổi  

---

## 🗂️ API Modules

### 🔐 Auth APIs
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/sendOtp` - Gửi OTP
- `POST /api/auth/verifyOtp` - Xác thực OTP
- `POST /api/auth/resetPassword` - Reset mật khẩu
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập

### 🍽️ Menu APIs
- `GET /api/menu/sections` - Lấy danh sách sections
- `POST /api/menu/sections` - Tạo section mới
- `PUT /api/menu/sections/:id` - Cập nhật section
- `DELETE /api/menu/sections/:id` - Xóa section
- `GET /api/menu/categories` - Lấy danh sách categories
- `GET /api/menus` - Lấy danh sách món ăn (with filters)
- `GET /api/menus/:id` - Lấy chi tiết món ăn
- `POST /api/menus` - Tạo món ăn mới
- `PUT /api/menus/:id` - Cập nhật món ăn
- `DELETE /api/menus/:id` - Xóa món ăn
- `POST /api/menus/upload/:id/image` - Upload hình ảnh

### 🛒 Cart APIs
- `GET /api/cart` - Lấy giỏ hàng hiện tại
- `POST /api/cart/items` - Thêm món vào giỏ
- `PUT /api/cart/items/:id` - Cập nhật item trong giỏ
- `DELETE /api/cart/items/:id` - Xóa item khỏi giỏ
- `DELETE /api/cart` - Xóa toàn bộ giỏ hàng
- `POST /api/cart/migrate` - Migrate guest cart → user cart
- `GET /api/cart/validate` - Validate cart trước checkout

### 🏪 Restaurant APIs
- `GET /api/restaurant-info` - Lấy thông tin nhà hàng
- `POST /api/restaurant-info` - Tạo thông tin nhà hàng
- `PUT /api/restaurant-info/:id` - Cập nhật thông tin nhà hàng

---

## 🧪 Cách sử dụng

### 1. Xem API Documentation
1. Mở browser: `http://localhost:5001/api-docs`
2. Bạn sẽ thấy giao diện Swagger UI với danh sách APIs

### 2. Test API không cần authentication
**Ví dụ: Get Menu Items**
1. Click vào `GET /api/menus`
2. Click nút **"Try it out"**
3. Nhập parameters (optional): `section_id=1`, `page=1`, `limit=10`
4. Click **"Execute"**
5. Xem Response bên dưới

### 3. Test API cần authentication
**Ví dụ: Get Current User**
1. Đăng nhập trước qua frontend hoặc Swagger:
   - Click `POST /api/auth/login`
   - Try it out → Nhập email/password → Execute
   - Cookie session sẽ được lưu tự động
2. Sau đó test API cần auth:
   - Click `GET /api/auth/me`
   - Try it out → Execute
   - Sẽ trả về thông tin user đã đăng nhập

### 4. Test Cart APIs (Guest)
1. Click `POST /api/cart/items`
2. Try it out
3. Nhập body:
   ```json
   {
     "menu_item_id": 1,
     "quantity": 2,
     "note": "Không hành"
   }
   ```
4. Execute → Session cookie sẽ được tạo tự động
5. Click `GET /api/cart` → Xem giỏ hàng vừa tạo

---

## 📖 Schema Documentation

### User Schema
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com",
  "role": "customer",
  "created_at": "2026-03-12T10:30:00Z"
}
```

### MenuItem Schema
```json
{
  "id": 1,
  "name": "Phở Bò",
  "description": "Phở bò truyền thống Hà Nội",
  "price": 85000,
  "sale_price": 75000,
  "images": ["/images/pho-bo.jpg"],
  "category_id": 1,
  "available": true
}
```

### Cart Schema
```json
{
  "cart_id": 1,
  "user_id": 5,
  "session_id": null,
  "status": "ACTIVE",
  "items": [...],
  "item_count": "2",
  "total_quantity": "5",
  "total_amount": "425000.00"
}
```

### RestaurantInfo Schema
```json
{
  "id": 1,
  "name": "Nha Hang ABC",
  "slogan": "Huong vi Viet trong tung mon an",
  "logo_url": "https://example.com/logo.png",
  "brand_image_url": "https://example.com/banner.png",
  "address_line": "123 Le Loi, Quan 1, TP.HCM",
  "contact_phone": "0909123456",
  "contact_email": "contact@restaurant.com",
  "opening_time": "08:00:00",
  "closing_time": "22:00:00",
  "created_at": "2026-04-14T09:00:00Z",
  "updated_at": "2026-04-14T09:00:00Z"
}
```

---

## ⚙️ Configuration

### Swagger Config
File: `backend/src/config/swagger.js`

**Servers:**
- Development: `http://localhost:5001`
- Production: `https://api.restaurant.com`

**Security:**
- Cookie-based authentication (session)
- Cookie name: `restaurant_session`

**API Sources:**
- `./src/routes/*.js` - Route definitions
- `./src/controllers/*.js` - Controller implementations

---

## 🔧 Maintenance

### Thêm API mới vào docs
Thêm JSDoc comment trong route file:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Your endpoint description
 *     description: Detailed description
 *     tags: [YourModule]
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.get('/your-endpoint', Controller.method);
```

### Update Schema
Cập nhật schemas trong `backend/src/config/swagger.js` → `components.schemas`

### Reload Documentation
Swagger tự động reload khi:
- Save file routes
- Restart server (nodemon auto-restart)

---

## 📚 Swagger Syntax Reference

### Common Parameters
```yaml
parameters:
  - in: query/path/header/cookie
    name: param_name
    required: true/false
    schema:
      type: string/integer/number/boolean
      enum: [value1, value2]
      minimum: 1
      maximum: 100
    description: Parameter description
```

### Request Body
```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [field1, field2]
        properties:
          field1:
            type: string
            example: "value"
```

### Responses
```yaml
responses:
  200:
    description: Success
    content:
      application/json:
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              $ref: '#/components/schemas/YourSchema'
```

### Security (Authentication)
```yaml
security:
  - cookieAuth: []
```

---

## 🐛 Troubleshooting

### Swagger UI không hiển thị
**Kiểm tra:**
```bash
# 1. Server có đang chạy?
curl http://localhost:5001

# 2. Swagger spec có lỗi?
curl http://localhost:5001/api-docs/swagger.json

# 3. Check console logs
npm start
```

### API không xuất hiện trong docs
**Nguyên nhân:**
- JSDoc comment sai syntax
- Route chưa được scan (check `apis` trong swagger.js)
- Chưa restart server

**Giải pháp:**
```bash
# Restart server
cd backend
npm start
```

### Test API không hoạt động
**CORS issues:**
- Check `CORS_ORIGIN` trong `.env`
- Đảm bảo `credentials: true` trong CORS config

**Session issues:**
- Đăng nhập trước khi test protected APIs
- Check cookie được set trong Response headers

---

## 📊 Statistics

**Total APIs Documented:** 27+  
**Modules:** Auth (8), Menu (10+), Cart (7), Restaurant (2)  
**Response Schemas:** 5 (Error, User, MenuItem, Cart, RestaurantInfo)  
**Last Updated:** April 14, 2026

---

## 🔗 Related Files

- `backend/src/config/swagger.js` - Swagger configuration
- `backend/src/routes/*.js` - API route definitions with JSDoc
- `backend/src/app.js` - Swagger UI registration
- `CART_FLOW_GUIDE.md` - Chi tiết Cart API flow

---

## 💡 Tips

1. **Bookmark** `http://localhost:5001/api-docs` để truy cập nhanh
2. **Use "Try it out"** thay vì Postman cho dev nhanh
3. **Copy curl commands** từ Swagger UI để chạy trong terminal
4. **Export OpenAPI spec** (JSON) để share với team hoặc generate client SDKs
5. **Dark mode**: Click icon ở góc phải trên Swagger UI

---

**Built with:** Swagger UI + swagger-jsdoc + OpenAPI 3.0  
**Version:** 1.0.0
