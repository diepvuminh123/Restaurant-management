# Báo cáo API Integration Test 

Tài liệu này trình bày các kịch bản kiểm thử tích hợp API cho 2 module **Thực đơn (Menu)** và **Giỏ hàng (Cart)**. Tất cả đều sử dụng **Supertest** gửi request HTTP thật vào Express App + **Mock Service Layer**.

Tổng số kịch bản đã test: **38 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## Phần 1: Menu API (`/api/menus/*`, `/api/menu/sections/*`, `/api/menu/categories/*`)

### 1.1. Truy vấn Danh sách (GET)
- 🟢 `GET /api/menu/sections` → `200` trả về danh sách Section.
- 🔴 `GET /api/menu/categories` → `400` nếu thiếu `section_id`.
- 🟢 `GET /api/menu/categories?section_id=1` → `200` trả về danh sách Category.
- 🟢 `GET /api/menus?page=1&limit=10` → `200` trả về menu items + pagination.

### 1.2. Chi tiết & CRUD Món ăn
- 🟢 `GET /api/menus/:id` → `200` trả về chi tiết món ăn.
- 🔴 `GET /api/menus/999` → `404` khi Service ném "Món ăn không tồn tại".
- 🟢 `POST /api/menus` → `201` tạo món mới thành công.
- 🔴 `POST /api/menus` → `400` khi Joi validation thất bại (thiếu name/price).
- 🟢 `PUT /api/menus/:id` → `200` cập nhật thành công.
- 🔴 `PUT /api/menus/999` → `404` khi không tìm thấy.
- 🟢 `PATCH /api/menus/:id/availability` → `200` cập nhật trạng thái.
- 🔴 `PATCH /api/menus/999/availability` → `404` khi không tìm thấy.
- 🟢 `DELETE /api/menus/:id` → `200` xóa thành công.
- 🔴 `DELETE /api/menus/999` → `404` khi không tìm thấy.

### 1.3. CRUD Section & Category
- 🟢 `POST /api/menu/sections` → `201`.
- 🟢 `PUT /api/menu/sections/:id` → `200`.
- 🔴 `PATCH /api/menu/sections/:id/order` → `400` khi thiếu `sort_order`.
- 🟢 `PATCH /api/menu/sections/:id/order` → `200`.
- 🟢 `DELETE /api/menu/sections/:id` → `200`.
- 🔴 `DELETE /api/menu/sections/999` → `404`.
- 🟢 `POST /api/menu/categories` → `201`.
- 🟢 `PUT /api/menu/categories/:id` → `200`.
- 🟢 `DELETE /api/menu/categories/:id` → `200`.
- 🔴 `DELETE /api/menu/categories/999` → `404`.

### Coverage đạt được
- `menuController.js`: **69.64% Statements, 88.23% Functions**

---

## Phần 2: Cart API (`/api/cart/*`)

### 2.1. Giỏ hàng Guest & User
- 🟢 `GET /api/cart` → `200` (Guest — không cần đăng nhập nhờ `optionalAuth`).
- 🟢 `GET /api/cart` với Cookie → `200` (User — sau khi đăng nhập).
- 🔴 `GET /api/cart` → `500` khi Service lỗi.

### 2.2. Thao tác Item (CRUD)
- 🔴 `POST /api/cart/items` → `400` khi thiếu `menu_item_id`.
- 🟢 `POST /api/cart/items` → `200` thêm món thành công.
- 🟢 `PUT /api/cart/items/:id` → `200` cập nhật thành công.
- 🔴 `PUT /api/cart/items/:id` → `500` khi lỗi.
- 🟢 `DELETE /api/cart/items/:id` → `200` xóa 1 món.
- 🟢 `DELETE /api/cart` → `200` xóa toàn bộ giỏ.

### 2.3. Migrate & Validate
- 🔴 `POST /api/cart/migrate` → `401` nếu chưa đăng nhập (Controller check thủ công `req.session.userId`).
- 🟢 `POST /api/cart/migrate` với Cookie → `200` chuyển giỏ hàng guest sang user thành công.
- 🟢 `GET /api/cart/validate` → `200` trả kết quả validate.

### Coverage đạt được
- `cartController.js`: **77.41% Statements, 100% Functions**
