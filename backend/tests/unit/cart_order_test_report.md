# Báo cáo Phủ sóng Unit Test - Module Giỏ hàng & Đơn hàng (Cart & Order Services)

Tài liệu này trình bày các kịch bản kiểm thử (Test Cases) đã được thực thi bằng framework Jest đối với hai module trung tâm của luồng mua sắm: **CartService** và **OrderService**. Toàn bộ các kiểm thử đều sử dụng kỹ thuật Mocking để cô lập logic nghiệp vụ (Business Logic) khỏi thao tác Cơ sở dữ liệu (Database I/O).

Tổng số kịch bản đã test: **40 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## Phần 1: Module Giỏ Hàng (`CartService`)
Kiểm thử tập trung vào quy trình thêm/sửa/xóa sản phẩm và định danh người dùng (User/Guest).

### 1.1. Định danh và Quản lý Session
- 🔴 **Sad Path:** Ném lỗi (400) chặn thao tác nếu người dùng không có cả `userId` (đã đăng nhập) lẫn `sessionId` (khách vãng lai).
- 🟢 **Happy Path:** Ưu tiên phân giải chủ giỏ hàng dựa trên `userId` (nếu có), hoặc fallback về `sessionId`.
- 🟢 **Happy Path (Migrate):** Hợp nhất (Migrate) thành công giỏ hàng của tài khoản Khách sang tài khoản Thành viên khi người dùng tiến hành Đăng nhập.

### 1.2. Thao tác Item (Thêm/Sửa/Xóa)
- 🔴 **Sad Path:** Bắn lỗi nghiệp vụ nếu người dùng cố nhập số lượng sản phẩm âm hoặc bằng 0 (`quantity <= 0`).
- 🔴 **Sad Path:** Bắn lỗi 404 nếu cố gắng sửa/xóa một sản phẩm không tồn tại trong giỏ hàng.
- 🟢 **Happy Path:** Thêm/Sửa số lượng, cập nhật ghi chú (note) và Xóa sản phẩm thành công. Hệ thống tự động tính toán lại tổng tiền (`total_amount`) và tổng số lượng (`total_quantity`).

### 1.3. Xác thực trước Thanh toán (Validate Cart)
- 🔴 **Sad Path (Giỏ rỗng):** Trả về cờ `valid: false` và báo lỗi "Giỏ hàng trống".
- 🔴 **Sad Path (Hết hàng):** Duyệt qua toàn bộ sản phẩm, trả về cờ `valid: false` nếu phát hiện có món ăn đã tạm ngưng phục vụ (`available = false`).
- 🟢 **Happy Path:** Giỏ hàng hợp lệ, sẵn sàng chuyển sang bước Đặt hàng.

---

## Phần 2: Module Đơn Hàng (`OrderService`)
Đơn hàng là module chịu trách nhiệm về State Machine (cỗ máy trạng thái). Các kịch bản test tập trung cực kỳ nghiêm ngặt vào các bước chuyển đổi trạng thái để chống lỗi nghiêm trọng.

### 2.1. Khởi tạo Đơn hàng (Checkout)
- 🔴 **Sad Path (Lỗi Thời gian):** Bắn lỗi 400 nếu khách hàng chọn thời gian nhận món (`pickup_time`) không đúng định dạng thời gian.
- 🔴 **Sad Path (Lỗi Logic):** Chặn đặt hàng nếu chọn `pickup_time` là một thời điểm nằm trong quá khứ.
- 🟢 **Happy Path (Payment Tag):** Tạo đơn hàng thành công, hệ thống tự động bóc tách Phương thức thanh toán (VD: ZaloPay, Vietcombank) và chèn một thẻ Tag `[PAYMENT_METHOD:...]` vào đầu ghi chú đơn hàng một cách chính xác.

### 2.2. Kiểm soát Trạng thái Đơn hàng (State Machine Validation)
- 🔴 **Sad Path:** Bắn lỗi 404 nếu nhân viên cố gắng xác nhận cọc, sửa trạng thái, hoặc sửa ghi chú của một đơn hàng không tồn tại.
- 🔴 **Sad Path (Chống thao tác lên đơn đã đóng):** Bắn lỗi 409 (Conflict) nếu cố gắng hủy đơn, sửa ghi chú hoặc cập nhật trạng thái khi đơn hàng đã chốt hạ (`CANCELED` hoặc `COMPLETED`).
- 🔴 **Sad Path (Khớp trạng thái cọc):** Chặn việc xác nhận chuyển tiền cọc (`confirmDeposit`) nếu đơn hàng đang ở trạng thái không hợp lệ (VD: Đang bị Refunded).
- 🟢 **Happy Path:** Cập nhật trạng thái linh hoạt. Nếu trạng thái update trùng với trạng thái hiện tại, hệ thống thông minh tự bỏ qua lệnh gọi xuống Database để tiết kiệm tài nguyên.

### 2.3. Hủy Đơn Hàng (Phân quyền rõ ràng)
- 🔴 **Sad Path (Phân quyền):** Bắn lỗi 401 nếu một client nặc danh cố gắng gọi hàm hủy đơn của User.
- 🔴 **Sad Path (Bảo mật):** Bắn lỗi 404 chặn việc một User A cố gắng hủy đơn hàng của User B (Do không khớp ID chủ sở hữu).
- 🟢 **Happy Path:** Hủy đơn thành công, ghi chú rõ lý do (do khách hủy hoặc do quán hết món).

### 2.4. Cập nhật Ghi chú Thông minh
- 🟢 **Happy Path (Regex Manipulation):** Test kịch bản phức tạp: Khi nhân viên nhà hàng gõ thêm một ghi chú mới (VD: "Làm thêm ớt"), hệ thống dùng RegEx để bảo tồn nguyên vẹn nhãn thanh toán gốc ban đầu (`[PAYMENT_METHOD:ZaloPay] Làm thêm ớt`), đảm bảo không làm hỏng dữ liệu đối soát kế toán.
