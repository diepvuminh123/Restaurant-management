# Báo cáo Phủ sóng Unit Test - Module AuthService

Tài liệu này tổng hợp danh sách các kịch bản kiểm thử (Test Cases) đã được thực hiện bằng công cụ Jest cho module `AuthService`. Toàn bộ các tương tác với cơ sở dữ liệu (`User`, `Mail`) và dịch vụ gửi email (`mailer`) đều được áp dụng kỹ thuật **Mocking** để đảm bảo tính độc lập, an toàn và tốc độ thực thi của Unit Test.

Tổng số kịch bản đã test: **25 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## 1. Luồng Đăng ký tài khoản (`register`)
Mục tiêu: Đảm bảo tính duy nhất của dữ liệu người dùng và luồng tạo OTP hoạt động chính xác.

- 🔴 **Sad Path:** Ném lỗi chặn đăng ký khi `username` do khách hàng nhập vào đã tồn tại trong hệ thống.
- 🔴 **Sad Path:** Ném lỗi chặn đăng ký khi `email` đã được sử dụng bởi một tài khoản khác.
- 🟢 **Happy Path:** Đăng ký thành công khi dữ liệu hợp lệ. Hệ thống phải gọi đúng các hàm tạo User, sinh mã OTP 6 số, và kích hoạt dịch vụ gửi Email xác thực.

## 2. Luồng Đăng nhập & Bảo vệ tài khoản (`login`)
Mục tiêu: Xác thực người dùng và kiểm tra chặt chẽ cơ chế khóa tài khoản tự động (Chống Brute-force).

- 🔴 **Sad Path:** Ném lỗi từ chối đăng nhập khi email không tồn tại.
- 🔴 **Sad Path:** Ném lỗi chặn đăng nhập khi tài khoản khách hàng chưa được xác thực (chưa nhập mã OTP gửi qua email).
- 🔴 **Sad Path (Khóa Tạm Thời):** Chặn đăng nhập và hiển thị thông báo thời gian chờ (phút) khi tài khoản đang trong trạng thái bị khóa.
- 🔴 **Sad Path (Đếm lỗi):** Xử lý nhập sai mật khẩu (dưới 5 lần). Tự động cộng dồn số lần nhập sai và báo cho user biết số lần thử còn lại.
- 🔴 **Sad Path (Kích hoạt Khóa):** Xử lý nhập sai mật khẩu lần thứ 5. Hệ thống tự động kích hoạt trạng thái khóa tài khoản trong 12 giờ.
- 🟢 **Happy Path (Tự động mở khóa):** Cho phép đăng nhập khi thời gian khóa tài khoản đã kết thúc. Hệ thống tự động reset lại bộ đếm số lần nhập sai.
- 🟢 **Happy Path (Thành công):** Đăng nhập thành công với thông tin hợp lệ. Trả về payload chứa thông tin người dùng (đảm bảo đã loại bỏ trường rủi ro bảo mật là `password_hash`).

## 3. Luồng Xác thực mã OTP (`verifyOtp`)
Mục tiêu: Bảo mật luồng kích hoạt tài khoản và lấy lại mật khẩu.

- 🔴 **Sad Path:** Bắn lỗi khi email gửi lên không hợp lệ.
- 🔴 **Sad Path (Hết hạn):** Ném lỗi chặn xác thực khi mã OTP đã vượt quá thời gian hiệu lực (10 phút). Kịch bản này đồng thời kiểm tra cơ chế tự động dọn dẹp mã OTP rác trong database.
- 🔴 **Sad Path:** Bắn lỗi khi người dùng nhập sai mã code.
- 🟢 **Happy Path (Kích hoạt):** Đối với mã OTP loại `signup`, xác thực thành công sẽ tự động chuyển trạng thái `is_verified` của user thành `true` và hủy mã OTP.
- 🟢 **Happy Path (Quên mật khẩu):** Đối với mã OTP loại `reset`, xác thực thành công sẽ trả về cờ `allow_reset` cho phép đổi mật khẩu và hủy mã OTP.

## 4. Luồng Thay đổi Mật khẩu (`resetPassword` & `changePassword`)
Mục tiêu: Đảm bảo các quy tắc an toàn khi thay đổi thông tin định danh.

- 🔴 **Sad Path:** Ném lỗi từ chối thao tác khi người dùng chưa đăng nhập.
- 🔴 **Sad Path:** (Đổi mật khẩu chủ động) Bắn lỗi khi nhập sai mật khẩu hiện tại.
- 🔴 **Sad Path:** Bắn lỗi bảo mật khi người dùng cố tình đặt "mật khẩu mới" giống hệt "mật khẩu cũ".
- 🟢 **Happy Path:** Xác nhận gọi hàm cập nhật mật khẩu xuống cơ sở dữ liệu thành công.

## 5. Luồng Cập nhật Thông tin cá nhân (`updateProfile`)
Mục tiêu: Chuẩn hóa dữ liệu đầu vào và kiểm tra xung đột.

- 🔴 **Sad Path:** Chặn người dùng đổi `username` sang một tên đã bị người khác chiếm dụng.
- 🟢 **Happy Path:** Cập nhật thành công. Dữ liệu văn bản (như username, fullName) phải được hệ thống tự động loại bỏ các khoảng trắng thừa (trim) trước khi lưu.
