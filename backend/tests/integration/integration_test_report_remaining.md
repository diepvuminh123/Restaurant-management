# Báo cáo API Integration Test 

Tổng số kịch bản đã test: **48 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## Phần 1: Order API (`/api/orders/*`)

### Tạo đơn hàng (`POST /api/orders`)
- 🔴 `403 Forbidden` — Tài khoản admin bị chặn tạo đơn mang đi (quy tắc nghiệp vụ của Controller).
- 🔴 `400 Bad Request` — Thiếu trường bắt buộc (Joi validation chặn).
- 🟢 `201 Created` — Tạo đơn thành công.

### Phân quyền Staff (`GET /api/orders`, `PATCH .../status`, `.../deposit-confirm`, `.../cancel`, `.../note`)
- 🔴 `401` — Chưa đăng nhập.
- 🔴 `403` — Customer không có quyền truy cập các endpoint dành cho Staff.
- 🟢 `200` — Employee/Admin truy cập thành công.

### Đơn hàng User (`GET /api/orders/my`, `PATCH /api/orders/my/:id/cancel`)
- 🔴 `401` — Chưa đăng nhập.
- 🟢 `200` — User xem và hủy đơn hàng thành công.

### Tra cứu công khai (`GET /api/orders/lookup`)
- 🟢 `200` — Guest tra cứu đơn bằng mã đơn/SĐT/email.

**Coverage:** `orderController.js` → **53.84% Statements, 90.9% Functions**

---

## Phần 2: Reservation API (`/api/reservations/*`)

### Khách hàng
- 🟢 `POST /api/reservations` → `201` đặt bàn thành công.
- 🔴 `POST /api/reservations` → `400` khi Service ném lỗi.
- 🔴 `GET /api/reservations/history` → `401` chưa đăng nhập.
- 🟢 `GET /api/reservations/history` → `200` xem lịch sử.
- 🔴 `DELETE .../cancel` → `401` chưa đăng nhập.
- 🟢 `DELETE .../cancel` → `200` hủy bàn thành công.

### Nhân viên (requireRole)
- 🔴 `GET /api/reservations/staff` → `401`/`403` (chưa login / sai role).
- 🟢 `GET /api/reservations/staff` → `200` cho employee.
- 🟢 `POST .../staff/createReservation` → `201` nhân viên đặt bàn hộ.
- 🟢 `PUT .../staff/updateReservationStatus/:id` → `200` cập nhật trạng thái.

**Coverage:** `reservationController.js` → **51.28% Statements, 77.77% Functions**

---

## Phần 3: Review API (`/api/reviews/*`)

### CRUD Review (requireAuth)
- 🔴 `POST /api/reviews` → `401` chưa đăng nhập.
- 🔴 `POST /api/reviews` → `400` Joi validation thất bại.
- 🟢 `POST /api/reviews` → `201` tạo review thành công.
- 🟢 `PATCH /api/reviews/:id` → `200` cập nhật.
- 🟢 `DELETE /api/reviews/:id` → `200` xóa.

### Public & Report
- 🟢 `GET /api/menus/:id/reviews` → `200` xem review công khai.
- 🔴 `POST /api/reviews/:id/reports` → `401` chưa đăng nhập.
- 🟢 `POST /api/reviews/:id/reports` → `201` report thành công.

### Admin Routes
- 🔴 `GET /api/admin/reviews/reported` → `401`/`403`.
- 🟢 `GET /api/admin/reviews/reported` → `200` cho admin.
- 🟢 `PATCH /api/admin/reviews/:id/visibility` → `200` ẩn review + đúng message.

**Coverage:** `reviewController.js` → **67.64% Statements, 87.5% Functions**

---

## Phần 4: Restaurant Info API (`/api/restaurant-info/*`)

- 🟢 `GET /api/restaurant-info` → `200` (public, không cần login).
- 🔴 `POST /api/restaurant-info` → `401`/`403` (chưa login / sai role).
- 🟢 `POST /api/restaurant-info` → `201` cho admin.
- 🔴 `POST /api/restaurant-info` → `409` khi info đã tồn tại.
- 🔴 `PUT /api/restaurant-info/:id` → `401` chưa đăng nhập.
- 🟢 `PUT /api/restaurant-info/:id` → `200` cho admin.

**Coverage:** `restaurantInfoController.js` → **50% Statements, 66.66% Functions**
