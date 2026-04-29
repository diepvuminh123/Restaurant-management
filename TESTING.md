# Hướng Dẫn Kiểm Thử (Testing Guide)

Tài liệu này cung cấp hướng dẫn chi tiết về cách chạy các bài kiểm thử (test) cho dự án Restaurant Management. Hiện tại, chiến lược kiểm thử của dự án đang tập trung chủ yếu vào **Backend (Node.js + Express)** và quy trình **End-to-End (E2E) bằng Playwright**.

---

## 1. Kiểm thử Backend (Node.js + Express)

Backend sử dụng **Jest** làm framework kiểm thử chính và **Supertest** để kiểm thử tích hợp (Integration Test) cho các API RESTful. Chúng ta đã hoàn thành kiểm thử Unit Test cho các Core Service (Auth, Menu, Cart, Order, Automation, Info, và Review).

### Yêu cầu trước khi test
Đảm bảo bạn đã cài đặt đủ các gói phụ thuộc trong thư mục `backend`:
```bash
cd backend
npm install
```
*Lưu ý: Thiết lập file `.env` chứa các biến môi trường cấu hình Database hoặc Mock Database.*

### Các lệnh kiểm thử Backend

- **Chạy toàn bộ test suite:**
  ```bash
  cd backend
  npm test
  ```
  Lệnh này thiết lập `NODE_ENV=test`, chạy Jest đồng bộ (`--runInBand`) và phát hiện các connection chưa đóng (`--detectOpenHandles`).

- **Chạy một file test cụ thể:**
  Ví dụ bạn muốn chạy riêng file test của order service:
  ```bash
  cd backend
  npx jest src/services/orderService.test.js
  ```

- **Xem báo cáo độ phủ mã (Code Coverage):**
  Lệnh này giúp xuất báo cáo Coverage (đã được sử dụng để phân tích các module chưa được test):
  ```bash
  cd backend
  npx jest --coverage
  ```
  *Báo cáo sẽ được xuất ra terminal và giao diện web tại `coverage/lcov-report/index.html`.*

---

## 2. Kiểm thử End-to-End (E2E) với Playwright

Dự án sử dụng **Playwright** để kiểm thử các luồng người dùng (User Flows) quan trọng từ đầu đến cuối. Playwright tự động mở trình duyệt thực (Chromium), thực hiện các thao tác click, điền form như một người dùng thật để đảm bảo tích hợp giữa Frontend và Backend hoạt động trơn tru.

### Cấu trúc thư mục E2E

```
Restaurant-management/
├── e2e/
│   └── tests/
│       ├── login.spec.js           # Test luồng đăng nhập
│       ├── booking.spec.js         # Test luồng đặt bàn (khách vãng lai)
│       └── takeaway-order.spec.js  # Test luồng đặt món mang về
├── playwright.config.js            # Cấu hình Playwright
```

### Yêu cầu trước khi test E2E

1. **Cài đặt Playwright** (chỉ cần lần đầu):
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Khởi động Backend + Frontend** trước khi chạy test:
   ```bash
   # Terminal 1: Backend (port 5001)
   cd backend && npm run dev

   # Terminal 2: Frontend (port 3000)
   cd frontend && npm run dev
   ```
   Hoặc chạy đồng thời:
   ```bash
   npm run dev
   ```

3. **Đảm bảo database** có dữ liệu: menu items, bàn, tài khoản user.

### 3 Kịch bản E2E đã triển khai

| # | File | Luồng kiểm thử | Mô tả |
|---|------|----------------|-------|
| 1 | `login.spec.js` | Đăng nhập | Hiển thị form, đăng nhập thành công → redirect, đăng nhập thất bại → hiện lỗi |
| 2 | `booking.spec.js` | Đặt bàn (Guest) | Chọn ngày/giờ/số người → chọn bàn → chọn vai trò khách → nhập thông tin → trang thành công |
| 3 | `takeaway-order.spec.js` | Đặt món mang về | Xem menu → click "Đặt mang về" → checkout → điền form → xác nhận sang bước cọc |

### Các lệnh kiểm thử E2E

- **Chạy toàn bộ E2E (headless):**
  ```bash
  npm run test:e2e
  ```

- **Chạy E2E với trình duyệt hiển thị (để demo/quay màn hình):**
  ```bash
  npm run test:e2e:headed
  ```

- **Xem báo cáo HTML:**
  ```bash
  npm run test:e2e:report
  ```
  *Báo cáo được tạo tại thư mục `playwright-report/`.*

- **Chạy 1 file test cụ thể:**
  ```bash
  npx playwright test e2e/tests/login.spec.js
  npx playwright test e2e/tests/booking.spec.js
  npx playwright test e2e/tests/takeaway-order.spec.js
  ```

---

## 3. Tổng kết Chiến lược Kiểm thử hiện tại

- **Đã hoàn thành:** 
  - Unit Test và API Integration Test (Jest + Supertest) với độ phủ cao cho các Service quan trọng của Backend.
  - Phân tích Code Coverage báo cáo tình trạng kiểm thử Backend.
  - Kiểm thử E2E 3 luồng nghiệp vụ chính (Đăng nhập, Đặt bàn, Đặt món) sử dụng Playwright.
