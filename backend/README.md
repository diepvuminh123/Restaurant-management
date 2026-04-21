# Restaurant Management System - Backend API

Backend API cho hệ thống quản lý nhà hàng

## 🛠 Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** 4.21.2 - Web framework
- **PostgreSQL** - Database
- **bcrypt** 6.0.0 - Password hashing
- **express-session** 1.18.2 - Session management
- **Joi** 18.0.1 - Input validation
- **Nodemon** 3.1.10 - Development auto-restart

## Cài Đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:

```env
# Server Configuration
PORT=
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=
DB_NAME=restaurant_db
DB_USER=
DB_PASSWORD=

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_change_this_in_production
SESSION_NAME=restaurant_session
SESSION_MAX_AGE=

# CORS Configuration
CORS_ORIGIN=
```

### 3. Khởi tạo Database

Xem hướng dẫn chi tiết tại: [database/README.md](./database/README.md)

### 4. Chạy Server

```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

### 5. Tu dong hoa don mang di va nhac nho qua email

Backend co scheduler tu dong chay theo chu ky de giam thao tac tay cho nhan vien:

- Tu dong huy don `PENDING` + `UNPAID` khi qua han dat coc.
- Tu dong chuyen `CONFIRMED -> PREPARING` khi gan gio nhan mon.
- Tu dong chuyen `CONFIRMED/PREPARING -> READY` khi den gio nhan mon.
- Tu dong chuyen `READY -> COMPLETED` sau mot khoang grace period.
- Moi lan he thong tu dong doi trang thai se gui email thong bao cho khach (neu co email).

Bien moi truong lien quan:

```env
TAKEAWAY_AUTOMATION_ENABLED=true
TAKEAWAY_AUTOMATION_INTERVAL_MS=60000
TAKEAWAY_UNPAID_TIMEOUT_MINUTES=20
TAKEAWAY_PREPARING_LEAD_MINUTES=30
TAKEAWAY_READY_TO_COMPLETED_MINUTES=90
```

Neu can tat scheduler tren moi truong nao do, set `TAKEAWAY_AUTOMATION_ENABLED=false`.
## 📡 API Endpoints

### Authentication

#### 1. Đăng ký (Register)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "role": "customer"  // customer | employee | admin
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user_id": 1,
    "username": "user123",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0123456789",
    "role": "customer",
    "created_at": "2025-11-11T10:00:00.000Z"
  }
}
```

#### 2. Đăng nhập (Login)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "userId": 1,
      "username": "user123",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0123456789",
      "role": "customer"
    }
  }
}
```

#### 3. Đăng xuất (Logout)
```http
POST /api/auth/logout
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

#### 4. Lấy thông tin user hiện tại
```http
GET /api/auth/me
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "username": "user123",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0123456789",
      "role": "customer",
      "createdAt": "2025-11-11T10:00:00.000Z"
    }
  }
}
```

#### 5. Kiểm tra trạng thái đăng nhập
```http
GET /api/auth/check
```

**Response Success:**
```json
{
  "success": true,
  "isAuthenticated": true,
  "data": {
    "userId": 1,
    "username": "user123",
    "role": "customer"
  }
}
```

## Authentication & Authorization

### Session-based Authentication

Hệ thống sử dụng session-based authentication với PostgreSQL làm session store:

- Session được lưu trong database (bảng `user_sessions`)
- Cookie được gửi về client với tên `restaurant_session`
- Session tự động hết hạn sau 24 giờ (có thể cấu hình)

### Role-based Authorization

Hệ thống có 3 loại role:

1. **customer** - Khách hàng
   - Đăng ký, đăng nhập
   - Xem menu, đặt món

2. **employee** - Nhân viên
   - Tất cả quyền của customer
   - Quản lý đơn hàng, bàn ăn

3. **admin** - Quản trị viên
   - Tất cả quyền của employee
   - Quản lý menu, nhân viên, báo cáo

### Middleware Sử Dụng

```javascript
const { requireAuth, requireRole } = require('./middlewares/auth');

// Yêu cầu đăng nhập
router.get('/protected', requireAuth, controller);

// Yêu cầu role cụ thể
router.get('/admin-only', requireRole('admin'), controller);

// Yêu cầu một trong nhiều role
router.get('/staff', requireRole('admin', 'employee'), controller);
```

## 📁 Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── config/          # Cấu hình database, session
│   ├── controllers/     # Xử lý logic API
│   ├── middlewares/     # Authentication, validation
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── validations/     # Joi schemas
│   └── app.js          # Entry point
├── database/           # SQL scripts
├── .env.example       # Environment template
└── package.json
```

## 🛡️ Validation

Tất cả input đều được validate bằng Joi schema:

- **Username**: 3-30 ký tự, chỉ chữ và số
- **Email**: Định dạng email hợp lệ
- **Password**: Tối thiểu 6 ký tự
- **Phone**: 10-11 chữ số (tùy chọn)
- **Role**: Chỉ chấp nhận customer, employee, admin
Tài liệu tham khảo: https://viblo.asia/p/verify-json-request-nodejs-voi-joi-V3m5WLpgKO7

## 🔒 Security

- Password được hash bằng bcrypt (salt rounds: 10)
- Session secret được lưu trong .env
- CORS được cấu hình cho frontend
- HttpOnly cookies để chống XSS
- Input validation cho tất cả endpoints

## 🧪 Testing

Có thể test API bằng:

### cURL

```bash
# Đăng ký
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","fullName":"Test User","role":"customer"}'

# Đăng nhập
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  -c cookies.txt

# Lấy thông tin user (cần cookie từ login)
curl http://localhost:5000/api/auth/me -b cookies.txt
```

### Postman / Thunder Client

Import các request trên và test trực tiếp trong VS Code hoặc Postman.




