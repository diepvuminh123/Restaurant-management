# Báo cáo Phủ sóng Unit Test - Module Đặt bàn (ReservationService)

Tài liệu này tổng hợp các kịch bản kiểm thử (Test Cases) được xây dựng để đảm bảo tính ổn định và chính xác của luồng Đặt bàn. Toàn bộ các tương tác với Model/CSDL đều được Mock giả lập hoàn toàn để tăng tốc độ thực thi.

Tổng số kịch bản đã test: **30 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## 1. Xử lý Dữ liệu Chuỗi (Text Parsing & Fallback)
Hàm `normalizeReservationForStaff` được test cực kỳ cẩn thận vì nó chứa logic bóc tách RegEx phức tạp.
- 🟢 **Happy Path (Parsing):** Dữ liệu truyền vào dạng chuỗi gộp (`KH: Nguyen Van A | SDT: 0123456789 | Ghi chú: Tiec`) được dùng Biểu thức chính quy (Regex) bóc tách chính xác thành các trường JSON `customer_name`, `customer_phone`, `customer_note`.
- 🟢 **Happy Path (Fallback thông minh):** Nếu khách hàng đặt bàn nhưng không điền thông tin (chuỗi Ghi chú không có các thẻ tag KH, SDT), hệ thống tự động tra cứu Profile của User (`User.findById`) và tự động điền Tên thật, SĐT, Email của User đó vào đơn đặt bàn.

## 2. Quy trình Đặt Bàn (Khách Hàng & Nhân Viên)
- **Kiểm tra tính khả dụng của bàn:**
  - 🔴 **Sad Path:** Ném lỗi 400 nếu người dùng gửi lên thời gian (`reservation_time`) sai định dạng.
  - 🔴 **Sad Path:** Bắn lỗi từ chối đặt nếu Bàn mà khách chọn hiện đang không khả dụng (`selectable = false` do đang bảo trì, hoặc có người khác vừa đặt trước).
  - 🟢 **Happy Path:** Khách hàng (User/Guest) tạo đơn đặt bàn thành công.
  - 🟢 **Happy Path:** Nhân viên (Staff) thay mặt khách hàng tạo đơn đặt bàn thành công (Tự động gán SessionID dành riêng cho Staff).

## 3. Hủy Đặt Bàn (Khách Hàng)
- 🔴 **Sad Path (Phân quyền):** Ném lỗi chặn một tài khoản nặc danh (Guest) gọi hàm hủy bàn của một User.
- 🔴 **Sad Path:** Ném lỗi từ chối nếu User cố gắng hủy một đơn đặt bàn đã bị quá giờ, hoặc cố hủy đơn của một người khác.
- 🟢 **Happy Path:** User hủy bàn thành công.

## 4. Cỗ Máy Trạng Thái Đặt Bàn (Reservation State Machine)
Quy trình phục vụ chuẩn: `CONFIRM -> ON_SERVING -> COMPLETED`.
- 🔴 **Sad Path (Thiếu dữ liệu):** Bắn lỗi 400 nếu Staff không gửi lên ID bàn hoặc Trạng thái muốn chuyển đến.
- 🔴 **Sad Path (Không tồn tại):** Bắn lỗi 404 nếu mã bàn không tồn tại.
- 🔴 **Sad Path (Chặn nhảy cóc trạng thái):** Ném lỗi `409 Conflict` bảo vệ hệ thống nếu Nhân viên cố gắng thực hiện hành động sai quy trình (Ví dụ: Từ trạng thái `CONFIRM` bấm chuyển thẳng sang `COMPLETED`).
- 🟢 **Happy Path:** Cập nhật trạng thái thành công đúng trình tự (Ví dụ: Chuyển từ `CONFIRM` sang `ON_SERVING`).
