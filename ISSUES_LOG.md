# Issues Log - Restaurant Management Project

> File này ghi lại các vấn đề phát sinh, nguyên nhân, và giải pháp trong quá trình phát triển

---

## 📅 April 9, 2026

### ✅ Update: Scope lại xác thực tài khoản + theo dõi người sửa cuối 🐍🍎🍎
**Priority:** High  
**Component:** Backend Auth + Admin User Management + Frontend User Table  
**Status:** ✅ Pushed

#### What Was Changed
- Bỏ ghi `VERIFY_USER` vào `admin_action_logs` trong luồng OTP signup.
- Gỡ API admin/system admin cập nhật `is_verified` (`/users/:id/verification`).
- Giữ `is_verified` để FE hiển thị trạng thái tài khoản đã xác thực hay chưa.
- Thêm dữ liệu người chỉnh sửa cuối cùng cho từng user từ `admin_action_logs`.
- FE bảng quản lý user hiển thị thêm:
  - Cột trạng thái xác thực tài khoản.
  - Cột người chỉnh sửa cuối cùng + thời gian chỉnh sửa.

#### Why
- `admin_action_logs` chỉ dùng để lưu hành động cập nhật do admin/system admin thực hiện.
- Tránh trộn log hệ thống OTP với log quản trị.
- Giúp admin nhìn nhanh tình trạng xác thực và ai là người tác động cuối cùng lên tài khoản.

#### Team Rule (MUST) 🐍🍎
- Mỗi lần chỉnh sửa code xong và đã verify ổn, **phải commit + push ngay** để không thất lạc thay đổi.
- Khi có thay đổi nghiệp vụ quan trọng, cập nhật thêm mục tóm tắt tại `ISSUES_LOG.md`.
- Khi fix bug, **phải ghi bug đó vào `ISSUES_LOG.md` ngay trong cùng lần xử lý**, không để dồn sau.

### ✅ Bug Fix: Cột Vai Trò không hiển thị Admin với admin thường 🐍🍎
**Priority:** Medium  
**Component:** Frontend - User Management  
**Status:** ✅ Resolved & Pushed

#### Problem
- Ở cột Vai trò, admin thường chỉ nhìn thấy lựa chọn Khách hàng/Nhân viên.
- Các user đang có role `admin` không được hiển thị đúng trong dropdown đối với admin thường.

#### Root Cause
- Logic filter option role đã ẩn toàn bộ option `admin` khi người đăng nhập không phải `system_admin`.
- Vì vậy dropdown cũng không thể render trạng thái hiện tại là `admin` cho các dòng user admin.

#### Solution
- Điều chỉnh điều kiện filter để:
  - Non-system admin vẫn không thể gán ai đó thành `admin` mới.
  - Nhưng nếu user hiện tại của dòng đã là `admin`, vẫn phải hiển thị option `admin` để phản ánh đúng dữ liệu.

#### Result
- Admin vẫn xem được role admin của nhau trong bảng.
- Quyền phân vai vẫn đúng: chỉ `system_admin` mới được đổi role sang `admin`.

### ✅ Refactor/Fix: Tách helper rõ nghĩa cho logic chọn role 🐍🍎
**Priority:** Medium  
**Component:** Frontend - User Management  
**Status:** ✅ Resolved

#### Problem
- Logic hiển thị option role dùng chain `.filter(...)` dài, khó đọc và khó kiểm soát rule.

#### Solution
- Refactor thành các helper tường minh:
  - `canEditRole(currentUser, targetUser)`
  - `canSeeRoleOption(currentUser, targetUser, roleValue)`
  - `getAssignableRoleOptions(currentUser, targetUser)`
- Giữ đúng business rules:
  - Không cho gán `system_admin` từ dropdown.
  - Không dùng `all` cho assign role.
  - Admin thường chỉ sửa customer/employee.
  - System admin sửa được customer/employee/admin, không sửa target `system_admin`.
  - Nếu dòng hiện tại là `admin`, dropdown vẫn có option `admin` để `value` luôn hợp lệ.

---

## 📅 March 12, 2026

### ❌ Issue: Guest Cart Session Not Persisting
**Priority:** Critical  
**Component:** Backend - Session Management & Cart  
**Status:** ✅ Resolved

#### Problem
```
1. Khi xóa món trong cart → không xóa được
2. Database tạo nhiều dòng cart với session_id khác nhau
3. Khi thêm món mới → món cũ bị thay thế (không cộng dồn)
```

**Behavior:**
- Mỗi API request có session_id khác nhau
- Backend tạo cart mới mỗi lần (vì không nhận diện được session cũ)
- Guest cart không persist giữa các requests

#### Root Cause
1. **`saveUninitialized: false`** trong `session.js` → Session của guest không được lưu vào database
2. **`optionalAuth`** middleware không làm gì → Session không được khởi tạo
3. Session ID thay đổi mỗi request → Backend coi như user mới

#### How Sessions Work
```javascript
// ❌ saveUninitialized: false
// → Session chỉ được lưu KHI CÓ DATA (req.session.userId)
// → Guest users không có userId → Session không lưu → SessionID mới mỗi request

// ✅ saveUninitialized: true
// → Session được lưu NGAY LẬP TỨC khi được tạo
// → Guest users có sessionID persistent → Cart hoạt động đúng
```

#### Solution

**1. Fix session.js:**
```javascript
// backend/src/config/session.js
const sessionConfig = {
  // ... other config
  resave: false,
  saveUninitialized: true,  // ✅ Changed from false to true
  // ...
};
```

**2. Fix optionalAuth middleware:**
```javascript
// backend/src/middlewares/auth.js
const optionalAuth = (req, res, next) => {
  // Đảm bảo session được khởi tạo cho guest users
  if (!req.session.initialized) {
    req.session.initialized = true;
  }
  next();
};
```

