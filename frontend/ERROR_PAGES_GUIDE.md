# 🚫 Error Pages - Trang Lỗi

## Đã tạo 2 trang lỗi đẹp với tone màu nhà hàng:

### 1️⃣ **Error 404 - Page Not Found**
📁 `frontend/src/screen/Error404/`

**Thiết kế:**
- ✨ Balloon (bóng bay) tĩnh, không animation
- ☁️ Clouds (mây) tĩnh
- 🎨 Background text "error" mờ phía sau
- 📱 Responsive design
- 🎯 **KHÔNG có hiệu ứng di chuyển hay phát sáng**

**Khi nào hiển thị:**
- User truy cập vào URL không tồn tại
- Route không được định nghĩa

**Ví dụ:**
```
http://localhost:3000/abcxyz
http://localhost:3000/random-page
```

**Tính năng:**
- Button "← GO BACK" - Quay lại trang trước
- Button "GO HOME" - Về trang chủ
- Copyright footer
- **Đã xóa tất cả animations (balloon float, cloud float)**

---

### 2️⃣ **Error 403 - Unauthorized (Không có quyền truy cập)**
📁 `frontend/src/screen/Unauthorized/`

**Thiết kế - Tone màu Nhà hàng:**
- 🔐 Lock icon màu cam đất (#D36C2F) - tĩnh, không rung
- 🌟 Particles tĩnh (không bay)
- 🎨 Background: Be kem gradient (#fbf8f1 → #f5ede0)
- 💎 Card trắng đơn giản (không glassmorphism)
- 📱 Fully responsive
- 🎯 **KHÔNG có hiệu ứng di chuyển, phát sáng, rung**

**Màu sắc:**
- Background: `#fbf8f1` → `#f5ede0` (be kem)
- Accent: `#D36C2F` (cam đất)
- Particles: `rgba(211, 108, 47, 0.2)` (cam đất nhạt)
- Buttons: Cam đất `#D36C2F`

**Khi nào hiển thị:**
- User không có quyền truy cập trang admin
- User chưa đăng nhập cố vào trang protected

**Ví dụ:**
```javascript
// Trong App.js - User thường cố vào /admin
<Route 
  path="/admin/*" 
  element={
    user && user.role === 'admin' ? 
    <AdminDashboard /> : 
    <Unauthorized />  // ← Hiển thị trang này
  } 
/>
```

**Tính năng:**
- 🔐 Lock icon tĩnh màu cam đất
- 🛡️ Shield icon báo lỗi quyền truy cập
- 📊 Error code 403 màu cam đất
- 💡 Info box nền be kem với border cam
- 🔙 Button "Quay lại" - Border cam, hover solid cam
- 🏠 Button "Trang chủ" - Solid cam
- 📧 Email contact: admin@restaurant.com (màu cam)
- **Đã xóa tất cả animations (particles float, lock shake, pulse glow, slide up)**

---

## 🎨 Thay đổi đã thực hiện:

### ✅ Error 404:
1. ❌ Removed: `animation: balloonFloat` trên balloon
2. ❌ Removed: `@keyframes balloonFloat`
3. ❌ Removed: `animation: float` trên clouds
4. ❌ Removed: `@keyframes float`
5. ❌ Removed: `transform: translateY(-2px)` trên buttons hover
6. ✅ Giữ nguyên: Shadow effects (không phát sáng)

### ✅ Unauthorized (403):
1. ❌ Removed: `animation: particleFloat` trên particles
2. ❌ Removed: `@keyframes particleFloat`
3. ❌ Removed: `.lock-glow` (glow effect)
4. ❌ Removed: `@keyframes pulse`
5. ❌ Removed: `animation: lockShake` trên lock icon
6. ❌ Removed: `@keyframes lockShake`
7. ❌ Removed: `animation: slideUp` trên content
8. ❌ Removed: `@keyframes slideUp`
9. ❌ Removed: `backdrop-filter: blur(10px)` (glassmorphism)
10. ❌ Removed: `transform: translateY(-2px)` trên buttons hover
11. ✅ Changed: Purple gradient → Be kem gradient
12. ✅ Changed: Purple icons → Cam đất (#D36C2F)
13. ✅ Changed: All accents → Cam đất
14. ✅ Changed: Particles white → Cam đất nhạt

---

## 🎨 Color Schemes:

### Error 404 (Unchanged):
- Background: Light gray gradient (#f5f7fa → #e8ebf0)
- Balloon: Red/Orange (#ff6b6b → #ee5a6f)
- Text: Dark gray (#2d3748)
- Buttons: White & Red gradient

### Unauthorized (NEW - Restaurant Theme):
- Background: **Be kem** (#fbf8f1 → #f5ede0)
- Accent: **Cam đất** (#D36C2F)
- Lock Icon: **Cam đất** (#D36C2F)
- Particles: **Cam đất nhạt** (rgba(211, 108, 47, 0.2))
- Buttons: **Cam đất** (#D36C2F)
- Hover: **Cam đậm** (#b85a26)
- Info Box: **Nền be kem** (#fbf8f1)
- Border: **Cam đất** (#D36C2F)

---

## 📝 Cách sử dụng:

### 1. Truy cập trực tiếp:
```
http://localhost:3000/404      → Error 404 page
http://localhost:3000/403      → Unauthorized page
```

### 2. Tự động redirect:

**404 - URL không tồn tại:**
```javascript
// App.js đã setup catch-all route
<Route path="*" element={<Error404 />} />
```

**403 - Không có quyền:**
```javascript
// Ví dụ: User thường cố vào admin
{user.role !== 'admin' && <Unauthorized />}
```

---

## 🎯 Features Overview:

| Feature | Error 404 | Unauthorized |
|---------|-----------|--------------|
| **Animations** | ❌ None (Removed) | ❌ None (Removed) |
| **Responsive** | ✅ Yes | ✅ Yes |
| **Icons** | 🎈 CSS Balloon | 🔐 Lock + Shield (React Icons) |
| **Background** | Gray gradient | **Be kem gradient** |
| **Accent Color** | Red/Orange | **Cam đất (#D36C2F)** |
| **Info Box** | ❌ No | ✅ Yes (be kem bg) |
| **Email Link** | ❌ No | ✅ Yes (cam color) |
| **Glassmorphism** | ❌ No | ❌ No (Removed) |
| **Particles** | ❌ No | ✅ Static (cam color) |
| **Glow Effects** | ❌ No | ❌ No (Removed) |

---

## 🚀 Đã setup trong App.js:

```javascript
import Error404 from './screen/Error404/Error404';
import Unauthorized from './screen/Unauthorized/Unauthorized';

// Routes
<Route path="/404" element={<Error404 />} />
<Route path="/403" element={<Unauthorized />} />
<Route path="*" element={<Error404 />} />  // Catch all

// Protected route example
<Route 
  path="/admin/*" 
  element={
    user?.role === 'admin' ? 
    <AdminDashboard /> : 
    <Unauthorized />  // Show if not admin
  } 
/>
```

---

## 📱 Test Cases:

### ✅ Error 404:
1. Truy cập `/random-url-not-exist` → Hiện 404
2. Truy cập `/abcxyz` → Hiện 404
3. Click "GO BACK" → Quay lại trang trước
4. Click "GO HOME" → Về trang chủ
5. ✅ Balloon và clouds KHÔNG di chuyển

### ✅ Unauthorized:
1. Truy cập `/403` → Hiện Unauthorized (màu be kem + cam)
2. User thường truy cập `/admin` → Hiện Unauthorized
3. Click "Quay lại" → Quay về trang trước
4. Click "Trang chủ" → Về home
5. Click email link → Mở mail client
6. ✅ Lock icon KHÔNG rung
7. ✅ Particles KHÔNG bay
8. ✅ KHÔNG có glow effect
9. ✅ Màu sắc phù hợp với tone nhà hàng

---

## 🎨 Design Summary:

- **Error 404:** Clean, simple design với balloon tĩnh
- **Unauthorized:** Restaurant theme (be kem + cam đất), không animations, chuyên nghiệp
- **NO Animations:** Tất cả hiệu ứng di chuyển và phát sáng đã được xóa
- **Restaurant Colors:** Phù hợp với tone màu chủ đạo của nhà hàng

Clean & Professional! 🎉

### 1️⃣ **Error 404 - Page Not Found**
📁 `frontend/src/screen/Error404/`

**Thiết kế:**
- ✨ Balloon (bóng bay) bay lơ lửng với animation
- ☁️ Clouds (mây) floating background
- 🎨 Background text "error" mờ phía sau
- 📱 Responsive design
- 🎭 Smooth animations (balloon float, clouds float)

**Khi nào hiển thị:**
- User truy cập vào URL không tồn tại
- Route không được định nghĩa

**Ví dụ:**
```
http://localhost:3000/abcxyz
http://localhost:3000/random-page
```

**Tính năng:**
- Button "← GO BACK" - Quay lại trang trước
- Button "🏠 GO HOME" - Về trang chủ
- Copyright footer

---

### 2️⃣ **Error 403 - Unauthorized (Không có quyền truy cập)**
📁 `frontend/src/screen/Unauthorized/`

**Thiết kế:**
- 🔐 Lock icon với shield animation
- 🌟 Animated particles background (8 particles bay lơ lửng)
- 🎨 Gradient purple background (667eea → 764ba2)
- 💎 Glassmorphism card design
- 📱 Fully responsive
- ✨ Smooth entrance animation

**Khi nào hiển thị:**
- User không có quyền truy cập trang admin
- User chưa đăng nhập cố vào trang protected

**Ví dụ:**
```javascript
// Trong App.js - User thường cố vào /admin
<Route 
  path="/admin/*" 
  element={
    user && user.role === 'admin' ? 
    <AdminDashboard /> : 
    <Unauthorized />  // ← Hiển thị trang này
  } 
/>
```

**Tính năng:**
- 🔐 Lock icon với glow effect và shake animation
- 🛡️ Shield icon báo lỗi quyền truy cập
- 📊 Error code 403 gradient text
- 💡 Info box hướng dẫn user
- 🔙 Button "Quay lại" - Quay về trang trước
- 🏠 Button "Trang chủ" - Về home
- 📧 Email contact: admin@restaurant.com

---

## 🎨 Tính năng chung:

### ✅ Animations:
- **Error 404:**
  - Balloon floating (lên xuống mượt)
  - Clouds floating (bay chậm)
  - Smooth hover effects on buttons

- **Unauthorized:**
  - Particles floating (8 particles bay tự do)
  - Lock shake animation (rung nhẹ)
  - Pulse glow effect (nhấp nháy)
  - Slide up entrance animation

### ✅ Responsive Design:
- Desktop (> 768px) - Full layout
- Tablet (768px) - Adjusted spacing
- Mobile (< 480px) - Stacked buttons, smaller icons

### ✅ Color Schemes:
- **Error 404:** 
  - Background: Light gray gradient (#f5f7fa → #e8ebf0)
  - Accent: Red/Orange (#ff6b6b → #ee5a6f)
  - Text: Dark gray (#2d3748)

- **Unauthorized:**
  - Background: Purple gradient (#667eea → #764ba2)
  - Card: White with glassmorphism
  - Accent: Purple (#667eea)
  - Icons: Purple & Red

---

## 📝 Cách sử dụng:

### 1. Truy cập trực tiếp:
```
http://localhost:3000/404      → Error 404 page
http://localhost:3000/403      → Unauthorized page
```

### 2. Tự động redirect:

**404 - URL không tồn tại:**
```javascript
// App.js đã setup catch-all route
<Route path="*" element={<Error404 />} />
```

**403 - Không có quyền:**
```javascript
// Ví dụ: User thường cố vào admin
{user.role !== 'admin' && <Unauthorized />}
```

### 3. Programmatic navigation:
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Redirect đến 404
navigate('/404');

// Redirect đến 403
navigate('/403');
```

---

## 🔧 Customization:

### Thay đổi màu sắc Error 404:
```css
/* Error404.css */
.btn-go-home {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### Thay đổi màu sắc Unauthorized:
```css
/* Unauthorized.css */
.unauthorized-container {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### Thay đổi email contact:
```jsx
// Unauthorized.jsx
<a href="mailto:YOUR_EMAIL@domain.com">YOUR_EMAIL@domain.com</a>
```

---

## 🎯 Features Overview:

| Feature | Error 404 | Unauthorized |
|---------|-----------|--------------|
| **Animations** | ✅ Balloon, Clouds | ✅ Particles, Lock shake |
| **Responsive** | ✅ Yes | ✅ Yes |
| **Icons** | ❌ No icons | ✅ React Icons (Lock, Shield, Home, Arrow) |
| **Background** | Gray gradient | Purple gradient + particles |
| **Info Box** | ❌ No | ✅ Yes |
| **Email Link** | ❌ No | ✅ Yes |
| **Glassmorphism** | ❌ No | ✅ Yes |

---

## 🚀 Đã setup trong App.js:

```javascript
import Error404 from './screen/Error404/Error404';
import Unauthorized from './screen/Unauthorized/Unauthorized';

// Routes
<Route path="/404" element={<Error404 />} />
<Route path="/403" element={<Unauthorized />} />
<Route path="*" element={<Error404 />} />  // Catch all

// Protected route example
<Route 
  path="/admin/*" 
  element={
    user?.role === 'admin' ? 
    <AdminDashboard /> : 
    <Unauthorized />  // Show if not admin
  } 
/>
```

---

## 📱 Test Cases:

### ✅ Error 404:
1. Truy cập `/random-url-not-exist` → Hiện 404
2. Truy cập `/abcxyz` → Hiện 404
3. Click "GO BACK" → Quay lại trang trước
4. Click "GO HOME" → Về trang chủ

### ✅ Unauthorized:
1. Truy cập `/403` → Hiện Unauthorized
2. User thường truy cập `/admin` → Hiện Unauthorized
3. Click "Quay lại" → Quay về trang trước
4. Click "Trang chủ" → Về home
5. Click email link → Mở mail client

---

## 🎨 Design Credits:

- **Error 404:** Inspired by modern error pages with playful balloon design
- **Unauthorized:** Custom design with glassmorphism and particle effects
- **Icons:** React Icons (io5)
- **Animations:** CSS keyframes
- **Gradients:** Modern color schemes

Enjoy! 🎉
