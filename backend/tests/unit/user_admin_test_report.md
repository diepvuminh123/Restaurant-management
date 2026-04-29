# Báo cáo Unit Test - UserAdminService

Tổng số kịch bản đã test: **19 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## 1. Mục tiêu kiểm thử
Kiểm thử toàn diện các logic nghiệp vụ liên quan đến quản lý người dùng, phân quyền, và khóa/mở khóa tài khoản từ phía Admin, đảm bảo tính bảo mật và tuân thủ các quy tắc phân quyền chặt chẽ.

## 2. Kết quả Coverage
- **Statements:** 100%
- **Functions:** 100%
- **Branches:** 90.47%
- **Lines:** 100%

## 3. Chi tiết các Test Cases

### 3.1. Formatting Dữ liệu (`toUserView`)
- 🟢 Xử lý đúng trường hợp đầu vào là `null`.
- 🟢 Format chính xác tất cả các trường dữ liệu người dùng (camelCase).
- 🟢 Tính toán chính xác trạng thái `isLocked` dựa vào thời gian `locked_until`.

### 3.2. Logic Phân quyền (`ensureCanManageAdminRole`)
- 🟢 `Throw Error`: Nếu người không phải `system_admin` cố tình gán quyền `admin` cho người khác.
- 🟢 `Throw Error`: Nếu người không phải `system_admin` cố tình thay đổi quyền của một `admin` hiện tại.
- 🟢 `Success`: Cho phép `system_admin` thay đổi quyền của `admin`.
- 🟢 `Success`: Cho phép nhân viên quản lý/đổi các quyền không phải admin (ví dụ: `customer` ↔ `employee`).

### 3.3. Lấy Danh sách Người dùng (`getUsers`)
- 🟢 Lấy danh sách thành công kèm theo logic phân trang (pagination) tính toán số trang `total_pages` chính xác.

### 3.4. Cập nhật Vai trò (`updateUserRole`)
- 🔴 `Thất bại 401`: Phiên đăng nhập của người thực hiện hành động không hợp lệ (không tìm thấy trong DB).
- 🔴 `Thất bại 404`: Không tìm thấy ID người dùng cần cập nhật.
- 🔴 `Thất bại 403`: Cố tình thay đổi vai trò của tài khoản `system_admin`.
- 🔴 `Thất bại 409`: Tự hạ quyền admin của chính mình.
- 🔴 `Thất bại 409`: Cố tình hạ quyền admin duy nhất/cuối cùng còn lại trong hệ thống.
- 🟢 `Thành công 200`: Cập nhật vai trò thành công và tự động tạo log (`AdminActionLog`) ghi nhận lại lịch sử.

### 3.5. Khóa / Mở khóa Tài khoản (`updateUserLockState`)
- 🔴 `Thất bại 404`: Không tìm thấy ID người dùng cần khóa/mở khóa.
- 🔴 `Thất bại 403`: Cố tình khóa tài khoản `system_admin`.
- 🔴 `Thất bại 409`: Cố tình tự khóa tài khoản của chính mình.
- 🟢 `Thành công 200 (Khóa)`: Khóa tài khoản thành công, reset số lần đăng nhập sai và lưu log.
- 🟢 `Thành công 200 (Mở khóa)`: Mở khóa tài khoản thành công và lưu log.

## 4. Đánh giá
Service đã được cover đầy đủ các góc cạnh của quy tắc nghiệp vụ. Hệ thống rào chắn phân quyền (`role-based fences`) hoạt động hoàn hảo, chặn đứng các nguy cơ bảo mật nghiêm trọng (như tự khóa mình, xóa admin cuối cùng, bypass quyền hệ thống). Tương thích 100% để tích hợp lên Integration Test.
