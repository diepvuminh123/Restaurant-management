# Báo cáo Phủ sóng Unit Test - TakeawayAutomation & RestaurantInfo

Tài liệu này trình bày các kịch bản kiểm thử (Test Cases) được xây dựng để bảo vệ 2 module: hệ thống tự động hóa (`TakeawayAutomationService`) và cấu hình cửa hàng (`RestaurantInfoService`). Cả 2 module đều được Mock 100% CSDL PostgreSQL.

Tổng số kịch bản đã test: **19 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## Phần 1: Tự động hóa Đơn hàng (`TakeawayAutomationService`)
Đây là một service chạy nền đa luồng (Background worker), do đó việc kiểm thử tập trung vào tính toàn vẹn dữ liệu (Locking) và xử lý lỗi bất đồng bộ.

### 1.1. Cơ chế Khởi động & Dừng (Start/Stop)
- 🟢 **Happy Path (Tắt/Mở):** Kiểm chứng biến môi trường `TAKEAWAY_AUTOMATION_ENABLED = false` sẽ vô hiệu hóa hoàn toàn cỗ máy. Nếu bật, `setInterval` sẽ kích hoạt ngay lập tức.
- 🟢 **Happy Path (Chống ghi đè):** Nếu "bot" đang chạy, việc gọi hàm `start()` lần thứ 2 sẽ không tạo ra các vòng lặp chồng chéo gây tốn CPU.

### 1.2. Vòng lặp Xử lý & Khóa Đa luồng (Advisory Locks)
Sử dụng công nghệ khóa mềm (Advisory Locks) của PostgreSQL để chống xung đột khi chạy app trên nhiều server/container.
- 🔴 **Sad Path (Không lấy được Lock):** Giả lập DB trả về `locked: false` (báo hiệu server khác đang chạy bot). Kiểm chứng bot lập tức ngưng hoạt động ở chu kỳ này và không gọi bất cứ hàm tự động đổi trạng thái nào.
- 🔴 **Sad Path (Lỗi Exception giữa chừng):** Giả lập DB bị lỗi/sập khi bot đang chạy dở dang. Kiểm chứng khối `finally` vẫn luôn được gọi để đảm bảo nhả khóa (`pg_advisory_unlock`), tránh treo hệ thống vĩnh viễn.
- 🟢 **Happy Path:** Lấy Lock thành công -> Duyệt qua 4 hàm Auto (Hủy đơn, Đang nấu, Đã xong, Hoàn tất) -> Nhả Lock an toàn.

### 1.3. Cơ chế gửi Email Hàng loạt (Bulk Notification)
- 🔴 **Sad Path:** Không gửi mail nếu khách hàng không cung cấp Email.
- 🔴 **Sad Path (Xử lý lỗi cục bộ):** Giả lập máy chủ SMTP (Email Server) bị lỗi trên 1 vài email. Đảm bảo hàm dùng `Promise.allSettled` không làm sập (crash) toàn bộ hệ thống bot, mà chỉ log ra số lượng mail thất bại.
- 🟢 **Happy Path:** Gửi email thông báo chính xác cho các đơn hàng có sự thay đổi trạng thái tự động.

---

## Phần 2: Cấu hình Nhà hàng (`RestaurantInfoService`)
Kiểm thử bộ luật Validation khắt khe liên quan đến logic Thời gian thực (Real-time).

### 2.1. Quản lý bản ghi Độc quyền (Singleton)
- 🔴 **Sad Path:** Trả về lỗi `409 Conflict` nếu quản trị viên cố gọi hàm Tạo Mới (`create`) khi thông tin cửa hàng đã tồn tại (hệ thống chỉ cho phép 1 bản ghi duy nhất, bắt buộc phải dùng hàm `update`).
- 🔴 **Sad Path:** Trả về lỗi `404 Not Found` nếu gọi API Update với ID không khớp với ID cấu hình đang có trong DB.

### 2.2. Validation Logic Giờ Giấc (Time Range)
- 🔴 **Sad Path (Thiếu dữ liệu):** Chặn lưu nếu bị thiếu `opening_time` hoặc `closing_time` (khi tạo mới).
- 🔴 **Sad Path (Logic thời gian sai lệch):** Bắn lỗi `400 Bad Request` nếu Giờ mở cửa `>=` Giờ đóng cửa (VD: Mở cửa 22:00, Đóng cửa 20:00).
- 🟢 **Happy Path (Update một phần - Partial Update):** Đảm bảo hệ thống đủ thông minh để test luồng: Quản trị viên chỉ gửi lên `opening_time: '23:00'` (không gửi `closing_time`). Hệ thống sẽ tự lấy `closing_time` cũ trong DB (ví dụ là `'22:00'`) ghép vào, tự phát hiện logic sai (`23:00 >= 22:00`) và chặn lại ngay lập tức.
