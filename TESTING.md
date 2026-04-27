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

Thay vì viết Unit Test chi tiết cho giao diện Frontend, dự án áp dụng chiến lược sử dụng **Playwright Codegen** để kiểm thử các luồng người dùng (User Flows) quan trọng từ đầu đến cuối một cách nhanh chóng và hiệu quả.

- Playwright sẽ tự động mở trình duyệt thực, thực hiện các thao tác click, điền form như một người dùng thật để đảm bảo tích hợp giữa Frontend và Backend hoạt động trơn tru.
- *(Chi tiết về thư mục chứa kịch bản Playwright và lệnh khởi chạy cụ thể sẽ được cập nhật khi các script E2E hoàn thiện).*

---

## 3. Tổng kết Chiến lược Kiểm thử hiện tại

- **Đã làm:** 
  - Unit Test và API Integration Test (Jest + Supertest) với độ phủ cao cho các Service quan trọng của Backend.
  - Phân tích Code Coverage báo cáo tình trạng kiểm thử Backend.
- **Đang / Sẽ làm:** 
  - Hoàn thiện luồng kiểm thử E2E sử dụng Playwright Codegen để tiết kiệm thời gian so với viết Unit Test cho từng thành phần Frontend.
