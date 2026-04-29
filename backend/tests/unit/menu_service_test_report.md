# Báo cáo Phủ sóng Unit Test - Module MenuService (Quản lý Thực đơn)

Tài liệu này tổng hợp danh sách các kịch bản kiểm thử (Test Cases) đã được thực hiện bằng công cụ Jest cho module `MenuService`. Tương tự như hệ thống xác thực, toàn bộ các tương tác với CSDL PostgreSQL thông qua `Menu` model đều được **Mock** hóa hoàn toàn.

Tổng số kịch bản đã test: **45 Test Cases (Đạt tỷ lệ Pass 100%)**

---

## 1. Quản lý Phần Thực Đơn (Section Management)
Bao gồm các thao tác CRUD cơ bản đối với danh mục lớn (Section) như Bữa sáng, Bữa trưa, Bữa tối.

- 🔴 **Sad Paths:** Bắn lỗi khi thiếu các trường bắt buộc (thiếu `id`, thiếu `section_name`).
- 🔴 **Sad Paths:** Ném lỗi chặn thao tác khi người dùng nhập sai định dạng của `sortOrder` (chữ cái thay vì số).
- 🔴 **Sad Paths:** Bắn lỗi 404 (Không tồn tại) nếu cố gắng cập nhật hoặc xóa một Section không có trong hệ thống.
- 🟢 **Happy Paths:** Thực thi thành công các tác vụ Tạo mới (`createSection`), Cập nhật (`updateSection`), Đổi vị trí hiển thị (`updateSectionOrder`) và Xóa (`deleteSection`).

## 2. Quản lý Danh mục (Category Management)
Xử lý các danh mục con phụ thuộc vào Section (Ví dụ: Đồ uống, Món xào).

- 🔴 **Sad Paths:** Từ chối tạo Category nếu người dùng bỏ trống `category_name` hoặc không liên kết nó với bất kỳ `section_id` nào.
- 🔴 **Sad Paths:** Bắn lỗi bảo vệ hệ thống khi ID truy vấn không hợp lệ hoặc dữ liệu không tồn tại trên DB.
- 🟢 **Happy Paths:** Thực thi thành công toàn bộ vòng đời của Category (Tạo, Sửa, Xóa).

## 3. Quản lý Món Ăn Chính (Menu Item Management)
Xử lý logic lõi của phần thực đơn, bao gồm giá cả và tình trạng còn hàng.

- 🔴 **Sad Paths (Validation Dữ liệu):** Chặn việc tạo/cập nhật món ăn nếu thiếu Tên (`name`), thiếu Giá (`price`).
- 🔴 **Sad Paths (Validation Nghiệp vụ):** Tuyệt đối không cho phép nhập Giá tiền âm (`price < 0`).
- 🔴 **Sad Paths (Tồn tại dữ liệu):** Trả về lỗi khi cố gắng cập nhật trạng thái còn/hết hàng (`updateAvailability`) hoặc đổi ảnh đại diện (`updateMenuItemImage`) cho một món ăn ảo/đã bị xóa.
- 🟢 **Happy Paths:** 
  - Lấy thông tin chi tiết một món ăn thành công.
  - Tạo món ăn mới, cập nhật tên/giá thành công.
  - Cập nhật nhanh trạng thái hết hàng (Sold out).
  - Gắn URL ảnh đại diện cho món ăn thành công.

## 4. Các truy vấn lấy dữ liệu (Query/Read Methods)
Mục tiêu: Đảm bảo các bộ lọc (Filters) và lệnh lấy dữ liệu được truyền tải chính xác từ Service xuống Model.

- 🔴 **Sad Paths:** Chặn truy vấn nếu client yêu cầu lấy Danh mục con nhưng không truyền lên `sectionId`.
- 🟢 **Happy Paths:** Xác nhận các hàm lấy toàn bộ thực đơn (`getMenuItems`), lấy cấu trúc Section (`getSections`) và bộ đếm Filter (`getFacets`) đều gọi chuẩn xác đến các hàm tương ứng dưới tầng Database với đầy đủ tham số bộ lọc.
