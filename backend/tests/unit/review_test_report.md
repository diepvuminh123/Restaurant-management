# Báo cáo Phủ sóng Unit Test - Module Đánh giá (ReviewService)

Tài liệu này tổng hợp các kịch bản kiểm thử (Test Cases) được viết để bảo vệ luồng tính năng Đánh giá Món ăn và Báo cáo vi phạm (Report). Toàn bộ thao tác tương tác với CSDL PostgreSQL đều được Mock giả lập hoàn toàn.

Tổng số kịch bản đã test: **25 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## 1. Quản lý Đánh giá (Khách hàng)
- **Tạo Đánh giá (`createReview`):**
  - 🔴 **Sad Path:** Bắn lỗi 404 nếu khách hàng cố tình đánh giá một món ăn không tồn tại.
  - 🔴 **Sad Path (Chống Spam):** Chặn đứng việc khách hàng đánh giá một món ăn nhiều lần. Hệ thống tự động bắt mã lỗi `23505` (Unique Constraint) từ CSDL và chuyển hóa thành lỗi `409 Conflict` báo cho Frontend.
  - 🟢 **Happy Path:** Đánh giá thành công và trả về dữ liệu chuẩn.
- **Sửa / Xóa Đánh giá (`updateOwnReview`, `deleteOwnReview`):**
  - 🔴 **Sad Path:** Ném lỗi 404 chặn thao tác nếu khách hàng cố gắng sửa/xóa review của một người khác (không khớp `user_id`).
  - 🔴 **Sad Path (Khóa Review):** Không cho phép khách hàng tự sửa review nếu review đó đã bị Admin khóa (ẩn) vì vi phạm tiêu chuẩn cộng đồng (`is_hidden = true`).
  - 🟢 **Happy Path:** Khách hàng chủ động chỉnh sửa (rating, comment) hoặc xóa review của chính mình thành công.

## 2. Quản lý Báo cáo Vi phạm (Report)
- **Tạo Report (`reportReview`):**
  - 🔴 **Sad Path (Chặn tự báo cáo):** Bắn lỗi 409 từ chối việc người dùng nhấn nút Report lên chính cái Review do mình viết ra.
  - 🔴 **Sad Path (Chống Spam Report):** Bắn lỗi 409 nếu một người dùng nhấn Report cùng một bài Review nhiều lần (Dựa trên bắt lỗi DB `23505`).
  - 🟢 **Happy Path:** Gửi báo cáo thành công lên cho Admin phê duyệt.

## 3. Tác vụ Quản trị (Admin)
- **Ẩn / Hiện Review (`updateReviewVisibilityForAdmin`):**
  - 🔴 **Sad Path (Bắt buộc nhập lý do):** Bắn lỗi 400 Bad Request nếu Admin ra lệnh Ẩn một review (`is_hidden = true`) nhưng lại bỏ trống lý do ẩn (`hidden_reason`).
  - 🟢 **Happy Path (Ẩn):** Ẩn thành công, ghi nhận lý do rõ ràng.
  - 🟢 **Happy Path (Hiện lại):** Khi Admin quyết định mở khóa (Hiện) lại review (`is_hidden = false`), hệ thống tự động dọn dẹp biến `hidden_reason` thành `null` để đảm bảo sạch dữ liệu.
- **Truy xuất dữ liệu:**
  - 🟢 Đảm bảo các hàm gọi danh sách Review, danh sách Report và Thống kê truyền chính xác tham số Filter xuống tầng Database.

## 4. Xử lý Dữ liệu Đầu ra (Data Mapper)
- 🟢 **Happy Path:** Hàm `toReviewView` hoạt động chính xác: Tự động ép kiểu chuỗi (String) thành Số (Number) cho các trường `rating`, `report_count`; tự động chuyển đổi cờ `is_hidden` từ số nguyên của DB (0/1) sang Boolean (`true`/`false`), giúp Frontend nhận được cấu trúc JSON hoàn hảo nhất.
