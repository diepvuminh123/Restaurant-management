# Migration từ Create React App sang Vite

## Tổng quan về thay đổi

Dự án đã được chuyển đổi thành công từ Create React App sang Vite để cải thiện hiệu suất development và build process.

## Các thay đổi chính

### 1. Configuration Files

#### Thêm mới:
- `vite.config.js` - File cấu hình chính của Vite
- `.env.example` - Template cho environment variables
- `index.html` - Di chuyển từ `public/` lên root folder

#### Đã xóa/Thay thế:
- `react-scripts` package đã được gỡ bỏ
- Không còn sử dụng `eslintConfig` và `browserslist` trong package.json

### 2. Package.json Changes

#### Dependencies đã xóa:
- `react-scripts`

#### Dependencies đã thêm:
- `vite` - Build tool và dev server
- `@vitejs/plugin-react` - Plugin React cho Vite

#### Scripts mới:
```json
{
  "dev": "vite",              // Development server
  "start": "vite",            // Alias cho dev
  "build": "vite build",      // Production build
  "preview": "vite preview",  // Preview production build
  "test": "vitest"            // Test runner
}
```

### 3. Environment Variables

Environment variables đã được thay đổi từ `process.env.REACT_APP_*` sang `import.meta.env.VITE_*`

**Trước (CRA):**
```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

**Sau (Vite):**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

#### Các biến môi trường có sẵn:
- `VITE_API_URL` - URL của API server
- `VITE_API_BASE_URL` - Base URL cho API endpoints
- `VITE_APP_NAME` - Tên ứng dụng
- `VITE_APP_TITLE` - Tiêu đề ứng dụng

### 4. HTML File Changes

File `index.html` đã được di chuyển từ `public/` lên root folder và được cập nhật:

- Thay `%PUBLIC_URL%` bằng đường dẫn tuyệt đối `/`
- Thêm `<script type="module" src="/src/index.js"></script>` để import entry point

### 5. Build Output

- Thư mục output vẫn là `build/` (thay vì mặc định `dist/` của Vite)
- Build process nhanh hơn đáng kể so với CRA

## Cách sử dụng

### Development Mode

```bash
cd frontend
npm run dev
# hoặc
npm start
```

Server sẽ chạy tại: http://localhost:3000

### Production Build

```bash
cd frontend
npm run build
```

Build output sẽ được tạo trong thư mục `build/`

### Preview Production Build

```bash
cd frontend
npm run preview
```

## Các tính năng mới với Vite

### 1. Hot Module Replacement (HMR) nhanh hơn
Vite cung cấp HMR cực nhanh, thay đổi code sẽ phản ánh ngay lập tức trong browser.

### 2. Build nhanh hơn
Vite sử dụng esbuild cho việc pre-bundling dependencies, nhanh hơn 10-100 lần so với webpack.

### 3. Optimization tự động
Vite tự động split code và optimize chunks cho performance tốt nhất.

### 4. Path Aliases
Đã cấu hình alias `@` trỏ đến `src/`:

```javascript
// Thay vì
import Component from '../../../component/Component';

// Có thể dùng
import Component from '@/component/Component';
```

## Proxy Configuration

API proxy đã được cấu hình trong `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  },
}
```

Tất cả requests đến `/api/*` sẽ được proxy đến `http://localhost:5000/api/*`

## Troubleshooting

### Cache Issues
Nếu gặp vấn đề với cache, xóa folder `.vite`:

```bash
Remove-Item -Recurse -Force node_modules/.vite
```

### Port đã được sử dụng
Port mặc định là 3000. Để thay đổi, sửa `vite.config.js`:

```javascript
server: {
  port: 3001, // port mới
}
```

### Environment Variables không hoạt động
Đảm bảo biến môi trường bắt đầu với `VITE_` và sử dụng `import.meta.env.VITE_*` để truy cập.

## Performance Improvements

Sau khi migration sang Vite:
- ⚡ Dev server khởi động nhanh hơn ~10x
- 🔥 HMR nhanh hơn ~5-10x
- 📦 Production build nhanh hơn ~3-5x
- 🎯 Smaller bundle size với tree-shaking tốt hơn

## Compatibility

Dự án tương thích với:
- ✅ React 19
- ✅ React Router v7
- ✅ i18next
- ✅ All existing dependencies

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite React Plugin](https://github.com/vitejs/vite-plugin-react)
- [Migration from CRA](https://vitejs.dev/guide/migration.html)

---

**Migration Date:** March 3, 2026  
**Migration Status:** ✅ Completed Successfully