#### Why This Works
- `saveUninitialized: true` → Session được lưu vào `user_sessions` table ngay khi tạo
- `req.session.initialized = true` → Force session có data → Đảm bảo được lưu
- SessionID giữ nguyên giữa các requests → Cart.findOrCreateActiveCart() tìm đúng cart
- Guest cart persist → Add/Update/Delete hoạt động bình thường

#### Verification Steps
```sql
-- Check sessions table
SELECT sid, sess, expire FROM user_sessions 
ORDER BY expire DESC LIMIT 5;

-- Check carts with session_id
SELECT id, user_id, session_id, status, created_at 
FROM carts 
WHERE session_id IS NOT NULL;

-- Should see: 1 ACTIVE cart per session_id
```

#### Testing
1. ✅ Clear cookies trong browser
2. ✅ Add item to cart (as guest)
3. ✅ Check Network tab → Cookie `restaurant_session` xuất hiện
4. ✅ Add another item → Same session_id, items cộng dồn
5. ✅ Remove item → Xóa thành công
6. ✅ Refresh page → Cart vẫn còn

#### Lessons Learned
- ⚠️ **`saveUninitialized: false`** chỉ phù hợp khi KHÔNG cần persist guest sessions
- ⚠️ Guest cart/basket features **BẮT BUỘC** phải dùng `saveUninitialized: true`
- ⚠️ Always test session persistence trước khi implement cart/basket
- ⚠️ Middleware `optionalAuth` phải đảm bảo session được khởi tạo

#### Related Config
```javascript
// Frontend - Ensure credentials sent
fetch(url, {
  credentials: 'include',  // ✅ Must have
  // ...
});

// Backend - CORS must allow credentials
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,  // ✅ Must be true
  // ...
}));
```

#### Prevention
- [ ] Document session requirements cho cart/guest features
- [ ] Add session persistence test to test suite
- [ ] Code review: Check session config when implementing guest features

---

### ❌ Issue: Validation Library Mismatch
**Priority:** High  
**Component:** Backend - Cart API Validation  
**Status:** ✅ Resolved

#### Problem
```
Error: Cannot find module 'express-validator'
Error: Route.post() requires a callback function but got a [object Undefined]
```

#### Root Cause
- Tạo `cartValidation.js` sử dụng **express-validator** 
- Nhưng project đang dùng **Joi** cho validation (authValidation.js, menuValidation.js)
- Pattern không nhất quán: `validate(schema)` vs `[validation(), validation()]`

#### Solution
1. ✅ Converted `cartValidation.js` từ express-validator sang Joi schemas
2. ✅ Updated `cartRoutes.js` để dùng pattern `validate(addItemSchema)` 
3. ✅ Removed express-validator dependency
4. ✅ Match với existing validation pattern trong project

#### Code Changes
```javascript
// ❌ Before (express-validator)
const addItemValidation = [
  body('menu_item_id').notEmpty().withMessage('...'),
  body('quantity').optional().isInt({ min: 1, max: 99 })
];

// ✅ After (Joi - matching project pattern)
const addItemSchema = Joi.object({
  menu_item_id: Joi.number().integer().min(1).required(),
  quantity: Joi.number().integer().min(1).max(99).default(1)
});
```

#### Lessons Learned
- ⚠️ **ALWAYS check existing validation patterns** trước khi tạo validation mới
- ⚠️ Kiểm tra `package.json` để biết project đang dùng thư viện nào
- ⚠️ Review existing validation files (authValidation.js, menuValidation.js)
- ⚠️ Follow consistent patterns across the codebase

#### Prevention
- [ ] Document validation pattern trong README.md
- [ ] Add validation template/example
- [ ] Code review checklist: Check validation library consistency

---

## 📋 Project Validation Standards

### Current Stack
- **Validation Library:** Joi (NOT express-validator)
- **Pattern:** `validate(schema)` middleware from `middlewares/validate.js`
- **Schema Location:** `backend/src/validations/*.js`

### Example Template
```javascript
const Joi = require('joi');

const yourSchema = Joi.object({
  field_name: Joi.string().required().messages({
    'any.required': 'Field là bắt buộc'
  })
});

module.exports = { yourSchema };
```

### Route Usage
```javascript
const validate = require('../middlewares/validate');
const { yourSchema } = require('../validations/yourValidation');

router.post('/endpoint', validate(yourSchema), Controller.method);
```

---

## 🔍 Common Issues Checklist

### Before Adding New Features
- [ ] Check existing patterns in similar files
- [ ] Verify library dependencies in package.json
- [ ] Review related middleware/validation files
- [ ] Check if utility functions already exist
- [ ] Ensure naming conventions match project style

### Before Committing
- [ ] Test backend server starts without errors
- [ ] Verify frontend builds successfully
- [ ] Check for unused dependencies
- [ ] Update this log if hitting new issues

---

## 📌 Quick Reference

### Validation Libraries Status
- ✅ **Joi** - Used for validation (auth, menu, cart)
- ❌ **express-validator** - NOT used in this project
- ✅ **express-session** - Used for session management
- ✅ **pg** - PostgreSQL client

### File Structure Patterns
```
backend/src/
  ├── models/         - Database queries
  ├── services/       - Business logic
  ├── controllers/    - HTTP handlers
  ├── routes/         - Express routes
  ├── validations/    - Joi schemas ⚠️
  ├── middlewares/    - Reusable middleware
  └── utils/          - Helper functions
```

---

## 💡 Future Improvements
- [ ] Add ESLint rules to enforce Joi usage
- [ ] Create validation schema generator script
- [ ] Add pre-commit hooks to check dependencies
- [ ] Document all validation patterns in TEAM_GUIDE.md
