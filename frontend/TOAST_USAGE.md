# 🎨 Hệ Thống Toast Notification

## Cấu trúc đã tạo:

```
frontend/src/
├── component/
│   └── Toast/
│       ├── Toast.jsx           # Component Toast đơn lẻ
│       ├── Toast.css          # Styling cho Toast
│       ├── ToastContainer.jsx # Container chứa tất cả toasts
│       └── ToastContainer.css # Styling cho container
├── hooks/
│   └── useToast.js            # Custom hook quản lý toast
└── context/
    └── ToastContext.js        # Context để dùng toast global
```

## Cách sử dụng:

### 1. Import hook trong component:
```javascript
import { useToastContext } from '../../context/ToastContext';
```

### 2. Sử dụng trong component:
```javascript
const MyComponent = () => {
  const toast = useToastContext();
  
  const handleSuccess = () => {
    toast.success("Đăng nhập thành công!");
  };
  
  const handleError = () => {
    toast.error("Có lỗi xảy ra, vui lòng thử lại!");
  };
  
  const handleWarning = () => {
    toast.warning("Cảnh báo: Phiên đăng nhập sắp hết hạn!");
  };
  
  const handleInfo = () => {
    toast.info("Thông tin: Hệ thống đang cập nhật dữ liệu");
  };
  
  return (
    // JSX...
  );
};
```

### 3. Các phương thức có sẵn:

- `toast.success(message, duration)` - Thông báo thành công (màu xanh lá)
- `toast.error(message, duration)` - Thông báo lỗi (màu đỏ)
- `toast.warning(message, duration)` - Thông báo cảnh báo (màu cam)
- `toast.info(message, duration)` - Thông báo thông tin (màu xanh dương)

**duration** (tùy chọn): Thời gian hiển thị (milliseconds), mặc định 3000ms (3 giây)

## Ví dụ thực tế:

### Trước (dùng alert):
```javascript
const handleDelete = async () => {
  try {
    await ApiService.deleteMenuItem(id);
    alert("Xóa món thành công!");
  } catch (error) {
    alert("Lỗi: " + error.message);
  }
};
```

### Sau (dùng toast):
```javascript
const toast = useToastContext();

const handleDelete = async () => {
  try {
    await ApiService.deleteMenuItem(id);
    toast.success("Xóa món thành công!");
  } catch (error) {
    toast.error("Lỗi: " + error.message);
  }
};
```

## Tính năng:

✅ 4 loại toast: Success, Error, Warning, Info
✅ Icon đẹp cho từng loại
✅ Animation mượt mà (slide in from right)
✅ Tự động đóng sau duration
✅ Có nút đóng thủ công
✅ Responsive (mobile-friendly)
✅ Fixed position top-right
✅ Stack nhiều toast cùng lúc
✅ Màu sắc và style hiện đại

## Customization:

Bạn có thể tùy chỉnh thời gian hiển thị:
```javascript
toast.success("Lưu thành công!", 5000); // Hiện 5 giây
toast.error("Lỗi nghiêm trọng!", 10000); // Hiện 10 giây
toast.info("Đọc kỹ thông tin này", 0); // Không tự đóng
```
