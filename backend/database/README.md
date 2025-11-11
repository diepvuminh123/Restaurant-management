# Hướng dẫn khởi tạo Database

## Bước 1: Cài đặt PostgreSQL

Đảm bảo PostgreSQL đã được cài đặt trên máy:
- Download: https://www.postgresql.org/download/
Nhớ cài đặt extension PostgreSQL;
<img width="913" height="162" alt="image" src="https://github.com/user-attachments/assets/eae790bf-27bf-452f-87d3-cf23d4a0c4bf" />

## Bước 2: Tạo Database

Mở PostgreSQL command line hoặc pgAdmin và chạy:

```sql
CREATE DATABASE restaurant_db;
```

## Bước 3: Chạy Script Khởi Tạo

### Sử dụng pgAdmin

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


