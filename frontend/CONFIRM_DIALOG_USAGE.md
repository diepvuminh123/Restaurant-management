# 💬 Hệ Thống Confirm Dialog

## Cấu trúc đã tạo:

```
frontend/src/
├── component/
│   └── ConfirmDialog/
│       ├── ConfirmDialog.jsx  # Component dialog xác nhận
│       └── ConfirmDialog.css  # Styling đẹp
└── hooks/
    └── useConfirm.js          # Custom hook quản lý confirm
```

## Cách sử dụng:

### 1. Import hook trong component:
```javascript
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmDialog from '../../component/ConfirmDialog/ConfirmDialog';
```

### 2. Sử dụng trong component:
```javascript
const MyComponent = () => {
  const { confirmState, showConfirm } = useConfirm();
  
  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa mục này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger", // warning, danger, success, info
    });
    
    if (!confirmed) return;
    
    // Thực hiện hành động xóa
    await deleteItem();
  };
  
  return (
    <>
      <button onClick={handleDelete}>Xóa</button>
      
      {/* Thêm ConfirmDialog vào cuối component */}
      <ConfirmDialog {...confirmState} />
    </>
  );
};
```

### 3. Các options có sẵn:

```javascript
showConfirm({
  title: "Tiêu đề",           // Tiêu đề dialog
  message: "Nội dung",         // Nội dung thông báo
  confirmText: "Xác nhận",     // Text button xác nhận
  cancelText: "Hủy",           // Text button hủy
  type: "warning"              // Loại: warning, danger, success, info
})
```

### 4. Các loại type:

- **`warning`** (mặc định) - Màu cam, dùng cho cảnh báo chung
- **`danger`** - Màu đỏ, dùng cho các hành động nguy hiểm (xóa, hủy...)
- **`success`** - Màu xanh lá, dùng cho xác nhận thành công
- **`info`** - Màu xanh dương, dùng cho thông tin

## Ví dụ thực tế:

### Trước (dùng window.confirm):
```javascript
const handleDelete = async () => {
  const confirmed = window.confirm("Bạn có chắc muốn xóa?");
  if (!confirmed) return;
  
  await deleteItem();
};
```

### Sau (dùng ConfirmDialog):
```javascript
const { confirmState, showConfirm } = useConfirm();

const handleDelete = async () => {
  const confirmed = await showConfirm({
    title: "Xác nhận xóa món",
    message: "Bạn có chắc chắn muốn xóa món này? Hành động này không thể hoàn tác.",
    confirmText: "Xóa",
    cancelText: "Hủy",
    type: "danger",
  });
  
  if (!confirmed) return;
  await deleteItem();
};

// Trong JSX:
<ConfirmDialog {...confirmState} />
```

## Ví dụ các trường hợp khác:

### 1. Xác nhận Logout:
```javascript
const confirmed = await showConfirm({
  title: "Đăng xuất",
  message: "Bạn có muốn đăng xuất khỏi tài khoản?",
  confirmText: "Đăng xuất",
  cancelText: "Ở lại",
  type: "warning",
});
```

### 2. Xác nhận Submit Form:
```javascript
const confirmed = await showConfirm({
  title: "Xác nhận lưu",
  message: "Bạn có muốn lưu các thay đổi?",
  confirmText: "Lưu",
  cancelText: "Hủy",
  type: "success",
});
```

### 3. Xác nhận Reset:
```javascript
const confirmed = await showConfirm({
  title: "Đặt lại dữ liệu",
  message: "Tất cả dữ liệu hiện tại sẽ bị xóa. Tiếp tục?",
  confirmText: "Đặt lại",
  cancelText: "Hủy",
  type: "danger",
});
```

## Tính năng:

✅ Đẹp hơn window.confirm() mặc định
✅ 4 loại style: warning, danger, success, info
✅ Icon đẹp với màu sắc phù hợp
✅ Animation mượt mà (slide up + bounce)
✅ Promise-based (async/await)
✅ Responsive (mobile-friendly)
✅ Click overlay để đóng
✅ Customizable texts
✅ Gradient buttons với shadow
✅ Accessibility friendly

## File đã cập nhật:

✅ `MenuManagement.jsx` - Thay `window.confirm()` bằng ConfirmDialog đẹp

Bạn có thể áp dụng tương tự cho các file khác đang dùng `window.confirm()`.
