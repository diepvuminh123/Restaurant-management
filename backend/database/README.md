# Hướng dẫn khởi tạo Database

## Bước 1: Cài đặt PostgreSQL

Đảm bảo PostgreSQL đã được cài đặt trên máy:
- Download: https://www.postgresql.org/download/
- Hoặc dùng Docker: `docker run --name restaurant-postgres -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres`

## Bước 2: Tạo Database

Mở PostgreSQL command line hoặc pgAdmin và chạy:

```sql
CREATE DATABASE restaurant_db;
```

## Bước 3: Chạy Script Khởi Tạo

### Cách 1: Sử dụng psql command line

```bash
psql -U postgres -d restaurant_db -f database/init.sql
```

### Cách 2: Sử dụng pgAdmin

1. Mở pgAdmin
2. Kết nối đến database `restaurant_db`
3. Mở Query Tool
4. Copy nội dung file `init.sql` và chạy

## Bước 4: Cấu hình file .env

Copy file `.env.example` thành `.env` và cập nhật thông tin:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa file `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Bước 5: Tạo Hash Password Mới (Tùy chọn)

Script `init.sql` có password mẫu. Để tạo password mới, chạy trong Node.js:

```javascript
const bcrypt = require('bcrypt');

// Tạo hash cho password
bcrypt.hash('your_password', 10, (err, hash) => {
  console.log(hash);
});
```

## Tài Khoản Mặc Định

Sau khi chạy script, bạn có thể đăng nhập với các tài khoản sau:

### Admin
- Username: `admin`
- Password: `admin123`
- Role: `admin`

### Employee
- Username: `employee1`
- Password: `employee123`
- Role: `employee`

### Customer
- Username: `customer1`
- Password: `customer123`
- Role: `customer`

**LƯU Ý**: Đổi password mặc định sau khi khởi tạo hệ thống!
