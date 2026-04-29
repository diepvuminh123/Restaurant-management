# Báo cáo API Integration Test
Tài liệu này trình bày các kịch bản kiểm thử tích hợp API (API Integration Test) cho 2 module **Xác thực (Auth)** và **Quản trị Người dùng (UserAdmin)**. Các test sử dụng thư viện **Supertest** để mô phỏng client gửi request HTTP thật vào Express App, đồng thời **Mock Service Layer** để cô lập hoàn toàn khỏi Database.

Tổng số kịch bản đã test: **29 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## Kỹ thuật triển khai

| Thành phần | Kỹ thuật |
|---|---|
| HTTP Client | **Supertest** — gọi trực tiếp Express App, không cần dựng server |
| Session Store | Mock `connect-pg-simple` → chuyển sang **MemoryStore** |
| Database | Mock `config/database` → không kết nối PostgreSQL thật |
| Business Logic | Mock `AuthService` / `UserAdminService` → trả dữ liệu giả |

---

## Phần 1: Auth API (`/api/auth/*`)

### 1.1. Đăng ký (`POST /api/auth/register`)
- 🔴 **Validation:** Trả về `400 Bad Request` khi thiếu trường bắt buộc (username < 3 ký tự, thiếu email/password). Middleware Joi tự động sinh danh sách lỗi chi tiết.
- 🔴 **Service Error:** Trả về `400` khi Service ném lỗi (VD: Username đã tồn tại).
- 🟢 **Happy Path:** Trả về `201 Created` với dữ liệu user mới.

### 1.2. Đăng nhập (`POST /api/auth/login`)
- 🔴 **Validation:** Trả về `400` khi thiếu email.
- 🔴 **Auth Error:** Trả về `401 Unauthorized` khi sai mật khẩu.
- 🟢 **Happy Path:** Trả về `200` với `Set-Cookie` header chứa session ID. Dữ liệu trả về đúng format `{ success: true, data: { user: { userId, username, role } } }`.

### 1.3. Xác thực OTP (`POST /api/auth/verifyOtp`)
- 🔴 **Validation:** Bắn `400` khi mã OTP sai định dạng (chứa chữ thay vì số).
- 🟢 **Happy Path:** Trả về `200` với thông báo xác thực thành công.

### 1.4. Gửi OTP (`POST /api/auth/sendOtp`)
- 🔴 **Validation:** Bắn `400` nếu OTPType không hợp lệ.
- 🔴 **Not Found:** Trả về `404` nếu email không tồn tại.
- 🟢 **Happy Path:** Trả về `200`.

### 1.5. Reset Password (`POST /api/auth/resetPassword`)
- 🔴 **Validation:** Bắn `400` khi thiếu `newPassword`.
- 🟢 **Happy Path:** Trả về `201`.

### 1.6. Bảo vệ Route (Auth Middleware)
- 🔴 `POST /api/auth/logout` → `401` khi chưa đăng nhập.
- 🔴 `GET /api/auth/me` → `401` khi chưa đăng nhập.
- 🔴 `POST /api/auth/changePassword` → `401` khi chưa đăng nhập.
- 🔴 `PUT /api/auth/profile` → `401` khi chưa đăng nhập.

### 1.7. Kiểm tra trạng thái (`GET /api/auth/check`)
- 🟢 Trả về `{ isAuthenticated: false }` khi chưa đăng nhập (public endpoint).

### 1.8. Luồng đầy đủ (Login → Me → Logout)
- 🟢 **E2E Mini-Flow:** Đăng nhập → Lấy cookie → Gọi `/me` với cookie → Nhận dữ liệu user → Gọi `/logout` với cookie → Đăng xuất thành công.

---

## Phần 2: UserAdmin API (`/api/users/*`)

### 2.1. Phân quyền (Auth & Role Guards)
- 🔴 `GET /api/users` → `401` nếu chưa đăng nhập.
- 🔴 `PATCH /api/users/:id/role` → `401` nếu chưa đăng nhập.
- 🔴 `PATCH /api/users/:id/lock` → `401` nếu chưa đăng nhập.
- 🔴 `GET /api/users` → `403 Forbidden` nếu role là `customer` (không phải admin).

### 2.2. Danh sách User (`GET /api/users`)
- 🟢 Trả về `200` với danh sách users và pagination cho admin.

### 2.3. Cập nhật Role (`PATCH /api/users/:id/role`)
- 🟢 Trả về `200` với thông báo thành công.
- 🔴 Trả về `409` khi Service ném lỗi conflict (VD: tự thay đổi role chính mình).

### 2.4. Khóa/Mở khóa (`PATCH /api/users/:id/lock`)
- 🟢 Trả về `200` + message "Đã khóa tài khoản" khi `locked: true`.
- 🟢 Trả về `200` + message "Đã mở khóa tài khoản" khi `locked: false`.

---

## Phần 3: 404 Handler
- 🟢 Trả về `404` với message `"API endpoint không tồn tại"` cho bất kỳ URL nào không tồn tại.
