# Hướng dẫn sử dụng react-i18next

## Đã cài đặt thành công! 🎉

### Cấu trúc thư mục đã tạo:

```
frontend/src/
├── i18n.js                          # File cấu hình i18next
├── locales/
│   ├── vi/
│   │   └── translation.json         # Bản dịch tiếng Việt
│   └── en/
│       └── translation.json         # Bản dịch tiếng Anh
└── component/
    └── LanguageSwitcher/
        ├── LanguageSwitcher.jsx     # Component chuyển đổi ngôn ngữ
        └── LanguageSwitcher.css     # CSS cho component
```

## Cách sử dụng trong các component:

### 1. Sử dụng hook useTranslation:

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('menu.title')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### 2. Sử dụng với interpolation (truyền biến vào text):

Thêm vào file translation.json:
```json
{
  "greeting": "Xin chào, {{name}}!",
  "itemCount": "Bạn có {{count}} sản phẩm trong giỏ"
}
```

Sử dụng trong component:
```jsx
const { t } = useTranslation();

<p>{t('greeting', { name: 'Minh' })}</p>
// Kết quả: "Xin chào, Minh!"

<p>{t('itemCount', { count: 5 })}</p>
// Kết quả: "Bạn có 5 sản phẩm trong giỏ"
```

### 3. Sử dụng với pluralization (số nhiều):

Trong translation.json:
```json
{
  "item": "sản phẩm",
  "item_one": "{{count}} sản phẩm",
  "item_other": "{{count}} sản phẩm"
}
```

### 4. Thêm LanguageSwitcher vào component của bạn:

```jsx
import LanguageSwitcher from './component/LanguageSwitcher/LanguageSwitcher';

function Header() {
  return (
    <header>
      <nav>
        {/* Các element khác */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

### 5. Lấy và thay đổi ngôn ngữ hiện tại:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  // Lấy ngôn ngữ hiện tại
  const currentLanguage = i18n.language; // 'vi' hoặc 'en'

  // Thay đổi ngôn ngữ
  const switchToEnglish = () => {
    i18n.changeLanguage('en');
  };

  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <button onClick={switchToEnglish}>Switch to English</button>
    </div>
  );
}
```

## Thêm bản dịch mới:

### Cách 1: Thêm vào file translation.json có sẵn

Mở file `src/locales/vi/translation.json` hoặc `src/locales/en/translation.json` và thêm:

```json
{
  "common": {
    "welcome": "Chào mừng",
    // Thêm key mới tại đây
    "yourNewKey": "Nội dung của bạn"
  },
  // Hoặc thêm một namespace mới
  "newSection": {
    "title": "Tiêu đề mới",
    "content": "Nội dung mới"
  }
}
```

### Cách 2: Tách file translation theo tính năng

Nếu dự án lớn, bạn có thể tách thành nhiều file:

```
locales/
├── vi/
│   ├── common.json
│   ├── auth.json
│   ├── menu.json
│   └── admin.json
└── en/
    ├── common.json
    ├── auth.json
    ├── menu.json
    └── admin.json
```

Sau đó cập nhật `i18n.js`:

```javascript
import commonVi from './locales/vi/common.json';
import authVi from './locales/vi/auth.json';
// ... import các file khác

const resources = {
  vi: {
    common: commonVi,
    auth: authVi,
    // ...
  },
  en: {
    // tương tự
  }
};
```

Sử dụng với namespace:
```jsx
const { t } = useTranslation('auth'); // Chỉ định namespace
<p>{t('loginTitle')}</p> // Sử dụng trực tiếp key trong namespace
```

## Tips & Best Practices:

1. **Đặt tên key rõ ràng và có cấu trúc**: Sử dụng nested objects để nhóm các key liên quan
2. **Giữ consistency**: Đảm bảo tất cả các bản dịch có cùng cấu trúc key
3. **Sử dụng fallback**: Luôn có một ngôn ngữ fallback (đã cấu hình là 'vi')
4. **Lazy loading**: Với dự án lớn, xem xét lazy load các bản dịch
5. **Context và comments**: Trong file JSON, có thể thêm key với hậu tố `_context` để giải thích

## Ví dụ thực tế cho dự án Restaurant Management:

```jsx
// HomeScreen.jsx
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../component/LanguageSwitcher/LanguageSwitcher';

function HomeScreen() {
  const { t } = useTranslation();

  return (
    <div>
      <header>
        <LanguageSwitcher />
      </header>
      <h1>{t('common.welcome')}</h1>
      <nav>
        <a href="/menu">{t('common.menu')}</a>
        <a href="/reservation">{t('common.reservation')}</a>
      </nav>
    </div>
  );
}
```

## Kiểm tra cài đặt:

Chạy lệnh để start frontend:
```bash
cd frontend
npm start
```

Ngôn ngữ sẽ được tự động lưu vào localStorage và giữ nguyên khi reload trang.

## Troubleshooting:

Nếu gặp lỗi "Cannot find module", hãy chắc chắn:
1. Đã import `./i18n` trong `index.js`
2. Các file translation.json đã được tạo đúng đường dẫn
3. Chạy lại `npm install` nếu cần

Happy coding! 🚀
